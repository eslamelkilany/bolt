import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { kafaatCompetencyData, leadership360Data, getPerformanceTier, getCompetencyRecommendation, generateDevelopmentPlan } from '../data/reportRecommendations';

const AdminReportView = () => {
  const { userId, reportId } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!auth.isLoggedIn() || !auth.isAdmin()) {
        navigate('/admin-login');
        return;
      }

      const userData = await auth.getUserById(userId);
      if (!userData) {
        navigate('/admin');
        return;
      }

      setUser(userData);
      setAllReports(userData.reports || []);

      if (reportId) {
        const specificReport = userData.reports?.find(r => r.id === reportId);
        setReport(specificReport);
      } else if (userData.reports?.length > 0) {
        setReport(userData.reports[0]);
      }

      setLoading(false);
    };
    
    init();
  }, [userId, reportId, navigate]);

  const downloadPDF = async () => {
    if (!reportRef.current || downloading) return;
    
    setDownloading(true);
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
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
      
      const fileName = `${user.name.replace(/\s+/g, '_')}_${report.assessmentType}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(language === 'en' ? 'Error generating PDF. Please try again.' : 'خطأ في إنشاء PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kafaat-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Loading Report...' : 'جاري تحميل التقرير...'}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} isAdmin={true} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-6xl block mb-4">📊</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'No Reports Available' : 'لا توجد تقارير متاحة'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'en' 
              ? 'This user has not completed any assessments yet.'
              : 'لم يكمل هذا المستخدم أي تقييمات بعد.'
            }
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-kafaat-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800"
          >
            {language === 'en' ? 'Back to Admin Dashboard' : 'العودة للوحة التحكم'}
          </button>
        </div>
      </div>
    );
  }

  const data = report.data;
  const isKafaat = report.assessmentType === 'kafaat';
  const competencyData = isKafaat ? data.competencies : data.categories;

  // Map assessment competency keys to recommendation data keys
  const competencyKeyMap = {
    // Kafaat mappings
    leadership_fundamentals: 'leadershipFundamentals',
    change_management: 'changeManagement',
    performance_management: 'performanceManagement',
    team_building: 'teamBuilding',
    communication: 'communication',
    problem_solving: 'problemSolving',
    emotional_intelligence: 'emotionalIntelligence',
    strategic_implementation: 'strategicImplementation',
    // 360 mappings
    vision: 'vision',
    team_leadership: 'teamLeadership',
    decision_making: 'decisionMaking',
    change: 'changeManagement',
    accountability: 'accountability',
    development: 'development',
    integrity: 'integrity',
    innovation: 'innovation'
  };

  // Get competency name helper with recommendation data
  const getCompetencyInfo = (item) => {
    const key = item.key || item.competency;
    const mappedKey = competencyKeyMap[key] || key;
    const recommendationSource = isKafaat ? kafaatCompetencyData : leadership360Data;
    const recommendationData = recommendationSource[mappedKey];
    
    let displayName;
    if (isKafaat) {
      displayName = language === 'en' ? item.name?.en : item.name?.ar;
    } else {
      if (item.name && item.name[language]) {
        displayName = item.name[language].name || item.name[language];
      } else {
        displayName = item.key || 'Unknown';
      }
    }
    
    return {
      name: displayName,
      key: mappedKey,
      recommendationData
    };
  };

  // Get specific recommendation based on score
  const getRecommendation = (item) => {
    const { key, recommendationData } = getCompetencyInfo(item);
    if (!recommendationData) return null;
    
    const tier = getPerformanceTier(item.score);
    const langData = recommendationData[language] || recommendationData.en;
    const performanceKey = tier === 'high' ? 'highPerformance' : tier === 'medium' ? 'mediumPerformance' : 'lowPerformance';
    
    return {
      insight: langData[performanceKey]?.insight,
      recommendation: langData[performanceKey]?.recommendation,
      resources: recommendationData.resources || [],
      tier
    };
  };

  // Performance level calculation
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: language === 'en' ? 'Outstanding' : 'متميز', color: 'emerald', icon: '🏆', bgClass: 'bg-emerald-500' };
    if (score >= 80) return { level: language === 'en' ? 'Excellent' : 'ممتاز', color: 'green', icon: '⭐', bgClass: 'bg-green-500' };
    if (score >= 70) return { level: language === 'en' ? 'Very Good' : 'جيد جداً', color: 'blue', icon: '✅', bgClass: 'bg-blue-500' };
    if (score >= 60) return { level: language === 'en' ? 'Good' : 'جيد', color: 'cyan', icon: '👍', bgClass: 'bg-cyan-500' };
    if (score >= 50) return { level: language === 'en' ? 'Satisfactory' : 'مُرضي', color: 'yellow', icon: '📊', bgClass: 'bg-yellow-500' };
    if (score >= 40) return { level: language === 'en' ? 'Developing' : 'قيد التطوير', color: 'orange', icon: '📈', bgClass: 'bg-orange-500' };
    return { level: language === 'en' ? 'Needs Improvement' : 'يحتاج تحسين', color: 'red', icon: '⚠️', bgClass: 'bg-red-500' };
  };

  const performanceLevel = getPerformanceLevel(data.overallScore);
  const developmentPlan = generateDevelopmentPlan(data.developmentAreas, language);

  // Radar chart SVG generator
  const generateRadarChart = () => {
    const items = competencyData || [];
    const n = items.length;
    if (n === 0) return null;
    
    const size = 200;
    const center = size / 2;
    const maxRadius = 80;
    
    const angleStep = (2 * Math.PI) / n;
    
    // Generate grid circles
    const gridCircles = [25, 50, 75, 100].map((pct) => {
      const r = (pct / 100) * maxRadius;
      return (
        <circle
          key={pct}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    });
    
    // Generate axis lines and labels
    const axisLines = items.map((item, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = center + maxRadius * Math.cos(angle);
      const y = center + maxRadius * Math.sin(angle);
      const labelX = center + (maxRadius + 15) * Math.cos(angle);
      const labelY = center + (maxRadius + 15) * Math.sin(angle);
      
      return (
        <g key={i}>
          <line
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </g>
      );
    });
    
    // Generate data polygon
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
        {axisLines}
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
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={isKafaat ? "#1e40af" : "#ca8a04"}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} isAdmin={true} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow"
          >
            <span>←</span>
            {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all ${
              downloading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-kafaat-navy to-blue-700 text-white hover:shadow-xl'
            }`}
          >
            {downloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'en' ? 'Generating PDF...' : 'جاري إنشاء PDF...'}
              </>
            ) : (
              <>
                <span>📥</span>
                {language === 'en' ? 'Download PDF Report' : 'تحميل التقرير PDF'}
              </>
            )}
          </button>
        </div>

        {/* Report Selector */}
        {allReports.length > 1 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 no-print">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Select Report' : 'اختر التقرير'}
            </label>
            <select
              value={report.id}
              onChange={(e) => {
                const selected = allReports.find(r => r.id === e.target.value);
                setReport(selected);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {allReports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.assessmentType === 'kafaat' ? '🤖 Kafaat AI' : '🔄 360°'} - {new Date(r.completedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ===== PROFESSIONAL REPORT CONTENT ===== */}
        <div ref={reportRef} className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Report Cover Header */}
          <div className={`relative overflow-hidden ${isKafaat ? 'bg-gradient-to-br from-kafaat-navy via-blue-800 to-blue-900' : 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500'}`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
            </div>
            
            <div className="relative p-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${isKafaat ? 'bg-kafaat-gold' : 'bg-kafaat-navy'}`}>
                    <span className={`text-4xl font-bold ${isKafaat ? 'text-kafaat-navy' : 'text-white'}`}>K</span>
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">
                      {isKafaat 
                        ? (language === 'en' ? 'Kafaat AI Leadership Assessment' : 'تقييم كفاءات القيادي الذكي')
                        : (language === 'en' ? '360° Leadership Assessment' : 'تقييم القيادة 360°')
                      }
                    </h1>
                    <p className={`text-lg ${isKafaat ? 'text-blue-200' : 'text-yellow-100'}`}>
                      {language === 'en' ? 'Comprehensive Leadership Analysis Report' : 'تقرير التحليل القيادي الشامل'}
                    </p>
                    <p className={`text-sm mt-2 ${isKafaat ? 'text-blue-300' : 'text-yellow-200'}`}>
                      {new Date(report.completedAt).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 ${isKafaat ? 'bg-white border-kafaat-gold' : 'bg-white border-kafaat-navy'}`}>
                    <span className={`text-5xl font-bold ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>
                      {data.overallScore}
                    </span>
                    <span className={`text-sm font-medium ${isKafaat ? 'text-blue-600' : 'text-yellow-700'}`}>
                      {language === 'en' ? 'SCORE' : 'النتيجة'}
                    </span>
                  </div>
                  <p className={`mt-3 text-lg font-semibold ${isKafaat ? 'text-kafaat-gold' : 'text-white'}`}>
                    {performanceLevel.icon} {performanceLevel.level}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>👤</span>
              {language === 'en' ? 'Candidate Information' : 'معلومات المرشح'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{language === 'en' ? 'Full Name' : 'الاسم الكامل'}</p>
                <p className="font-bold text-gray-900 text-lg">{language === 'ar' && user.nameAr ? user.nameAr : user.name}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{language === 'en' ? 'Email' : 'البريد الإلكتروني'}</p>
                <p className="font-bold text-gray-900">{user.email}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{language === 'en' ? 'Department' : 'القسم'}</p>
                <p className="font-bold text-gray-900">{user.department || '-'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{language === 'en' ? 'Position' : 'المنصب'}</p>
                <p className="font-bold text-gray-900">{user.position || '-'}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">📈</span>
              {language === 'en' ? 'Executive Summary' : 'الملخص التنفيذي'}
            </h2>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-5xl font-bold mb-1">{data.overallScore}%</p>
                <p className="text-blue-100 font-medium">{language === 'en' ? 'Overall Score' : 'النتيجة الإجمالية'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-5xl font-bold mb-1">{data.totalQuestions}</p>
                <p className="text-green-100 font-medium">{language === 'en' ? 'Questions' : 'سؤال'}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-5xl font-bold mb-1">{competencyData?.length || 0}</p>
                <p className="text-purple-100 font-medium">{language === 'en' ? 'Dimensions' : 'بُعد'}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-5xl font-bold mb-1">{data.strengths?.length || 0}</p>
                <p className="text-orange-100 font-medium">{language === 'en' ? 'Key Strengths' : 'نقاط القوة'}</p>
              </div>
            </div>

            {/* Performance Level Box with Interpretation */}
            <div className={`rounded-2xl p-6 mb-8 border-2 ${
              data.overallScore >= 80 ? 'bg-green-50 border-green-300' :
              data.overallScore >= 60 ? 'bg-blue-50 border-blue-300' :
              data.overallScore >= 40 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  data.overallScore >= 80 ? 'bg-green-200' :
                  data.overallScore >= 60 ? 'bg-blue-200' :
                  data.overallScore >= 40 ? 'bg-yellow-200' :
                  'bg-red-200'
                }`}>
                  {performanceLevel.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    data.overallScore >= 80 ? 'text-green-800' :
                    data.overallScore >= 60 ? 'text-blue-800' :
                    data.overallScore >= 40 ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {language === 'en' ? 'Performance Level:' : 'مستوى الأداء:'} {performanceLevel.level}
                  </h3>
                  <p className="text-gray-700">
                    {data.overallScore >= 90 
                      ? (language === 'en' 
                          ? 'This individual demonstrates outstanding leadership capabilities across all dimensions. They are ready for senior leadership roles and can serve as a mentor to others.'
                          : 'يُظهر هذا الفرد قدرات قيادية استثنائية عبر جميع الأبعاد. إنه مستعد لأدوار القيادة العليا ويمكنه أن يكون مرشداً للآخرين.')
                      : data.overallScore >= 80 
                        ? (language === 'en' 
                            ? 'This individual demonstrates excellent leadership capabilities and is well-positioned for higher responsibilities. Focus areas should be on leveraging strengths.'
                            : 'يُظهر هذا الفرد قدرات قيادية ممتازة ومستعد لتحمل مسؤوليات أعلى. يجب التركيز على الاستفادة من نقاط القوة.')
                        : data.overallScore >= 70 
                          ? (language === 'en' 
                              ? 'This individual shows very good leadership skills with specific areas for targeted development to reach excellence.'
                              : 'يُظهر هذا الفرد مهارات قيادية جيدة جداً مع مجالات محددة للتطوير المستهدف للوصول إلى التميز.')
                          : data.overallScore >= 60 
                            ? (language === 'en' 
                                ? 'This individual shows solid leadership foundation with clear opportunities for growth through structured development.'
                                : 'يُظهر هذا الفرد أساساً قيادياً متيناً مع فرص واضحة للنمو من خلال التطوير المنظم.')
                            : (language === 'en' 
                                ? 'This individual has significant opportunities for growth in leadership competencies. A comprehensive development program is recommended.'
                                : 'لدى هذا الفرد فرص كبيرة للنمو في الكفاءات القيادية. يُوصى ببرنامج تطوير شامل.')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Competency Overview with Radar Chart */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Radar Chart */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  {language === 'en' ? 'Competency Radar' : 'رادار الكفاءات'}
                </h3>
                {generateRadarChart()}
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  {competencyData?.map((item, i) => (
                    <span key={i} className="bg-white px-2 py-1 rounded shadow text-gray-600">
                      {getCompetencyInfo(item).name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {language === 'en' ? 'Score Distribution' : 'توزيع الدرجات'}
                </h3>
                <div className="space-y-3">
                  {competencyData?.sort((a, b) => b.score - a.score).map((item, index) => {
                    const info = getCompetencyInfo(item);
                    const tier = getPerformanceTier(item.score);
                    const barColor = tier === 'high' ? 'from-green-400 to-green-600' :
                                     tier === 'medium' ? 'from-blue-400 to-blue-600' :
                                     'from-orange-400 to-orange-600';
                    return (
                      <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{info.name}</span>
                          <span className={`text-sm font-bold ${
                            tier === 'high' ? 'text-green-600' :
                            tier === 'medium' ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== DETAILED COMPETENCY ANALYSIS WITH RECOMMENDATIONS ===== */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">📊</span>
              {language === 'en' ? 'Detailed Competency Analysis' : 'تحليل الكفاءات التفصيلي'}
            </h2>

            <div className="space-y-6 mb-8">
              {competencyData?.map((item, index) => {
                const info = getCompetencyInfo(item);
                const recommendation = getRecommendation(item);
                const tierColor = recommendation?.tier === 'high' ? 'border-green-400 bg-green-50' :
                                  recommendation?.tier === 'medium' ? 'border-blue-400 bg-blue-50' :
                                  'border-orange-400 bg-orange-50';
                const tierBadge = recommendation?.tier === 'high' ? 'bg-green-100 text-green-800' :
                                  recommendation?.tier === 'medium' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800';
                
                return (
                  <div key={index} className={`rounded-2xl border-2 ${tierColor} overflow-hidden`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                            recommendation?.tier === 'high' ? 'bg-green-200 text-green-700' :
                            recommendation?.tier === 'medium' ? 'bg-blue-200 text-blue-700' :
                            'bg-orange-200 text-orange-700'
                          }`}>
                            {item.score}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{info.name}</h4>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tierBadge}`}>
                              {recommendation?.tier === 'high' 
                                ? (language === 'en' ? 'High Performance' : 'أداء عالٍ')
                                : recommendation?.tier === 'medium' 
                                  ? (language === 'en' ? 'Developing' : 'قيد التطوير')
                                  : (language === 'en' ? 'Growth Opportunity' : 'فرصة نمو')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">{item.score}%</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            recommendation?.tier === 'high' ? 'from-green-400 to-green-600' :
                            recommendation?.tier === 'medium' ? 'from-blue-400 to-blue-600' :
                            'from-orange-400 to-orange-600'
                          } rounded-full transition-all duration-1000`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>

                      {recommendation && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Insight */}
                          <div className="bg-white rounded-xl p-4">
                            <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <span>💡</span>
                              {language === 'en' ? 'Assessment Insight' : 'استنتاج التقييم'}
                            </h5>
                            <p className="text-gray-600 text-sm">{recommendation.insight}</p>
                          </div>
                          
                          {/* Recommendation */}
                          <div className="bg-white rounded-xl p-4">
                            <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <span>🎯</span>
                              {language === 'en' ? 'Development Recommendation' : 'توصية التطوير'}
                            </h5>
                            <p className="text-gray-600 text-sm">{recommendation.recommendation}</p>
                          </div>
                        </div>
                      )}

                      {/* Resources */}
                      {recommendation?.resources?.length > 0 && (
                        <div className="mt-4 bg-white rounded-xl p-4">
                          <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span>📚</span>
                            {language === 'en' ? 'Recommended Resources' : 'موارد موصى بها'}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.resources.map((resource, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                {resource[language] || resource.en}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strengths & Development Areas - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">💪</span>
                  {language === 'en' ? 'Top Strengths' : 'نقاط القوة الرئيسية'}
                </h3>
                <div className="space-y-3">
                  {data.strengths?.map((s, i) => {
                    const info = getCompetencyInfo(s);
                    return (
                      <div key={i} className="bg-white rounded-xl p-4 shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                              {i + 1}
                            </span>
                            <span className="font-medium text-gray-800">{info.name}</span>
                          </div>
                          <span className="text-green-600 font-bold text-lg">{s.score}%</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                          {language === 'en' 
                            ? 'Leverage this strength to mentor others and lead initiatives.'
                            : 'استفد من هذه القوة لتوجيه الآخرين وقيادة المبادرات.'
                          }
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Development Areas */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">📈</span>
                  {language === 'en' ? 'Development Priorities' : 'أولويات التطوير'}
                </h3>
                <div className="space-y-3">
                  {data.developmentAreas?.map((d, i) => {
                    const info = getCompetencyInfo(d);
                    const rec = getRecommendation(d);
                    return (
                      <div key={i} className="bg-white rounded-xl p-4 shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                              {i + 1}
                            </span>
                            <span className="font-medium text-gray-800">{info.name}</span>
                          </div>
                          <span className="text-orange-600 font-bold text-lg">{d.score}%</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                          {rec?.recommendation?.slice(0, 100)}...
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== 90-DAY DEVELOPMENT PLAN ===== */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center">🎯</span>
                {language === 'en' ? '90-Day Development Action Plan' : 'خطة عمل التطوير لـ 90 يوماً'}
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {developmentPlan.map((phase, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-blue-100 text-blue-600' :
                        idx === 1 ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{phase.phase}</p>
                        <p className="text-sm text-gray-500">{phase.focus}</p>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {phase.activities.map((activity, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`mt-1 ${
                            idx === 0 ? 'text-blue-500' :
                            idx === 1 ? 'text-purple-500' :
                            'text-green-500'
                          }`}>•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Action Items */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center">🚀</span>
                {language === 'en' ? 'Immediate Action Items' : 'بنود العمل الفورية'}
              </h3>
              <div className="space-y-4">
                {data.developmentAreas?.slice(0, 3).map((area, i) => {
                  const info = getCompetencyInfo(area);
                  const rec = getRecommendation(area);
                  return (
                    <div key={i} className="bg-white rounded-xl p-4 shadow">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {language === 'en' ? `Priority: ${info.name}` : `الأولوية: ${info.name}`}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">
                            {rec?.recommendation}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                              {language === 'en' ? `Current: ${area.score}%` : `الحالي: ${area.score}%`}
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {language === 'en' ? `Target: ${Math.min(area.score + 20, 100)}%` : `الهدف: ${Math.min(area.score + 20, 100)}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className={`p-6 text-center text-sm ${isKafaat ? 'bg-kafaat-navy text-white' : 'bg-yellow-600 text-white'}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isKafaat ? 'bg-kafaat-gold' : 'bg-white'}`}>
                <span className={`font-bold ${isKafaat ? 'text-kafaat-navy' : 'text-yellow-600'}`}>K</span>
              </div>
              <span className="font-semibold">{language === 'en' ? 'Kafaat Smart Evaluation Platform' : 'منصة كفاءات للتقييم الذكي'}</span>
            </div>
            <p className="opacity-80">
              {language === 'en' ? 'Powered by THOT Knowledge' : 'مدعوم من ثوت للمعرفة'}
            </p>
            <p className="opacity-60 mt-2">
              {language === 'en' ? 'Report Generated:' : 'تاريخ إنشاء التقرير:'} {new Date().toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportView;
