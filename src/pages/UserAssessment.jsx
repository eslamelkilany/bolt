import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import { kafaatQuestionBank } from '../data/kafaatQuestions';
import { leadership360Questions, leadership360Categories, ratingScale } from '../data/leadership360Questions';

const UserAssessment = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [user, setUser] = useState(null);
  const [stage, setStage] = useState('intro'); // intro, assessment, submitting
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For 360 assessment
  const [managerInfo, setManagerInfo] = useState({ name: '', department: '', position: '' });
  const [evaluatorRelationship, setEvaluatorRelationship] = useState('colleague');

  useEffect(() => {
    // Check authentication
    if (!auth.isLoggedIn()) {
      navigate('/login');
      return;
    }

    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      auth.logout();
      navigate('/login');
      return;
    }

    // Redirect admin to admin dashboard
    if (currentUser.role === 'admin') {
      auth.logout();
      navigate('/admin-login');
      return;
    }

    // Check if user has access to this assessment
    if (!auth.canAccessAssessment(type)) {
      setError(language === 'en' 
        ? 'You do not have access to this assessment'
        : 'ليس لديك صلاحية الوصول لهذا التقييم'
      );
      setLoading(false);
      return;
    }

    // Check if user has tokens
    if (!auth.hasAvailableTokens()) {
      setError(language === 'en' 
        ? 'You have no assessment tokens available. Please contact your administrator.'
        : 'لا توجد رموز تقييم متاحة. يرجى التواصل مع المسؤول.'
      );
      setLoading(false);
      return;
    }

    // Check if already completed
    if (auth.hasCompletedAssessment(type)) {
      setError(language === 'en' 
        ? 'You have already completed this assessment'
        : 'لقد أكملت هذا التقييم بالفعل'
      );
      setLoading(false);
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate, type, language]);

  const questions = type === 'kafaat' ? kafaatQuestionBank : leadership360Questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Handle Kafaat answer
  const handleKafaatAnswer = (optionIndex) => {
    const question = questions[currentQuestion];
    const option = question.options[language][optionIndex];
    
    const newResponse = {
      questionId: question.id,
      competency: question.competency,
      selectedOption: optionIndex,
      score: option.score,
      maxScore: 5
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment(updatedResponses);
    }
  };

  // Handle 360 rating
  const handleRating = (rating) => {
    const question = questions[currentQuestion];
    
    const newResponse = {
      questionId: question.id,
      category: question.category,
      rating: rating
    };
    
    const existingIndex = responses.findIndex(r => r.questionId === question.id);
    let newResponses;
    
    if (existingIndex >= 0) {
      newResponses = [...responses];
      newResponses[existingIndex] = newResponse;
    } else {
      newResponses = [...responses, newResponse];
    }
    
    setResponses(newResponses);
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submit360Assessment = () => {
    if (responses.length < questions.length) {
      alert(language === 'en' 
        ? 'Please answer all questions before submitting.' 
        : 'يرجى الإجابة على جميع الأسئلة قبل الإرسال.'
      );
      return;
    }
    submitAssessment(responses);
  };

  const submitAssessment = (finalResponses) => {
    setStage('submitting');

    let reportData;

    if (type === 'kafaat') {
      // Calculate Kafaat scores
      const competencyScores = {};
      const competencyNames = {
        leadership_fundamentals: { en: 'Leadership Fundamentals', ar: 'أساسيات القيادة' },
        change_management: { en: 'Change Management', ar: 'إدارة التغيير' },
        performance_management: { en: 'Performance Management', ar: 'إدارة الأداء' },
        team_building: { en: 'Team Building', ar: 'بناء الفرق' },
        communication: { en: 'Communication', ar: 'التواصل' },
        problem_solving: { en: 'Problem Solving', ar: 'حل المشكلات' },
        emotional_intelligence: { en: 'Emotional Intelligence', ar: 'الذكاء العاطفي' },
        strategic_implementation: { en: 'Strategic Implementation', ar: 'التنفيذ الاستراتيجي' }
      };

      finalResponses.forEach(response => {
        if (!competencyScores[response.competency]) {
          competencyScores[response.competency] = { total: 0, count: 0, maxTotal: 0 };
        }
        competencyScores[response.competency].total += response.score;
        competencyScores[response.competency].count += 1;
        competencyScores[response.competency].maxTotal += response.maxScore;
      });

      const competencyResults = Object.entries(competencyScores).map(([key, value]) => ({
        key,
        name: competencyNames[key],
        score: Math.round((value.total / value.maxTotal) * 100),
        average: (value.total / value.count).toFixed(1)
      }));

      const sorted = [...competencyResults].sort((a, b) => b.score - a.score);
      const strengths = sorted.slice(0, 3);
      const developmentAreas = sorted.slice(-3).reverse();

      const overallScore = Math.round(
        competencyResults.reduce((sum, c) => sum + c.score, 0) / competencyResults.length
      );

      reportData = {
        overallScore,
        competencies: competencyResults,
        strengths,
        developmentAreas,
        totalQuestions: questions.length,
        responses: finalResponses
      };
    } else {
      // Calculate 360 scores
      const categoryScores = {};
      
      finalResponses.forEach(response => {
        if (!categoryScores[response.category]) {
          categoryScores[response.category] = { total: 0, count: 0 };
        }
        categoryScores[response.category].total += response.rating;
        categoryScores[response.category].count += 1;
      });

      const categoryResults = Object.entries(categoryScores).map(([key, value]) => ({
        key,
        name: leadership360Categories[key],
        score: Math.round((value.total / (value.count * 5)) * 100),
        average: (value.total / value.count).toFixed(1)
      }));

      const sorted = [...categoryResults].sort((a, b) => b.score - a.score);
      const strengths = sorted.slice(0, 3);
      const developmentAreas = sorted.slice(-3).reverse();

      const overallScore = Math.round(
        categoryResults.reduce((sum, c) => sum + c.score, 0) / categoryResults.length
      );

      reportData = {
        overallScore,
        categories: categoryResults,
        strengths,
        developmentAreas,
        totalQuestions: questions.length,
        managerInfo,
        evaluatorRelationship,
        responses: finalResponses
      };
    }

    // Save report to user profile with complete data integration
    const saveResult = auth.saveUserReport(user.id, type, reportData);
    
    if (!saveResult.success) {
      console.error('Failed to save report:', saveResult.error);
      alert(language === 'en' 
        ? 'Error saving your assessment. Please contact administrator.'
        : 'خطأ في حفظ التقييم. يرجى التواصل مع المسؤول.'
      );
      navigate('/dashboard');
      return;
    }
    
    // Log successful completion
    console.log('Assessment completed successfully:', {
      userId: user.id,
      assessmentType: type,
      reportId: saveResult.report?.id,
      score: reportData.overallScore
    });

    // Redirect to thank you page
    setTimeout(() => {
      navigate(`/thank-you/${type}`);
    }, 1500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kafaat-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
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
            className="text-kafaat-navy hover:text-blue-800 font-medium"
          >
            {language === 'en' ? 'Return to Dashboard' : 'العودة للوحة التحكم'}
          </button>
        </div>
      </div>
    );
  }

  // Submitting state
  if (stage === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Submitting Your Assessment...' : 'جاري إرسال تقييمك...'}
          </h2>
          <p className="text-gray-600">
            {language === 'en' ? 'Please wait while we process your responses.' : 'يرجى الانتظار بينما نعالج إجاباتك.'}
          </p>
        </div>
      </div>
    );
  }

  // Intro stage
  if (stage === 'intro') {
    const assessmentInfo = {
      kafaat: {
        icon: '🤖',
        name: { en: 'Kafaat AI Leadership Assessment', ar: 'تقييم كفاءات القيادي الذكي' },
        description: { 
          en: 'This assessment evaluates your leadership competencies across 8 key areas using scenario-based questions.',
          ar: 'يقيّم هذا التقييم كفاءاتك القيادية عبر 8 مجالات رئيسية باستخدام أسئلة قائمة على السيناريوهات.'
        },
        questions: 16,
        duration: '15-20'
      },
      '360': {
        icon: '🔄',
        name: { en: '360° Leadership Assessment', ar: 'تقييم القيادة 360°' },
        description: { 
          en: 'This comprehensive assessment evaluates leadership across 10 dimensions using a rating scale.',
          ar: 'يقيّم هذا التقييم الشامل القيادة عبر 10 أبعاد باستخدام مقياس تقييم.'
        },
        questions: 75,
        duration: '20-30'
      }
    };

    const info = assessmentInfo[type];

    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} />
        
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{info.icon}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {info.name[language]}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {info.description[language]}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-2xl block mb-1">📝</span>
                <span className="text-sm text-gray-600">
                  {info.questions} {language === 'en' ? 'Questions' : 'سؤال'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-2xl block mb-1">⏱️</span>
                <span className="text-sm text-gray-600">
                  {info.duration} {language === 'en' ? 'minutes' : 'دقيقة'}
                </span>
              </div>
            </div>

            {type === '360' && (
              <div className="text-left mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? "Leader's Name (being evaluated)" : 'اسم القائد (المُقيَّم)'} *
                  </label>
                  <input
                    type="text"
                    value={managerInfo.name}
                    onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder={language === 'en' ? "Enter leader's name" : 'أدخل اسم القائد'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Your Relationship' : 'علاقتك بالقائد'}
                  </label>
                  <select
                    value={evaluatorRelationship}
                    onChange={(e) => setEvaluatorRelationship(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >
                    <option value="colleague">{language === 'en' ? 'Colleague/Peer' : 'زميل/نظير'}</option>
                    <option value="direct_report">{language === 'en' ? 'Direct Report' : 'تابع مباشر'}</option>
                    <option value="external_client">{language === 'en' ? 'External Client' : 'عميل خارجي'}</option>
                    <option value="supervisor">{language === 'en' ? 'Supervisor' : 'مشرف'}</option>
                  </select>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ {language === 'en' ? 'Important:' : 'مهم:'}</strong>{' '}
                {language === 'en' 
                  ? 'Your results will be stored securely and reviewed by your administrator. You cannot retake this assessment once completed.'
                  : 'سيتم تخزين نتائجك بشكل آمن ومراجعتها من قبل المسؤول. لا يمكنك إعادة هذا التقييم بعد إكماله.'
                }
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={() => {
                  if (type === '360' && !managerInfo.name.trim()) {
                    alert(language === 'en' ? "Please enter the leader's name" : 'يرجى إدخال اسم القائد');
                    return;
                  }
                  setStage('assessment');
                }}
                className="flex-1 bg-kafaat-navy text-white py-3 rounded-lg font-medium hover:bg-blue-800"
              >
                {language === 'en' ? 'Begin Assessment' : 'بدء التقييم'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment stage
  const question = questions[currentQuestion];
  const currentResponse = responses.find(r => r.questionId === question?.id);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {language === 'en' 
                ? `Question ${currentQuestion + 1} of ${questions.length}`
                : `السؤال ${currentQuestion + 1} من ${questions.length}`
              }
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-kafaat-navy to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {type === 'kafaat' ? (
            // Kafaat Question
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {language === 'en' 
                  ? question.competency.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : {
                      leadership_fundamentals: 'أساسيات القيادة',
                      change_management: 'إدارة التغيير',
                      performance_management: 'إدارة الأداء',
                      team_building: 'بناء الفرق',
                      communication: 'التواصل',
                      problem_solving: 'حل المشكلات',
                      emotional_intelligence: 'الذكاء العاطفي',
                      strategic_implementation: 'التنفيذ الاستراتيجي'
                    }[question.competency]
                }
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                <h3 className="font-bold text-blue-900 mb-2">
                  {language === 'en' ? 'Scenario' : 'السيناريو'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {question.scenario[language]}
                </p>
              </div>

              <h4 className="text-xl font-bold text-gray-900">
                {question.question[language]}
              </h4>

              <div className="space-y-3">
                {question.options[language].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleKafaatAnswer(index)}
                    className="w-full text-right p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center flex-shrink-0 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-800 text-lg flex-1 text-start">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // 360 Question
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{leadership360Categories[question.category][language].icon}</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {leadership360Categories[question.category][language].name}
                </span>
              </div>

              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {question[language]}
                </h4>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 px-4">
                  <span>{language === 'en' ? 'Strongly Disagree' : 'أعارض بشدة'}</span>
                  <span>{language === 'en' ? 'Strongly Agree' : 'أوافق بشدة'}</span>
                </div>
                
                <div className="flex justify-center gap-4">
                  {ratingScale.map((scale) => (
                    <button
                      key={scale.value}
                      onClick={() => handleRating(scale.value)}
                      className={`w-16 h-16 rounded-full font-bold text-xl transition-all ${
                        currentResponse?.rating === scale.value
                          ? 'bg-kafaat-gold text-kafaat-navy scale-110 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {scale.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation for 360 */}
        {type === '360' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={goPrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentQuestion === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'en' ? 'Previous' : 'السابق'}
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!currentResponse}
                className={`px-6 py-3 rounded-lg font-medium ${
                  !currentResponse
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-kafaat-navy text-white hover:bg-blue-800'
                }`}
              >
                {language === 'en' ? 'Next' : 'التالي'}
              </button>
            ) : (
              <button
                onClick={submit360Assessment}
                disabled={responses.length < questions.length}
                className={`px-8 py-3 rounded-lg font-medium ${
                  responses.length < questions.length
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {language === 'en' ? 'Submit Assessment' : 'إرسال التقييم'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAssessment;
