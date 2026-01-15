import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import * as auth from '../utils/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { kafaatCompetencyData, leadership360Data, getPerformanceTier } from '../data/reportRecommendations';
import { generatePersonalizedAnalysis, generateExecutiveSummary } from '../utils/aiAnalysis';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  // Competency key mapping - supports both Kafaat and 360 assessments
  const competencyKeyMap = {
    // Kafaat mappings (snake_case from assessment responses)
    leadership_fundamentals: 'leadershipFundamentals',
    change_management: 'changeManagement',
    performance_management: 'performanceManagement',
    team_building: 'teamBuilding',
    communication: 'communication',
    problem_solving: 'problemSolving',
    emotional_intelligence: 'emotionalIntelligence',
    strategic_implementation: 'strategicImplementation',
    // 360 mappings (direct camelCase from questions)
    vision: 'vision',
    teamLeadership: 'teamLeadership',
    decisionMaking: 'decisionMaking',
    emotionalIntelligence: 'emotionalIntelligence',
    changeManagement: 'changeManagement',
    accountability: 'accountability',
    development: 'development',
    integrity: 'integrity',
    innovation: 'innovation'
  };

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
          
          // Generate AI-powered analysis
          const competencies = latestReport.data?.competencies || latestReport.data?.categories || [];
          const responses = latestReport.data?.responses || [];
          
          if (competencies.length > 0) {
            const analysis = generatePersonalizedAnalysis(responses, competencies, language);
            setAiAnalysis(analysis);
          }
        }
      }
    };
    init();
  }, [type, language]);

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
    if (score >= 90) return { en: 'Outstanding', ar: 'متميز', color: 'text-emerald-600 bg-emerald-100', bgGradient: 'from-emerald-500 to-emerald-700', icon: '🏆' };
    if (score >= 80) return { en: 'Excellent', ar: 'ممتاز', color: 'text-green-600 bg-green-100', bgGradient: 'from-green-500 to-green-700', icon: '⭐' };
    if (score >= 70) return { en: 'Very Good', ar: 'جيد جداً', color: 'text-blue-600 bg-blue-100', bgGradient: 'from-blue-500 to-blue-700', icon: '✅' };
    if (score >= 60) return { en: 'Good', ar: 'جيد', color: 'text-cyan-600 bg-cyan-100', bgGradient: 'from-cyan-500 to-cyan-700', icon: '👍' };
    if (score >= 50) return { en: 'Satisfactory', ar: 'مقبول', color: 'text-yellow-600 bg-yellow-100', bgGradient: 'from-yellow-500 to-yellow-700', icon: '📊' };
    return { en: 'Developing', ar: 'بحاجة للتطوير', color: 'text-orange-600 bg-orange-100', bgGradient: 'from-orange-500 to-orange-700', icon: '📈' };
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
          "Review your personalized AI-powered results and insights below",
          "Download your comprehensive report for future reference",
          "Focus on your development priorities identified by the AI analysis",
          "Track your progress using the recommended milestones"
        ]
      },
      ar: {
        title: "تم إكمال التقييم بنجاح!",
        subtitle: "نتائج تقييم كفاءات القيادي الذكي",
        greeting: "تهانينا على إكمال تقييمك!",
        mainMessage: `نتقدم لك بخالص الشكر والتقدير على إكمالك تقييم كفاءات القيادي الذكي. إن تفانيك في التطوير المهني ونمو القيادة أمر يستحق الثناء.`,
        whatNext: "ماذا بعد؟",
        nextSteps: [
          "راجع نتائجك ورؤاك المخصصة المدعومة بالذكاء الاصطناعي أدناه",
          "قم بتحميل تقريرك الشامل للرجوع إليه مستقبلاً",
          "ركز على أولويات التطوير المحددة من تحليل الذكاء الاصطناعي",
          "تابع تقدمك باستخدام المعالم الموصى بها"
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
          "Review your personalized AI-powered results and insights below",
          "Download your comprehensive report for future reference",
          "Focus on your development priorities identified by the AI analysis",
          "Track your progress using the recommended milestones"
        ]
      },
      ar: {
        title: "تم إرسال التقييم بنجاح!",
        subtitle: "نتائج تقييم القيادة 360°",
        greeting: "شكراً لإكمالك التقييم!",
        mainMessage: `نقدر بصدق مشاركتك المدروسة في إكمال تقييم القيادة 360°. ملاحظاتك الشاملة توفر رؤى قيمة لتطوير القيادة.`,
        whatNext: "ماذا بعد؟",
        nextSteps: [
          "راجع نتائجك ورؤاك المخصصة المدعومة بالذكاء الاصطناعي أدناه",
          "قم بتحميل تقريرك الشامل للرجوع إليه مستقبلاً",
          "ركز على أولويات التطوير المحددة من تحليل الذكاء الاصطناعي",
          "تابع تقدمك باستخدام المعالم الموصى بها"
        ]
      }
    }
  };

  const content = messages[type] || messages.kafaat;
  const text = content[language];
  const performanceLevel = report?.data?.overallScore ? getPerformanceLevel(report.data.overallScore) : null;
  const isKafaat = type === 'kafaat';

  // Generate radar chart SVG
  const generateRadarChart = () => {
    const items = report?.data?.competencies || report?.data?.categories || [];
    const n = items.length;
    if (n === 0) return null;
    
    const size = 200;
    const center = size / 2;
    const maxRadius = 80;
    const angleStep = (2 * Math.PI) / n;
    
    // Grid circles
    const gridCircles = [20, 40, 60, 80, 100].map((pct) => {
      const r = (pct / 100) * maxRadius;
      return (
        <circle key={pct} cx={center} cy={center} r={r} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
      );
    });

    // Grid lines
    const gridLines = items.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x2 = center + maxRadius * Math.cos(angle);
      const y2 = center + maxRadius * Math.sin(angle);
      return (
        <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1" />
      );
    });
    
    // Data polygon
    const points = items.map((item, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (item.score / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    
    // Labels
    const labels = items.map((item, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const labelR = maxRadius + 20;
      const x = center + labelR * Math.cos(angle);
      const y = center + labelR * Math.sin(angle);
      // Handle different name formats for Kafaat vs 360 assessments
      let name;
      if (item.name?.[language]?.name) {
        // 360 format: { en: { name: '...', icon: '...' } }
        name = item.name[language].name;
      } else if (typeof item.name?.[language] === 'string') {
        // Kafaat format: { en: '...', ar: '...' }
        name = item.name[language];
      } else if (item.name?.en?.name) {
        name = item.name.en.name;
      } else if (typeof item.name?.en === 'string') {
        name = item.name.en;
      } else {
        // Fallback to key with capitalization
        const key = item.key || 'Unknown';
        name = key.replace(/([A-Z])/g, ' $1').trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }
      const shortName = name.length > 12 ? name.substring(0, 10) + '...' : name;
      
      return (
        <text 
          key={i} 
          x={x} 
          y={y} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-xs fill-gray-600"
          fontSize="8"
        >
          {shortName}
        </text>
      );
    });

    return (
      <svg width={size} height={size} className="mx-auto" viewBox={`0 0 ${size} ${size}`}>
        {gridCircles}
        {gridLines}
        <polygon
          points={points}
          fill={isKafaat ? "rgba(59, 130, 246, 0.3)" : "rgba(234, 179, 8, 0.3)"}
          stroke={isKafaat ? "#2563eb" : "#ca8a04"}
          strokeWidth="2.5"
        />
        {items.map((item, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const r = (item.score / 100) * maxRadius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          const tier = getPerformanceTier(item.score);
          const dotColor = tier === 'high' ? '#10b981' : tier === 'medium' ? '#3b82f6' : '#f59e0b';
          return (
            <circle key={i} cx={x} cy={y} r="5" fill={dotColor} stroke="#fff" strokeWidth="2" />
          );
        })}
        {labels}
      </svg>
    );
  };

  // Helper function to get display name for competency/category
  const getDisplayName = (item) => {
    // Handle different name formats for Kafaat vs 360 assessments
    if (item.name?.[language]?.name) {
      // 360 format: { en: { name: '...', icon: '...' } }
      return item.name[language].name;
    } else if (typeof item.name?.[language] === 'string') {
      // Kafaat format: { en: '...', ar: '...' }
      return item.name[language];
    } else if (item.name?.en?.name) {
      return item.name.en.name;
    } else if (typeof item.name?.en === 'string') {
      return item.name.en;
    } else {
      // Fallback to key with capitalization
      const key = item.key || 'Unknown';
      let name = key.replace(/([A-Z])/g, ' $1').trim();
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  // Generate bar chart for competencies
  const generateCompetencyBars = () => {
    const items = report?.data?.competencies || report?.data?.categories || [];
    
    return items.sort((a, b) => b.score - a.score).map((item, index) => {
      const tier = getPerformanceTier(item.score);
      const barColor = tier === 'high' 
        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
        : tier === 'medium' 
          ? 'bg-gradient-to-r from-blue-400 to-blue-600'
          : 'bg-gradient-to-r from-orange-400 to-orange-600';
      
      return (
        <div key={index} className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {getDisplayName(item)}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                tier === 'high' ? 'bg-emerald-100 text-emerald-700' :
                tier === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {tier === 'high' 
                  ? (language === 'en' ? 'Strong' : 'قوي')
                  : tier === 'medium' 
                    ? (language === 'en' ? 'Good' : 'جيد')
                    : (language === 'en' ? 'Develop' : 'للتطوير')
                }
              </span>
              <span className="text-sm font-bold text-gray-800">{item.score}%</span>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${item.score}%` }}
            />
          </div>
        </div>
      );
    });
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
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full">
              {language === 'en' ? 'AI-Powered Analysis' : 'تحليل بالذكاء الاصطناعي'}
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

        {/* AI-Powered Results Report Card */}
        {report && report.data && (
          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Report Header */}
            <div className={`${isKafaat ? 'bg-gradient-to-r from-kafaat-navy via-blue-700 to-blue-800' : 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500'} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isKafaat ? 'bg-kafaat-gold' : 'bg-white'} shadow-lg`}>
                    <span className={`font-bold text-2xl ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>K</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {type === 'kafaat' 
                        ? (language === 'en' ? 'Kafaat AI Leadership Assessment' : 'تقييم كفاءات القيادي')
                        : (language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°')
                      }
                    </h2>
                    <p className={`${isKafaat ? 'text-blue-200' : 'text-yellow-100'} flex items-center gap-2`}>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {language === 'en' ? 'AI-Generated Personalized Report' : 'تقرير مخصص مُولّد بالذكاء الاصطناعي'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isKafaat ? 'text-blue-200' : 'text-yellow-100'}`}>
                    {language === 'en' ? 'Report ID' : 'رقم التقرير'}
                  </p>
                  <p className="font-mono text-sm">{report.id?.slice(-8).toUpperCase() || 'N/A'}</p>
                  <p className="font-semibold mt-1">
                    {new Date(report.completedAt).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US')}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            {user && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${isKafaat ? 'from-blue-100 to-blue-200' : 'from-yellow-100 to-yellow-200'} shadow-inner`}>
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{language === 'ar' ? user.nameAr || user.name : user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {(user.department || user.position) && (
                      <p className="text-sm text-gray-500">
                        {user.position && user.position}
                        {user.position && user.department && ' • '}
                        {user.department && user.department}
                      </p>
                    )}
                  </div>
                  {aiAnalysis?.overallProfile && (
                    <div className="text-right">
                      <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${isKafaat ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {aiAnalysis.overallProfile.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Executive Summary - AI Generated */}
            {aiAnalysis?.overallProfile && (
              <div className={`p-6 border-b ${isKafaat ? 'bg-blue-50/50' : 'bg-yellow-50/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-lg font-bold text-gray-800">
                    {language === 'en' ? 'AI Executive Summary' : 'الملخص التنفيذي بالذكاء الاصطناعي'}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {aiAnalysis.overallProfile.description}
                </p>
              </div>
            )}

            {/* Overall Score & Radar Chart */}
            <div className="p-6 grid md:grid-cols-2 gap-8 border-b">
              {/* Score Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {language === 'en' ? 'Overall Leadership Score' : 'النتيجة القيادية الإجمالية'}
                </h3>
                <div className="relative inline-flex flex-col items-center">
                  {/* Score Circle */}
                  <div className="relative">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="75"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="75"
                        fill="none"
                        stroke={report.data.overallScore >= 80 ? '#10b981' : report.data.overallScore >= 60 ? '#3b82f6' : '#f59e0b'}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(report.data.overallScore / 100) * 471} 471`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${
                        report.data.overallScore >= 80 ? 'text-emerald-600' :
                        report.data.overallScore >= 60 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {report.data.overallScore}
                      </span>
                      <span className="text-gray-500 text-sm">{language === 'en' ? 'out of 100' : 'من 100'}</span>
                    </div>
                  </div>
                  {performanceLevel && (
                    <span className={`mt-4 px-5 py-2 rounded-full font-bold text-lg ${performanceLevel.color}`}>
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

            {/* Leadership Style Analysis */}
            {aiAnalysis?.leadershipStyle && (
              <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎯</span>
                  <h3 className="text-lg font-bold text-gray-800">
                    {language === 'en' ? 'Your Leadership Style' : 'أسلوبك القيادي'}
                  </h3>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-purple-800">{aiAnalysis.leadershipStyle.primary}</h4>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                      {aiAnalysis.leadershipStyle.score}%
                    </span>
                  </div>
                  <p className="text-gray-600">{aiAnalysis.leadershipStyle.description}</p>
                </div>
              </div>
            )}

            {/* Competency Breakdown */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'en' ? 'Detailed Competency Analysis' : 'تحليل الكفاءات التفصيلي'}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                {generateCompetencyBars()}
              </div>
            </div>

            {/* AI-Powered Insights */}
            {aiAnalysis && (
              <>
                {/* Behavioral Insights */}
                {aiAnalysis.behavioralInsights && aiAnalysis.behavioralInsights.length > 0 && (
                  <div className="p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🧠</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {language === 'en' ? 'AI-Identified Leadership Tendencies' : 'النزعات القيادية المُحددة بالذكاء الاصطناعي'}
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      {aiAnalysis.behavioralInsights.map((insight, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-cyan-200">
                          <h4 className="font-bold text-cyan-800 mb-1">{insight.type}</h4>
                          <p className="text-gray-600 text-sm">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deep Strengths Analysis */}
                {aiAnalysis.strengthsDeep && aiAnalysis.strengthsDeep.length > 0 && (
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">💪</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {language === 'en' ? 'Your Signature Strengths' : 'نقاط قوتك المميزة'}
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aiAnalysis.strengthsDeep.map((strength, index) => (
                        <div key={index} className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-5 border border-emerald-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <span className="text-2xl font-bold text-emerald-600">{strength.score}%</span>
                          </div>
                          <h4 className="font-bold text-emerald-800 mb-2">{strength.competency}</h4>
                          <p className="text-sm text-emerald-700 mb-3">{strength.insight}</p>
                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-xs font-medium text-emerald-600">
                              <strong>{language === 'en' ? 'How to leverage:' : 'كيفية الاستفادة:'}</strong> {strength.leverageStrategy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Development Priorities */}
                {aiAnalysis.developmentPriorities && aiAnalysis.developmentPriorities.length > 0 && (
                  <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🎯</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {language === 'en' ? 'Priority Development Areas' : 'مجالات التطوير ذات الأولوية'}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {aiAnalysis.developmentPriorities.map((dev, index) => (
                        <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-orange-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                dev.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                dev.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {dev.priorityLabel}
                              </span>
                              <h4 className="font-bold text-gray-800">{dev.competency}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-orange-600 font-bold">{dev.score}%</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-emerald-600 font-bold">{dev.targetScore}%</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{dev.insight}</p>
                          <div className="bg-orange-50 rounded-lg p-4">
                            <p className="text-sm text-orange-800 mb-2">
                              <strong>{language === 'en' ? 'Recommended Actions:' : 'الإجراءات الموصى بها:'}</strong>
                            </p>
                            <ul className="space-y-1">
                              {dev.specificActions.map((action, i) => (
                                <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                                  <span className="text-orange-500 mt-1">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs text-orange-600 mt-2">
                              <strong>{language === 'en' ? 'Target Timeline:' : 'الإطار الزمني المستهدف:'}</strong> {dev.timeline}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Steps */}
                {aiAnalysis.actionableSteps && (
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">📋</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {language === 'en' ? 'Your Action Plan' : 'خطة عملك'}
                      </h3>
                    </div>
                    <div className="relative">
                      <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isKafaat ? 'bg-blue-200' : 'bg-yellow-200'}`}></div>
                      <div className="space-y-4">
                        {aiAnalysis.actionableSteps.map((step, index) => (
                          <div key={index} className="relative pl-10">
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              isKafaat ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <span className={`text-sm font-bold ${isKafaat ? 'text-blue-600' : 'text-yellow-600'}`}>
                                {step.timeframe}
                              </span>
                              <p className="text-gray-700 mt-1">{step.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Milestones */}
                {aiAnalysis.progressMetrics && (
                  <div className={`p-6 ${isKafaat ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🏁</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {language === 'en' ? '90-Day Progress Milestones' : 'معالم التقدم لـ 90 يوم'}
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {aiAnalysis.progressMetrics.milestones.map((milestone, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              isKafaat ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}>
                              {milestone.days}
                            </span>
                            <span className="text-sm font-bold text-gray-600">{milestone.label}</span>
                          </div>
                          <p className="text-sm text-gray-700">{milestone.goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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
