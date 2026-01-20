import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import { 
  calculateAssessmentScore, 
  calculateImprovement,
  generateAssessmentReport,
  questionTypes 
} from '../data/customAssessmentEngine';

const CustomAssessment = () => {
  const { courseId, testType } = useParams(); // testType: 'pre' or 'post'
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [stage, setStage] = useState('intro'); // intro, assessment, submitting, completed
  const [error, setError] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Auth check
      if (!auth.isLoggedIn()) {
        navigate('/login');
        return;
      }

      if (auth.isAdmin()) {
        navigate('/admin');
        return;
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // Load course and assessment
      try {
        const storedCourses = localStorage.getItem('kafaat-custom-courses');
        if (!storedCourses) {
          setError(language === 'en' ? 'Course not found' : 'الدورة غير موجودة');
          setLoading(false);
          return;
        }

        const courses = JSON.parse(storedCourses);
        const foundCourse = courses.find(c => c.id === courseId);
        
        if (!foundCourse) {
          setError(language === 'en' ? 'Course not found' : 'الدورة غير موجودة');
          setLoading(false);
          return;
        }

        setCourse(foundCourse);

        // Find active assessment
        const activeAssessment = foundCourse.assessments?.find(a => a.status === 'active');
        if (!activeAssessment) {
          setError(language === 'en' ? 'No active assessment for this course' : 'لا يوجد تقييم نشط لهذه الدورة');
          setLoading(false);
          return;
        }

        setAssessment(activeAssessment);

        // Get questions based on test type
        const testQuestions = testType === 'pre' 
          ? activeAssessment.questions.preTest 
          : activeAssessment.questions.postTest;

        if (!testQuestions || testQuestions.length === 0) {
          setError(language === 'en' ? 'No questions available' : 'لا توجد أسئلة متاحة');
          setLoading(false);
          return;
        }

        setQuestions(testQuestions);

        // Check if user has already completed this test
        const existingReport = currentUser.reports?.find(r => 
          r.assessmentType === 'custom' && 
          r.data?.courseId === courseId && 
          r.data?.testType === testType
        );

        if (existingReport) {
          setError(language === 'en' 
            ? `You have already completed the ${testType === 'pre' ? 'pre-test' : 'post-test'} for this course`
            : `لقد أكملت بالفعل ${testType === 'pre' ? 'الاختبار القبلي' : 'الاختبار البعدي'} لهذه الدورة`);
          setLoading(false);
          return;
        }

        // For post-test, check if pre-test was completed
        if (testType === 'post') {
          const preTestReport = currentUser.reports?.find(r =>
            r.assessmentType === 'custom' &&
            r.data?.courseId === courseId &&
            r.data?.testType === 'pre'
          );

          if (!preTestReport) {
            setError(language === 'en' 
              ? 'Please complete the pre-test before taking the post-test'
              : 'يرجى إكمال الاختبار القبلي قبل أخذ الاختبار البعدي');
            setLoading(false);
            return;
          }
        }

      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(language === 'en' ? 'Error loading assessment' : 'خطأ في تحميل التقييم');
      }

      setLoading(false);
    };

    init();
  }, [courseId, testType, navigate, language]);

  const startAssessment = () => {
    setStage('assessment');
    setTimeStarted(new Date());
  };

  const handleAnswer = (answer) => {
    const currentQ = questions[currentQuestion];
    
    // Update or add response
    const existingIndex = responses.findIndex(r => r.questionId === currentQ.id);
    if (existingIndex >= 0) {
      const updated = [...responses];
      updated[existingIndex] = { questionId: currentQ.id, answer };
      setResponses(updated);
    } else {
      setResponses([...responses, { questionId: currentQ.id, answer }]);
    }
  };

  const getCurrentAnswer = () => {
    const response = responses.find(r => r.questionId === questions[currentQuestion]?.id);
    return response?.answer;
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (responses.length < questions.length) {
      const unanswered = questions.length - responses.length;
      if (!window.confirm(
        language === 'en' 
          ? `You have ${unanswered} unanswered questions. Submit anyway?`
          : `لديك ${unanswered} أسئلة غير مجابة. هل تريد الإرسال على أي حال؟`
      )) {
        return;
      }
    }

    setStage('submitting');

    try {
      // Calculate score
      const score = calculateAssessmentScore(responses, questions);
      const timeCompleted = new Date();
      const duration = Math.round((timeCompleted - timeStarted) / 60000); // minutes

      // Prepare report data
      const reportData = {
        courseId,
        courseName: course.title,
        testType,
        score,
        responses,
        timeStarted: timeStarted.toISOString(),
        timeCompleted: timeCompleted.toISOString(),
        duration,
        assessmentId: assessment.id
      };

      // If this is post-test, generate comprehensive report
      if (testType === 'post') {
        // Find pre-test results
        const updatedUser = await auth.getCurrentUser();
        const preTestReport = updatedUser.reports?.find(r =>
          r.assessmentType === 'custom' &&
          r.data?.courseId === courseId &&
          r.data?.testType === 'pre'
        );

        if (preTestReport) {
          const improvement = calculateImprovement(preTestReport.data.score, score);
          const fullReport = generateAssessmentReport(
            user,
            course,
            preTestReport.data.score,
            score,
            language
          );

          reportData.improvement = improvement;
          reportData.fullReport = fullReport;
        }
      }

      // Save report
      const saveResult = await auth.saveUserReport(user.id, 'custom', reportData);
      
      if (!saveResult?.success) {
        throw new Error('Failed to save report');
      }

      setStage('completed');

      // Navigate to thank you page after delay
      setTimeout(() => {
        navigate(`/custom-thank-you/${courseId}/${testType}`);
      }, 2000);

    } catch (err) {
      console.error('Error submitting assessment:', err);
      alert(language === 'en' ? 'Error submitting assessment. Please try again.' : 'خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.');
      setStage('assessment');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Loading assessment...' : 'جاري تحميل التقييم...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-kafaat-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800"
          >
            {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
          </button>
        </div>
      </div>
    );
  }

  // Intro stage
  if (stage === 'intro') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} />
        
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className={`w-20 h-20 ${testType === 'pre' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <span className="text-4xl">{testType === 'pre' ? '📋' : '📝'}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {testType === 'pre' 
                ? (language === 'en' ? 'Pre-Training Assessment' : 'تقييم ما قبل التدريب')
                : (language === 'en' ? 'Post-Training Assessment' : 'تقييم ما بعد التدريب')}
            </h1>
            
            <p className="text-lg text-purple-600 font-medium mb-4">
              {course?.title?.[language] || course?.title?.en}
            </p>
            
            <p className="text-gray-600 mb-8">
              {testType === 'pre'
                ? (language === 'en' 
                    ? 'This assessment measures your current knowledge before the training. Answer honestly to get accurate baseline results.'
                    : 'يقيس هذا التقييم معرفتك الحالية قبل التدريب. أجب بصدق للحصول على نتائج أساسية دقيقة.')
                : (language === 'en'
                    ? 'This assessment measures your knowledge after completing the training. Your results will be compared to your pre-test.'
                    : 'يقيس هذا التقييم معرفتك بعد إكمال التدريب. سيتم مقارنة نتائجك باختبارك القبلي.')}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-2xl block mb-1">📝</span>
                <span className="text-sm text-gray-600">
                  {questions.length} {language === 'en' ? 'Questions' : 'سؤال'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-2xl block mb-1">⏱️</span>
                <span className="text-sm text-gray-600">
                  {Math.ceil(questions.length * 1.5)} {language === 'en' ? 'minutes (approx)' : 'دقيقة (تقريباً)'}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <span>💡</span>
                {language === 'en' ? 'Instructions' : 'التعليمات'}
              </h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• {language === 'en' ? 'Read each question carefully before answering' : 'اقرأ كل سؤال بعناية قبل الإجابة'}</li>
                <li>• {language === 'en' ? 'You can navigate between questions' : 'يمكنك التنقل بين الأسئلة'}</li>
                <li>• {language === 'en' ? 'All questions must be answered before submission' : 'يجب الإجابة على جميع الأسئلة قبل الإرسال'}</li>
                <li>• {language === 'en' ? 'You cannot retake this test once submitted' : 'لا يمكنك إعادة هذا الاختبار بعد الإرسال'}</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={startAssessment}
                className={`flex-1 py-3 ${testType === 'pre' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg font-medium`}
              >
                {language === 'en' ? 'Start Assessment' : 'بدء التقييم'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment stage
  if (stage === 'assessment') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = responses.length;

    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Header */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {language === 'en' ? 'Question' : 'السؤال'} {currentQuestion + 1} / {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {answeredCount} {language === 'en' ? 'answered' : 'تم الإجابة'}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${testType === 'pre' ? 'bg-blue-600' : 'bg-green-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            {/* Question Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{questionTypes[question.type]?.icon || '❓'}</span>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {questionTypes[question.type]?.[language] || question.type}
              </span>
              <span className="text-sm text-gray-400">
                {question.points} {language === 'en' ? 'points' : 'نقاط'}
              </span>
            </div>

            {/* Scenario (if applicable) */}
            {question.scenario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800">{question.scenario[language] || question.scenario.en}</p>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              {question.question?.[language] || question.question?.en}
            </h2>

            {/* Answer Options */}
            {question.type === 'multipleChoice' || question.type === 'scenario' ? (
              <div className="space-y-3">
                {question.options?.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      getCurrentAnswer() === option.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      getCurrentAnswer() === option.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{option.text?.[language] || option.text?.en}</span>
                  </button>
                ))}
              </div>
            ) : question.type === 'trueFalse' ? (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className={`flex-1 p-6 rounded-lg border-2 text-center transition-all ${
                    getCurrentAnswer() === true
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl block mb-2">✓</span>
                  <span className="font-medium">{language === 'en' ? 'True' : 'صح'}</span>
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className={`flex-1 p-6 rounded-lg border-2 text-center transition-all ${
                    getCurrentAnswer() === false
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl block mb-2">✗</span>
                  <span className="font-medium">{language === 'en' ? 'False' : 'خطأ'}</span>
                </button>
              </div>
            ) : question.type === 'shortAnswer' ? (
              <textarea
                value={getCurrentAnswer() || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:ring-0 min-h-[150px]"
                placeholder={language === 'en' ? 'Type your answer here...' : 'اكتب إجابتك هنا...'}
              />
            ) : null}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isRTL ? '→' : '←'}</span>
              {language === 'en' ? 'Previous' : 'السابق'}
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className={`px-8 py-3 ${testType === 'pre' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg font-medium flex items-center gap-2`}
              >
                {language === 'en' ? 'Submit Assessment' : 'إرسال التقييم'}
                <span>✓</span>
              </button>
            ) : (
              <button
                onClick={goToNext}
                className="px-6 py-3 bg-kafaat-navy text-white rounded-lg font-medium hover:bg-blue-800 flex items-center gap-2"
              >
                {language === 'en' ? 'Next' : 'التالي'}
                <span>{isRTL ? '←' : '→'}</span>
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-3">{language === 'en' ? 'Question Navigator' : 'مستكشف الأسئلة'}</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = responses.some(r => r.questionId === q.id);
                const isCurrent = idx === currentQuestion;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-purple-600 text-white'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Submitting state
  if (stage === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Submitting your assessment...' : 'جاري إرسال تقييمك...'}</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (stage === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Assessment Completed!' : 'تم إكمال التقييم!'}
          </h1>
          <p className="text-gray-600">{language === 'en' ? 'Redirecting...' : 'جاري إعادة التوجيه...'}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default CustomAssessment;
