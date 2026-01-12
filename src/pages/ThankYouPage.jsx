import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import * as auth from '../utils/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { kafaatCompetencyData, leadership360Data, getPerformanceTier } from '../data/reportRecommendations';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userReports = currentUser.reports || [];
        const latestReport = userReports
          .filter(r => r.assessmentType === type)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        
        if (latestReport) {
          setReport(latestReport);
        }
      }
    };
    init();
  }, [type]);

  // PDF Download Function
  const downloadPDF = async () => {
    if (!reportRef.current || !report) return;
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const scaledHeight = imgHeight * (pdfWidth / imgWidth);
      const pageCount = Math.ceil(scaledHeight / pdfHeight);
      
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), pdfWidth, scaledHeight);
      }
      
      const fileName = `${user?.name || 'Assessment'}_${type}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'en' ? 'Error generating PDF. Please try again.' : 'خطأ في إنشاء PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setDownloading(false);
    }
  };

  // Get performance level based on score
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { en: 'Outstanding', ar: 'متميز', color: 'text-emerald-600 bg-emerald-100', icon: '🏆' };
    if (score >= 80) return { en: 'Excellent', ar: 'ممتاز', color: 'text-green-600 bg-green-100', icon: '⭐' };
    if (score >= 70) return { en: 'Very Good', ar: 'جيد جداً', color: 'text-blue-600 bg-blue-100', icon: '✅' };
    if (score >= 60) return { en: 'Good', ar: 'جيد', color: 'text-cyan-600 bg-cyan-100', icon: '👍' };
    if (score >= 50) return { en: 'Satisfactory', ar: 'مقبول', color: 'text-yellow-600 bg-yellow-100', icon: '📊' };
    return { en: 'Developing', ar: 'بحاجة للتطوير', color: 'text-orange-600 bg-orange-100', icon: '📈' };
  };

  // Map competency keys
  const competencyKeyMap = {
    leadership_fundamentals: 'leadershipFundamentals',
    change_management: 'changeManagement',
    performance_management: 'performanceManagement',
    team_building: 'teamBuilding',
    communication: 'communication',
    problem_solving: 'problemSolving',
    emotional_intelligence: 'emotionalIntelligence',
    strategic_implementation: 'strategicImplementation',
    vision: 'vision',
    team_leadership: 'teamLeadership',
    decision_making: 'decisionMaking',
    change: 'changeManagement',
    accountability: 'accountability',
    development: 'development',
    integrity: 'integrity',
    innovation: 'innovation'
  };

  // Get recommendation for an item
  const getRecommendation = (item) => {
    const key = item.key || item.competency;
    const mappedKey = competencyKeyMap[key] || key;
    const isKafaat = type === 'kafaat';
    const recommendationSource = isKafaat ? kafaatCompetencyData : leadership360Data;
    const recommendationData = recommendationSource[mappedKey];
    
    if (!recommendationData) return null;
    
    const tier = getPerformanceTier(item.score);
    const langData = recommendationData[language] || recommendationData.en;
    const performanceKey = tier === 'high' ? 'highPerformance' : tier === 'medium' ? 'mediumPerformance' : 'lowPerformance';
    
    return {
      insight: langData[performanceKey]?.insight,
      recommendation: langData[performanceKey]?.recommendation,
      tier
    };
  };

  const messages = {
    kafaat: {
      en: {
        title: "Assessment Successfully Completed!",
        subtitle: "Your Kafaat AI Leadership Assessment Results",
        greeting: "Congratulations on completing your assessment!",
        mainMessage: `We extend our sincere gratitude for completing the Kafaat AI Leadership Assessment. Your dedication to professional development and leadership growth is truly commendable.`,
        whatNext: "What Happens Next?",
        nextSteps: [
          "Review your high-level results and download your report below",
          "Your administrator will review your comprehensive detailed report",
          "Personalized development recommendations will be provided based on your results",
          "Consider focusing on your top development areas over the next 90 days"
        ]
      },
      ar: {
        title: "تم إكمال التقييم بنجاح!",
        subtitle: "نتائج تقييم كفاءات القيادي الذكي",
        greeting: "تهانينا على إكمال تقييمك!",
        mainMessage: `نتقدم لك بخالص الشكر والتقدير على إكمالك تقييم كفاءات القيادي الذكي. إن تفانيك في التطوير المهني ونمو القيادة أمر يستحق الثناء.`,
        whatNext: "ماذا بعد؟",
        nextSteps: [
          "راجع نتائجك الموجزة وقم بتحميل تقريرك أدناه",
          "سيراجع المسؤول تقريرك التفصيلي الشامل",
          "ستُقدم توصيات تطوير مخصصة بناءً على نتائجك",
          "فكر في التركيز على مجالات التطوير الرئيسية خلال الـ 90 يوماً القادمة"
        ]
      }
    },
    '360': {
      en: {
        title: "Evaluation Successfully Submitted!",
        subtitle: "Your 360° Leadership Assessment Results",
        greeting: "Thank you for completing the evaluation!",
        mainMessage: `We sincerely appreciate your thoughtful participation in completing the 360° Leadership Assessment. Your comprehensive feedback provides valuable insights for leadership development.`,
        whatNext: "What Happens Next?",
        nextSteps: [
          "Review your high-level results and download your report below",
          "All evaluator responses will be compiled for comprehensive analysis",
          "A detailed 360° leadership report will be prepared",
          "Development recommendations will be tailored to multi-rater feedback"
        ]
      },
      ar: {
        title: "تم إرسال التقييم بنجاح!",
        subtitle: "نتائج تقييم القيادة 360°",
        greeting: "شكراً لإكمالك التقييم!",
        mainMessage: `نقدر بصدق مشاركتك المدروسة في إكمال تقييم القيادة 360°. ملاحظاتك الشاملة توفر رؤى قيمة لتطوير القيادة.`,
        whatNext: "ماذا بعد؟",
        nextSteps: [
          "راجع نتائجك الموجزة وقم بتحميل تقريرك أدناه",
          "سيتم تجميع جميع ردود المقيّمين للتحليل الشامل",
          "سيتم إعداد تقرير قيادة 360° مفصل",
          "ستُصمم توصيات التطوير بناءً على ملاحظات متعددة المصادر"
        ]
      }
    }
  };

  const content = messages[type] || messages.kafaat;
  const text = content[language];
  const performanceLevel = report?.data?.overallScore ? getPerformanceLevel(report.data.overallScore) : null;
  const isKafaat = type === 'kafaat';

  // Generate mini radar chart SVG
  const generateRadarChart = () => {
    const items = report?.data?.competencies || report?.data?.categories || [];
    const n = items.length;
    if (n === 0) return null;
    
    const size = 160;
    const center = size / 2;
    const maxRadius = 60;
    const angleStep = (2 * Math.PI) / n;
    
    const gridCircles = [25, 50, 75, 100].map((pct) => {
      const r = (pct / 100) * maxRadius;
      return (
        <circle key={pct} cx={center} cy={center} r={r} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      );
    });
    
    const points = items.map((item, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (item.score / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={size} height={size} className="mx-auto">
        {gridCircles}
        <polygon
          points={points}
          fill={isKafaat ? "rgba(59, 130, 246, 0.3)" : "rgba(234, 179, 8, 0.3)"}
          stroke={isKafaat ? "#3b82f6" : "#eab308"}
          strokeWidth="2"
        />
        {items.map((item, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const r = (item.score / 100) * maxRadius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={isKafaat ? "#1e40af" : "#ca8a04"} />
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header Bar */}
      <div className={`${isKafaat ? 'bg-gradient-to-r from-kafaat-navy to-blue-800' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} text-white py-4 px-6`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isKafaat ? 'bg-kafaat-gold' : 'bg-white'}`}>
              <span className={`font-bold ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>K</span>
            </div>
            <span className="font-semibold">
              {language === 'en' ? 'Kafaat Smart Evaluation' : 'منصة كفاءات للتقييم الذكي'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className={`w-24 h-24 ${isKafaat ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} rounded-full flex items-center justify-center shadow-2xl`}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-lg">{performanceLevel?.icon || '⭐'}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{text.title}</h1>
          <p className={`text-lg font-medium ${isKafaat ? 'text-blue-600' : 'text-yellow-600'}`}>{text.subtitle}</p>
        </div>

        {/* Results Report Card */}
        {report && report.data && (
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Report Header */}
            <div className={`${isKafaat ? 'bg-gradient-to-r from-kafaat-navy to-blue-700' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isKafaat ? 'bg-kafaat-gold' : 'bg-white'}`}>
                    <span className={`font-bold text-2xl ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>K</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {type === 'kafaat' 
                        ? (language === 'en' ? 'Kafaat AI Leadership Assessment' : 'تقييم كفاءات القيادي')
                        : (language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°')
                      }
                    </h2>
                    <p className={`${isKafaat ? 'text-blue-200' : 'text-yellow-100'}`}>
                      {language === 'en' ? 'Personalized Results Report' : 'تقرير النتائج المخصص'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isKafaat ? 'text-blue-200' : 'text-yellow-100'}`}>
                    {language === 'en' ? 'Completed' : 'مكتمل'}
                  </p>
                  <p className="font-semibold">
                    {new Date(report.completedAt).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US')}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            {user && (
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isKafaat ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{language === 'ar' ? user.nameAr || user.name : user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {(user.department || user.position) && (
                      <p className="text-sm text-gray-500">
                        {user.position && user.position}
                        {user.position && user.department && ' • '}
                        {user.department && user.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overall Score & Radar Chart */}
            <div className="p-6 grid md:grid-cols-2 gap-6 border-b">
              {/* Score Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {language === 'en' ? 'Overall Score' : 'النتيجة الإجمالية'}
                </h3>
                <div className="inline-flex flex-col items-center">
                  <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center mb-3 border-4 ${
                    report.data.overallScore >= 80 ? 'bg-green-50 border-green-400' :
                    report.data.overallScore >= 60 ? 'bg-blue-50 border-blue-400' :
                    report.data.overallScore >= 40 ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'
                  }`}>
                    <span className={`text-5xl font-bold ${
                      report.data.overallScore >= 80 ? 'text-green-600' :
                      report.data.overallScore >= 60 ? 'text-blue-600' :
                      report.data.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {report.data.overallScore}%
                    </span>
                    <span className="text-gray-500 text-sm">{language === 'en' ? 'Score' : 'النتيجة'}</span>
                  </div>
                  {performanceLevel && (
                    <span className={`px-4 py-2 rounded-full font-semibold ${performanceLevel.color}`}>
                      {performanceLevel.icon} {performanceLevel[language]}
                    </span>
                  )}
                </div>
              </div>

              {/* Radar Chart Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {language === 'en' ? 'Competency Profile' : 'ملف الكفاءات'}
                </h3>
                {generateRadarChart()}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6 grid grid-cols-4 gap-4 border-b bg-gray-50">
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${isKafaat ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{report.data.totalQuestions}</p>
                <p className="text-xs text-gray-500">{language === 'en' ? 'Questions' : 'سؤال'}</p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${isKafaat ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{(report.data.competencies || report.data.categories || []).length}</p>
                <p className="text-xs text-gray-500">{language === 'en' ? 'Dimensions' : 'أبعاد'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl">💪</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{(report.data.strengths || []).length}</p>
                <p className="text-xs text-gray-500">{language === 'en' ? 'Strengths' : 'قوة'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{(report.data.developmentAreas || []).length}</p>
                <p className="text-xs text-gray-500">{language === 'en' ? 'Growth Areas' : 'مجالات نمو'}</p>
              </div>
            </div>

            {/* Competencies Breakdown */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {language === 'en' ? 'Competency Breakdown' : 'تفصيل الكفاءات'}
              </h3>
              <div className="grid gap-3">
                {(report.data.competencies || report.data.categories || []).sort((a, b) => b.score - a.score).map((item, index) => {
                  const tier = getPerformanceTier(item.score);
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-36 md:w-44 text-sm text-gray-700 truncate font-medium">
                        {item.name?.[language] || item.name?.en || item.key}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all flex items-center justify-end px-2 ${
                            tier === 'high' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            tier === 'medium' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                            'bg-gradient-to-r from-orange-400 to-orange-500'
                          }`}
                          style={{ width: `${Math.max(item.score, 10)}%` }}
                        >
                          <span className="text-white text-xs font-bold">{item.score}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Development Areas */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50">
              {/* Strengths */}
              <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">💪</span>
                  {language === 'en' ? 'Your Top Strengths' : 'أبرز نقاط قوتك'}
                </h4>
                <ul className="space-y-3">
                  {(report.data.strengths || []).slice(0, 3).map((item, index) => {
                    const rec = getRecommendation(item);
                    return (
                      <li key={index} className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-green-800">
                            {item.name?.[language] || item.name?.en || item.key}
                          </span>
                          <span className="ml-auto font-bold text-green-600">{item.score}%</span>
                        </div>
                        {rec?.insight && (
                          <p className="text-sm text-green-700 ml-7">{rec.insight}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Development Areas */}
              <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
                <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">🎯</span>
                  {language === 'en' ? 'Growth Opportunities' : 'فرص النمو'}
                </h4>
                <ul className="space-y-3">
                  {(report.data.developmentAreas || []).slice(0, 3).map((item, index) => {
                    const rec = getRecommendation(item);
                    return (
                      <li key={index} className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-orange-800">
                            {item.name?.[language] || item.name?.en || item.key}
                          </span>
                          <span className="ml-auto font-bold text-orange-600">{item.score}%</span>
                        </div>
                        {rec?.recommendation && (
                          <p className="text-sm text-orange-700 ml-7">{rec.recommendation.slice(0, 100)}...</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Personalized Quick Tips */}
            <div className={`p-6 ${isKafaat ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isKafaat ? 'text-blue-800' : 'text-yellow-800'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isKafaat ? 'bg-blue-200' : 'bg-yellow-200'}`}>💡</span>
                {language === 'en' ? 'Quick Development Tips' : 'نصائح تطوير سريعة'}
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {(report.data.developmentAreas || []).slice(0, 2).map((item, index) => {
                  const rec = getRecommendation(item);
                  return (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-gray-800 mb-2">
                        {language === 'en' ? `Focus on: ${item.name?.en || item.key}` : `ركز على: ${item.name?.ar || item.key}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {rec?.recommendation || (language === 'en' 
                          ? 'Continue developing this competency through practice and targeted learning.'
                          : 'استمر في تطوير هذه الكفاءة من خلال الممارسة والتعلم المستهدف.'
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report Footer */}
            <div className={`p-4 text-center text-sm ${isKafaat ? 'bg-kafaat-navy' : 'bg-yellow-600'} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${isKafaat ? 'bg-kafaat-gold' : 'bg-white'}`}>
                    <span className={`font-bold text-sm ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>K</span>
                  </div>
                  <span>{language === 'en' ? 'Kafaat Smart Evaluation Platform' : 'منصة كفاءات للتقييم الذكي'}</span>
                </div>
                <p className={`${isKafaat ? 'text-blue-200' : 'text-yellow-100'}`}>
                  {language === 'en' ? 'Powered by THOT Knowledge' : 'مدعوم من ثوت للمعرفة'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Download Button */}
        {report && report.data && (
          <div className="text-center mb-8">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                downloading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isKafaat 
                    ? 'bg-gradient-to-r from-kafaat-navy to-blue-700 text-white hover:shadow-xl transform hover:scale-105'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {downloading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {language === 'en' ? 'Generating PDF...' : 'جاري إنشاء PDF...'}
                </>
              ) : (
                <>
                  <span className="text-2xl">📥</span>
                  {language === 'en' ? 'Download Your Report (PDF)' : 'تحميل تقريرك (PDF)'}
                </>
              )}
            </button>
          </div>
        )}

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center ${isKafaat ? 'bg-blue-100' : 'bg-yellow-100'}`}>📋</span>
            {text.whatNext}
          </h3>
          <ul className="space-y-3">
            {text.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white ${isKafaat ? 'bg-blue-600' : 'bg-yellow-500'}`}>
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Professional Message */}
        <div className={`rounded-2xl p-8 mb-8 border ${isKafaat ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'}`}>
          <p className="text-gray-700 leading-relaxed text-lg">{text.greeting}</p>
          <p className="text-gray-600 mt-4">{text.mainMessage}</p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">{language === 'en' ? 'With appreciation,' : 'مع التقدير،'}</p>
            <p className={`font-bold text-lg ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-700'}`}>
              {language === 'en' ? 'The Kafaat Leadership Development Team' : 'فريق كفاءات لتطوير القيادة'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          {auth.isLoggedIn() ? (
            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-white ${
                isKafaat ? 'bg-gradient-to-r from-kafaat-navy to-blue-700' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
            >
              <span>←</span>
              {language === 'en' ? 'Return to Your Dashboard' : 'العودة للوحة التحكم'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-white ${
                isKafaat ? 'bg-gradient-to-r from-kafaat-navy to-blue-700' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
            >
              <span>←</span>
              {language === 'en' ? 'Return to Login' : 'العودة لتسجيل الدخول'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>© 2024 {language === 'en' ? 'Kafaat Smart Evaluation Platform' : 'منصة كفاءات للتقييم الذكي'}</p>
          <p className="mt-1">
            {language === 'en' ? 'Powered by THOT Knowledge' : 'مدعوم من ثوت للمعرفة'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
