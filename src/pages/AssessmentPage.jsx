import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as storage from '../utils/storage';
import { kafaatQuestionBank } from '../data/kafaatQuestions';
import { leadership360Questions, ratingScale } from '../data/leadership360Questions';

const AssessmentPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const result = storage.getAssessmentByLinkCode(code);
    if (!result) {
      setError(language === 'en' ? 'Assessment not found or link expired' : 'التقييم غير موجود أو الرابط منتهي الصلاحية');
    } else {
      // Check if already completed
      if (result.type === 'kafaat' && result.assessment.status === 'completed') {
        setError(language === 'en' ? 'This assessment has already been completed' : 'هذا التقييم مكتمل بالفعل');
      } else if (result.type === '360' && result.evaluator?.status === 'completed') {
        setError(language === 'en' ? 'You have already completed this evaluation' : 'لقد أكملت هذا التقييم بالفعل');
      } else {
        setAssessmentData(result);
      }
    }
    setLoading(false);
  }, [code, language]);

  const questions = assessmentData?.type === 'kafaat' 
    ? kafaatQuestionBank 
    : leadership360Questions;

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
    
    setResponses([...responses, newResponse]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitKafaatAssessment([...responses, newResponse]);
    }
  };

  const handle360Rating = (rating) => {
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

  const submitKafaatAssessment = (finalResponses) => {
    storage.saveKafaatResponses(assessmentData.assessment.id, finalResponses);
    setSubmitted(true);
  };

  const submit360Assessment = () => {
    if (responses.length < questions.length) {
      alert(language === 'en' ? 'Please answer all questions' : 'الرجاء الإجابة على جميع الأسئلة');
      return;
    }
    
    storage.save360EvaluatorResponses(
      assessmentData.assessment.id,
      assessmentData.evaluator.id,
      responses
    );
    setSubmitted(true);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {language === 'en' ? 'Return to Home' : 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Assessment Completed!' : 'تم إكمال التقييم!'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'en' 
              ? 'Thank you for completing the assessment. Your responses have been recorded.'
              : 'شكراً لإكمالك التقييم. تم تسجيل إجاباتك.'
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-kafaat-navy text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800"
          >
            {language === 'en' ? 'Return to Home' : 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
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
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-kafaat-navy transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Assessment Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              assessmentData.type === 'kafaat' ? 'bg-blue-100' : 'bg-yellow-100'
            }`}>
              <span className="text-2xl">
                {assessmentData.type === 'kafaat' ? '🤖' : '🔄'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {assessmentData.type === 'kafaat' 
                  ? (language === 'en' ? 'Kafaat AI Assessment' : 'تقييم كفاءات الذكي')
                  : (language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°')
                }
              </h2>
              <p className="text-gray-500">
                {assessmentData.type === 'kafaat'
                  ? `${assessmentData.assessment.applicantName}`
                  : `${language === 'en' ? 'Evaluating' : 'تقييم'}: ${assessmentData.assessment.managerName}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-md p-8 animate-fadeIn">
          {assessmentData.type === 'kafaat' ? (
            <KafaatQuestion 
              question={questions[currentQuestion]}
              language={language}
              onAnswer={handleKafaatAnswer}
            />
          ) : (
            <Leadership360Question 
              question={questions[currentQuestion]}
              language={language}
              currentResponse={responses.find(r => r.questionId === questions[currentQuestion].id)}
              onRate={handle360Rating}
              questionNumber={currentQuestion + 1}
            />
          )}
        </div>

        {/* Navigation for 360 */}
        {assessmentData.type === '360' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentQuestion === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'en' ? 'Previous' : 'السابق'}
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={!responses.find(r => r.questionId === questions[currentQuestion].id)}
                className={`px-6 py-2 rounded-lg font-medium ${
                  !responses.find(r => r.questionId === questions[currentQuestion].id)
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
                className={`px-6 py-2 rounded-lg font-medium ${
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

// Kafaat Question Component
const KafaatQuestion = ({ question, language, onAnswer }) => {
  return (
    <div className="space-y-6">
      {/* Scenario */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-semibold text-blue-800 mb-2">
          {language === 'en' ? 'Scenario' : 'السيناريو'}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {question.scenario[language]}
        </p>
      </div>

      {/* Question */}
      <div>
        <h4 className="text-xl font-semibold text-gray-900 mb-4">
          {question.question[language]}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options[language].map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 font-medium text-gray-600">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-gray-800">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 360 Question Component
const Leadership360Question = ({ question, language, currentResponse, onRate, questionNumber }) => {
  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="text-center">
        <span className="text-sm text-gray-500 block mb-2">
          {language === 'en' ? `Question ${questionNumber}` : `السؤال ${questionNumber}`}
        </span>
        <h4 className="text-xl font-semibold text-gray-900">
          {question[language]}
        </h4>
      </div>

      {/* Rating Scale */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex justify-between w-full max-w-lg text-sm text-gray-500">
          <span>{language === 'en' ? 'Strongly Disagree' : 'أعارض بشدة'}</span>
          <span>{language === 'en' ? 'Strongly Agree' : 'أوافق بشدة'}</span>
        </div>
        
        <div className="flex gap-4">
          {ratingScale.map((scale) => (
            <button
              key={scale.value}
              onClick={() => onRate(scale.value)}
              className={`w-14 h-14 rounded-full font-bold text-lg transition-all ${
                currentResponse?.rating === scale.value
                  ? 'bg-kafaat-navy text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {scale.value}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between w-full max-w-lg text-xs text-gray-400">
          {ratingScale.map((scale) => (
            <span key={scale.value} className="text-center w-14">
              {language === 'en' ? scale.en : scale.ar}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
