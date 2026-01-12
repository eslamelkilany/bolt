import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import { kafaatQuestionBank } from '../data/kafaatQuestions';
import * as storage from '../utils/storage';

const KafaatAssessment = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  // Assessment states
  const [stage, setStage] = useState('intro'); // intro, registration, assessment, completed
  const [applicantInfo, setApplicantInfo] = useState({
    name: '',
    email: '',
    department: '',
    position: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [results, setResults] = useState(null);

  // Get 16 questions (2 per competency)
  const questions = kafaatQuestionBank;

  const handleStartAssessment = () => {
    setStage('registration');
  };

  const handleRegistration = (e) => {
    e.preventDefault();
    
    // Create assessment in storage
    const assessment = storage.createKafaatAssessment({
      applicantName: applicantInfo.name,
      applicantEmail: applicantInfo.email,
      department: applicantInfo.department,
      position: applicantInfo.position
    });
    
    setAssessmentId(assessment.id);
    setStage('assessment');
  };

  const handleAnswer = (optionIndex) => {
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
      // Calculate results and complete
      completeAssessment(updatedResponses);
    }
  };

  const completeAssessment = (finalResponses) => {
    // Calculate scores by competency
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

    // Sort by score for strengths/weaknesses
    const sorted = [...competencyResults].sort((a, b) => b.score - a.score);
    const strengths = sorted.slice(0, 3);
    const developmentAreas = sorted.slice(-3).reverse();

    const overallScore = Math.round(
      competencyResults.reduce((sum, c) => sum + c.score, 0) / competencyResults.length
    );

    const calculatedResults = {
      overallScore,
      competencies: competencyResults,
      strengths,
      developmentAreas,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString()
    };

    // Save to storage
    if (assessmentId) {
      storage.saveKafaatResponses(assessmentId, finalResponses);
      storage.generateReport(assessmentId, calculatedResults);
    }

    setResults(calculatedResults);
    setStage('completed');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // INTRO STAGE
  if (stage === 'intro') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-5xl">🤖</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Kafaat AI Leadership Assessment' : 'تقييم كفاءات القيادي الذكي'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'AI-powered assessment based on Qatar Skills leadership development curriculum'
                : 'تقييم مدعوم بالذكاء الاصطناعي مبني على منهج قطر سكيلز لتطوير القيادة'
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
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? '16 Scenario Questions' : '16 سؤال سيناريو'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Real-world leadership scenarios to assess your competencies'
                      : 'سيناريوهات قيادية واقعية لتقييم كفاءاتك'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? '15-20 Minutes' : '15-20 دقيقة'}
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
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? '8 Competency Areas' : '8 مجالات كفاءة'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Comprehensive leadership evaluation'
                      : 'تقييم قيادي شامل'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {language === 'en' ? 'Instant Results' : 'نتائج فورية'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' 
                      ? 'Get your detailed report immediately'
                      : 'احصل على تقريرك المفصل فوراً'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Competencies */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                {language === 'en' ? 'Competencies Assessed' : 'الكفاءات المُقيَّمة'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🎯', en: 'Leadership Fundamentals', ar: 'أساسيات القيادة' },
                  { icon: '🔄', en: 'Change Management', ar: 'إدارة التغيير' },
                  { icon: '📊', en: 'Performance Management', ar: 'إدارة الأداء' },
                  { icon: '👥', en: 'Team Building', ar: 'بناء الفرق' },
                  { icon: '💬', en: 'Communication', ar: 'التواصل' },
                  { icon: '🧩', en: 'Problem Solving', ar: 'حل المشكلات' },
                  { icon: '❤️', en: 'Emotional Intelligence', ar: 'الذكاء العاطفي' },
                  { icon: '🚀', en: 'Strategic Implementation', ar: 'التنفيذ الاستراتيجي' }
                ].map((comp, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-2xl block mb-1">{comp.icon}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {language === 'en' ? comp.en : comp.ar}
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
              className="bg-gradient-to-r from-kafaat-navy to-blue-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {language === 'en' ? 'Start Assessment' : 'بدء التقييم'}
            </button>
            <p className="text-gray-500 text-sm mt-4">
              {language === 'en' 
                ? 'No registration required - Start immediately'
                : 'لا يتطلب تسجيل - ابدأ فوراً'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION STAGE
  if (stage === 'registration') {
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
                {language === 'en' ? 'Enter Your Information' : 'أدخل معلوماتك'}
              </h2>
              <p className="text-gray-600 mt-2">
                {language === 'en' 
                  ? 'This information will appear on your assessment report'
                  : 'ستظهر هذه المعلومات في تقرير التقييم الخاص بك'
                }
              </p>
            </div>

            <form onSubmit={handleRegistration} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Full Name' : 'الاسم الكامل'} *
                </label>
                <input
                  type="text"
                  required
                  value={applicantInfo.name}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your full name' : 'أدخل اسمك الكامل'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'} *
                </label>
                <input
                  type="email"
                  required
                  value={applicantInfo.email}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Department' : 'القسم'}
                </label>
                <input
                  type="text"
                  value={applicantInfo.department}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your department' : 'أدخل قسمك'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Position/Title' : 'المسمى الوظيفي'}
                </label>
                <input
                  type="text"
                  value={applicantInfo.position}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Enter your position' : 'أدخل مسماك الوظيفي'}
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
                  className="flex-1 bg-kafaat-navy text-white py-3 rounded-lg font-medium hover:bg-blue-800"
                >
                  {language === 'en' ? 'Begin Assessment' : 'بدء التقييم'}
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
                className="h-full bg-gradient-to-r from-kafaat-navy to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Assessment Header */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {language === 'en' ? 'Kafaat AI Assessment' : 'تقييم كفاءات الذكي'}
              </h2>
              <p className="text-sm text-gray-500">
                {applicantInfo.name} • {question.competency.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
            {/* Competency Badge */}
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
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

            {/* Scenario */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-xl mb-6">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>📋</span>
                {language === 'en' ? 'Scenario' : 'السيناريو'}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {question.scenario[language]}
              </p>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900">
                {question.question[language]}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options[language].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-right p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center flex-shrink-0 font-bold text-gray-600 transition-colors">
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
              {language === 'en' ? 'Assessment Completed!' : 'تم إكمال التقييم!'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' 
                ? `Congratulations ${applicantInfo.name}! Here are your results.`
                : `تهانينا ${applicantInfo.name}! إليك نتائجك.`
              }
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-kafaat-navy to-blue-700 rounded-2xl p-8 text-white text-center mb-8">
            <h2 className="text-xl font-medium mb-4">
              {language === 'en' ? 'Overall Leadership Score' : 'النتيجة القيادية الإجمالية'}
            </h2>
            <div className="text-7xl font-bold mb-2">{results.overallScore}%</div>
            <div className="text-blue-200">
              {results.overallScore >= 80 
                ? (language === 'en' ? 'Excellent Leadership Potential' : 'إمكانيات قيادية ممتازة')
                : results.overallScore >= 60 
                  ? (language === 'en' ? 'Good Leadership Foundation' : 'أساس قيادي جيد')
                  : (language === 'en' ? 'Developing Leadership Skills' : 'مهارات قيادية قيد التطوير')
              }
            </div>
          </div>

          {/* Competency Scores */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Competency Breakdown' : 'تفصيل الكفاءات'}
            </h3>
            <div className="space-y-4">
              {results.competencies.map((comp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">
                      {language === 'en' ? comp.name.en : comp.name.ar}
                    </span>
                    <span className="font-bold text-kafaat-navy">{comp.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        comp.score >= 80 ? 'bg-green-500' :
                        comp.score >= 60 ? 'bg-blue-500' :
                        comp.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${comp.score}%` }}
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
                {language === 'en' ? 'Your Strengths' : 'نقاط قوتك'}
              </h3>
              <div className="space-y-3">
                {results.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {language === 'en' ? s.name.en : s.name.ar}
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
                    <span className="text-orange-500 text-xl">→</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {language === 'en' ? d.name.en : d.name.ar}
                      </div>
                      <div className="text-sm text-orange-600">{d.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                setApplicantInfo({ name: '', email: '', department: '', position: '' });
              }}
              className="px-8 py-3 bg-kafaat-navy text-white rounded-lg font-medium hover:bg-blue-800"
            >
              {language === 'en' ? 'Take Another Assessment' : 'إجراء تقييم آخر'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default KafaatAssessment;
