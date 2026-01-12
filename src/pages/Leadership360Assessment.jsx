import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import { leadership360Questions, leadership360Categories, ratingScale } from '../data/leadership360Questions';
import * as storage from '../utils/storage';

const Leadership360Assessment = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  // Assessment states
  const [stage, setStage] = useState('intro'); // intro, setup, evaluator-info, assessment, completed
  const [managerInfo, setManagerInfo] = useState({
    name: '',
    email: '',
    department: '',
    position: ''
  });
  const [evaluatorInfo, setEvaluatorInfo] = useState({
    name: '',
    email: '',
    relationship: 'colleague' // colleague, direct_report, external_client, supervisor
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState(null);

  const questions = leadership360Questions;

  const relationshipTypes = [
    { value: 'colleague', en: 'Colleague/Peer', ar: 'زميل/نظير' },
    { value: 'direct_report', en: 'Direct Report (Staff)', ar: 'تابع مباشر (موظف)' },
    { value: 'external_client', en: 'External Client/Provider', ar: 'عميل/مورد خارجي' },
    { value: 'supervisor', en: 'Supervisor/Manager', ar: 'مشرف/مدير' }
  ];

  const handleStartAssessment = () => {
    setStage('setup');
  };

  const handleManagerSetup = (e) => {
    e.preventDefault();
    setStage('evaluator-info');
  };

  const handleEvaluatorSetup = (e) => {
    e.preventDefault();
    setStage('assessment');
  };

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

  const submitAssessment = () => {
    if (responses.length < questions.length) {
      alert(language === 'en' 
        ? 'Please answer all questions before submitting.' 
        : 'يرجى الإجابة على جميع الأسئلة قبل الإرسال.'
      );
      return;
    }

    // Calculate results by category
    const categoryScores = {};
    
    responses.forEach(response => {
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
      average: (value.total / value.count).toFixed(1),
      maxScore: value.count * 5
    }));

    // Sort by score for strengths/weaknesses
    const sorted = [...categoryResults].sort((a, b) => b.score - a.score);
    const strengths = sorted.slice(0, 3);
    const developmentAreas = sorted.slice(-3).reverse();

    const overallScore = Math.round(
      categoryResults.reduce((sum, c) => sum + c.score, 0) / categoryResults.length
    );

    const calculatedResults = {
      overallScore,
      categories: categoryResults,
      strengths,
      developmentAreas,
      totalQuestions: questions.length,
      evaluatorRelationship: evaluatorInfo.relationship,
      completedAt: new Date().toISOString()
    };

    setResults(calculatedResults);
    setStage('completed');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentResponse = responses.find(r => r.questionId === questions[currentQuestion]?.id);

  // INTRO STAGE
  if (stage === 'intro') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-5xl">🔄</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Comprehensive multi-rater feedback for leadership development'
                : 'تغذية راجعة شاملة متعددة المقيّمين لتطوير القيادة'
              }
            </p>
          </div>

          {/* Assessment Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {language === 'en' ? 'About This Assessment' : 'حول هذا التقييم'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? '75 Comprehensive Questions' : '75 سؤالاً شاملاً'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Evaluating leadership across 10 key dimensions'
                      : 'تقييم القيادة عبر 10 أبعاد رئيسية'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? '20-30 Minutes' : '20-30 دقيقة'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Complete at your own pace'
                      : 'أكمل التقييم بالسرعة التي تناسبك'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? 'Multi-Rater Feedback' : 'تغذية راجعة متعددة'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Colleagues, staff, clients & supervisors'
                      : 'زملاء، موظفين، عملاء ومشرفين'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? 'Gallup-Style Report' : 'تقرير بأسلوب Gallup'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Professional visual analytics'
                      : 'تحليلات بصرية احترافية'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                {language === 'en' ? '10 Leadership Dimensions' : '10 أبعاد قيادية'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(leadership360Categories).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-2xl block mb-1">{value[language].icon}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {value[language].name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartAssessment}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-kafaat-navy px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {language === 'en' ? 'Start 360° Assessment' : 'بدء تقييم 360°'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SETUP STAGE - Manager Info
  if (stage === 'setup') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👔</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Leader Being Evaluated' : 'القائد المُقيَّم'}
              </h2>
              <p className="text-gray-600 mt-2">
                {language === 'en' 
                  ? 'Enter information about the leader you are evaluating'
                  : 'أدخل معلومات القائد الذي تقيّمه'
                }
              </p>
            </div>

            <form onSubmit={handleManagerSetup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? "Leader's Full Name" : 'الاسم الكامل للقائد'} *
                </label>
                <input
                  type="text"
                  required
                  value={managerInfo.name}
                  onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder={language === 'en' ? "Enter leader's name" : 'أدخل اسم القائد'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? "Leader's Department" : 'قسم القائد'}
                </label>
                <input
                  type="text"
                  value={managerInfo.department}
                  onChange={(e) => setManagerInfo({ ...managerInfo, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder={language === 'en' ? "Enter department" : 'أدخل القسم'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? "Leader's Position" : 'منصب القائد'}
                </label>
                <input
                  type="text"
                  value={managerInfo.position}
                  onChange={(e) => setManagerInfo({ ...managerInfo, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder={language === 'en' ? "Enter position" : 'أدخل المنصب'}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStage('intro')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  {language === 'en' ? 'Back' : 'رجوع'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-kafaat-gold text-kafaat-navy py-3 rounded-lg font-medium hover:bg-yellow-400"
                >
                  {language === 'en' ? 'Continue' : 'متابعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // EVALUATOR INFO STAGE
  if (stage === 'evaluator-info') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Your Information' : 'معلوماتك'}
              </h2>
              <p className="text-gray-600 mt-2">
                {language === 'en' 
                  ? `You are evaluating: ${managerInfo.name}`
                  : `أنت تقيّم: ${managerInfo.name}`
                }
              </p>
            </div>

            <form onSubmit={handleEvaluatorSetup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Your Name' : 'اسمك'} *
                </label>
                <input
                  type="text"
                  required
                  value={evaluatorInfo.name}
                  onChange={(e) => setEvaluatorInfo({ ...evaluatorInfo, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Your Email' : 'بريدك الإلكتروني'}
                </label>
                <input
                  type="email"
                  value={evaluatorInfo.email}
                  onChange={(e) => setEvaluatorInfo({ ...evaluatorInfo, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === 'en' ? 'Your Relationship to the Leader' : 'علاقتك بالقائد'} *
                </label>
                <div className="space-y-2">
                  {relationshipTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        evaluatorInfo.relationship === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="relationship"
                        value={type.value}
                        checked={evaluatorInfo.relationship === type.value}
                        onChange={(e) => setEvaluatorInfo({ ...evaluatorInfo, relationship: e.target.value })}
                        className="text-blue-500"
                      />
                      <span className="font-medium text-gray-800">
                        {language === 'en' ? type.en : type.ar}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStage('setup')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  {language === 'en' ? 'Back' : 'رجوع'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-kafaat-navy text-white py-3 rounded-lg font-medium hover:bg-blue-800"
                >
                  {language === 'en' ? 'Begin Evaluation' : 'بدء التقييم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ASSESSMENT STAGE
  if (stage === 'assessment') {
    const question = questions[currentQuestion];
    const category = leadership360Categories[question.category];
    
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
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Assessment Header */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°'}
              </h2>
              <p className="text-sm text-gray-500">
                {language === 'en' ? 'Evaluating' : 'تقييم'}: {managerInfo.name}
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{category[language].icon}</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {category[language].name}
              </span>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h4 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {question[language]}
              </h4>
            </div>

            {/* Rating Scale */}
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
              
              <div className="flex justify-between text-xs text-gray-400 px-2">
                {ratingScale.map((scale) => (
                  <span key={scale.value} className="text-center w-16">
                    {language === 'en' ? scale.en : scale.ar}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={goPrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                currentQuestion === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{isRTL ? '→' : '←'}</span>
              {language === 'en' ? 'Previous' : 'السابق'}
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!currentResponse}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  !currentResponse
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-kafaat-navy text-white hover:bg-blue-800'
                }`}
              >
                {language === 'en' ? 'Next' : 'التالي'}
                <span>{isRTL ? '←' : '→'}</span>
              </button>
            ) : (
              <button
                onClick={submitAssessment}
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

          {/* Question Progress Indicator */}
          <div className="mt-8 flex justify-center gap-1 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentQuestion
                    ? 'bg-kafaat-gold scale-125'
                    : responses.find(r => r.questionId === questions[index].id)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED STAGE - Results
  if (stage === 'completed' && results) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Evaluation Completed!' : 'تم إكمال التقييم!'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' 
                ? `Thank you for evaluating ${managerInfo.name}`
                : `شكراً لتقييمك ${managerInfo.name}`
              }
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 text-kafaat-navy text-center mb-8">
            <h2 className="text-xl font-medium mb-4">
              {language === 'en' ? 'Overall Leadership Score' : 'النتيجة القيادية الإجمالية'}
            </h2>
            <div className="text-7xl font-bold mb-2">{results.overallScore}%</div>
            <div className="text-yellow-900">
              {results.overallScore >= 80 
                ? (language === 'en' ? 'Excellent Leadership Performance' : 'أداء قيادي ممتاز')
                : results.overallScore >= 60 
                  ? (language === 'en' ? 'Good Leadership Performance' : 'أداء قيادي جيد')
                  : (language === 'en' ? 'Leadership Development Needed' : 'يحتاج تطوير قيادي')
              }
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Leadership Dimensions Breakdown' : 'تفصيل الأبعاد القيادية'}
            </h3>
            <div className="space-y-4">
              {results.categories.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span>{cat.name[language].icon}</span>
                      {cat.name[language].name}
                    </span>
                    <span className="font-bold text-kafaat-navy">{cat.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cat.score >= 80 ? 'bg-green-500' :
                        cat.score >= 60 ? 'bg-yellow-500' :
                        cat.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Development Areas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <span>💪</span>
                {language === 'en' ? 'Key Strengths' : 'نقاط القوة الرئيسية'}
              </h3>
              <div className="space-y-3">
                {results.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <span className="text-xl">{s.name[language].icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {s.name[language].name}
                      </div>
                      <div className="text-sm text-green-600">{s.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Areas */}
            <div className="bg-orange-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span>📈</span>
                {language === 'en' ? 'Development Areas' : 'مجالات التطوير'}
              </h3>
              <div className="space-y-3">
                {results.developmentAreas.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <span className="text-xl">{d.name[language].icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {d.name[language].name}
                      </div>
                      <div className="text-sm text-orange-600">{d.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evaluator Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-8 text-center">
            <p className="text-blue-800">
              {language === 'en' 
                ? `Evaluation by: ${evaluatorInfo.name} (${relationshipTypes.find(r => r.value === evaluatorInfo.relationship)?.en})`
                : `التقييم بواسطة: ${evaluatorInfo.name} (${relationshipTypes.find(r => r.value === evaluatorInfo.relationship)?.ar})`
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              {language === 'en' ? 'Back to Home' : 'العودة للرئيسية'}
            </button>
            <button
              onClick={() => {
                setStage('intro');
                setCurrentQuestion(0);
                setResponses([]);
                setResults(null);
                setManagerInfo({ name: '', email: '', department: '', position: '' });
                setEvaluatorInfo({ name: '', email: '', relationship: 'colleague' });
              }}
              className="px-8 py-3 bg-kafaat-gold text-kafaat-navy rounded-lg font-medium hover:bg-yellow-400"
            >
              {language === 'en' ? 'Submit Another Evaluation' : 'إرسال تقييم آخر'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Leadership360Assessment;
