import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import ScoreGauge from '../components/ScoreGauge';
import * as storage from '../utils/storage';
import { calculateKafaatScores, calculate360Scores, generateRecommendations, generateActionPlan } from '../utils/reportGenerator';

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const reportRef = useRef(null);
  const [assessment, setAssessment] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const data = storage.getAssessmentById(id);
    if (!data || data.status !== 'completed') {
      navigate('/admin');
      return;
    }
    
    setAssessment(data);
    
    // Generate report data
    if (data.type === 'kafaat') {
      const scores = calculateKafaatScores(data.responses, language);
      const recommendations = generateRecommendations(scores.developmentAreas, language);
      const actionPlan = generateActionPlan(scores.developmentAreas, language);
      setReportData({ ...scores, recommendations, actionPlan });
    } else {
      const scores = calculate360Scores(data.evaluators, language);
      const recommendations = generateRecommendations(scores.developmentAreas, language);
      const actionPlan = generateActionPlan(scores.developmentAreas, language);
      setReportData({ ...scores, recommendations, actionPlan });
    }
    
    setLoading(false);
  }, [id, language, navigate]);

  const downloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${assessment.applicantName || assessment.managerName}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(language === 'en' ? 'Error generating PDF' : 'خطأ في إنشاء الـ PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!assessment || !reportData) {
    return null;
  }

  const isKafaat = assessment.type === 'kafaat';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Assessment Report' : 'تقرير التقييم'}
            </h1>
            <p className="text-gray-600">
              {assessment.applicantName || assessment.managerName} • {assessment.position}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {language === 'en' ? 'Back to Admin' : 'العودة للإدارة'}
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-kafaat-navy text-white rounded-lg hover:bg-blue-800 flex items-center gap-2"
            >
              📥 {language === 'en' ? 'Download PDF' : 'تحميل PDF'}
            </button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', en: 'Overview', ar: 'نظرة عامة' },
                { id: 'competencies', en: 'Competencies', ar: 'الكفاءات' },
                { id: 'recommendations', en: 'Recommendations', ar: 'التوصيات' },
                { id: 'action-plan', en: 'Action Plan', ar: 'خطة العمل' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-kafaat-navy text-kafaat-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {language === 'en' ? tab.en : tab.ar}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewSection 
              assessment={assessment}
              reportData={reportData}
              language={language}
              isKafaat={isKafaat}
            />
          )}
          
          {activeTab === 'competencies' && (
            <CompetenciesSection 
              reportData={reportData}
              language={language}
            />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsSection 
              reportData={reportData}
              language={language}
            />
          )}
          
          {activeTab === 'action-plan' && (
            <ActionPlanSection 
              reportData={reportData}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Section
const OverviewSection = ({ assessment, reportData, language, isKafaat }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'en' ? 'Executive Summary' : 'الملخص التنفيذي'}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Overall Score */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <ScoreGauge 
                score={reportData.overallPercentage} 
                label={language === 'en' ? 'Overall Score' : 'النتيجة الإجمالية'}
              />
            </div>
          </div>
          
          {/* Assessment Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {language === 'en' ? 'Assessment Details' : 'تفاصيل التقييم'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'en' ? 'Type' : 'النوع'}:</span>
                <span className="font-medium">{isKafaat ? (language === 'en' ? 'Kafaat AI' : 'كفاءات') : '360°'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'en' ? 'Name' : 'الاسم'}:</span>
                <span className="font-medium">{assessment.applicantName || assessment.managerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'en' ? 'Position' : 'المنصب'}:</span>
                <span className="font-medium">{assessment.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'en' ? 'Department' : 'القسم'}:</span>
                <span className="font-medium">{assessment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'en' ? 'Completed' : 'تاريخ الإكمال'}:</span>
                <span className="font-medium">
                  {new Date(assessment.completedAt).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {language === 'en' ? 'Quick Stats' : 'إحصائيات سريعة'}
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-800 font-medium text-sm">
                  {language === 'en' ? 'Strongest Area' : 'أقوى مجال'}
                </div>
                <div className="text-green-900 font-bold">
                  {reportData.strengths[0]?.name || '-'}
                </div>
                <div className="text-green-600 text-sm">
                  {reportData.strengths[0]?.percentage}%
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-800 font-medium text-sm">
                  {language === 'en' ? 'Development Priority' : 'أولوية التطوير'}
                </div>
                <div className="text-red-900 font-bold">
                  {reportData.developmentAreas[0]?.name || '-'}
                </div>
                <div className="text-red-600 text-sm">
                  {reportData.developmentAreas[0]?.percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competency Radar Chart */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {language === 'en' ? 'Competency Profile' : 'ملف الكفاءات'}
        </h3>
        <RadarChart 
          data={isKafaat ? reportData.competencies : reportData.categories}
        />
      </div>

      {/* Strengths & Development Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            {language === 'en' ? 'Key Strengths' : 'نقاط القوة الرئيسية'}
          </h3>
          <div className="space-y-3">
            {reportData.strengths.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Development Areas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            {language === 'en' ? 'Development Areas' : 'مجالات التطوير'}
          </h3>
          <div className="space-y-3">
            {reportData.developmentAreas.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Competencies Section
const CompetenciesSection = ({ reportData, language }) => {
  const competencies = reportData.competencies || reportData.categories;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {language === 'en' ? 'Detailed Competency Analysis' : 'تحليل الكفاءات التفصيلي'}
      </h2>
      
      <BarChart data={competencies} showColorByValue={true} />
      
      <div className="mt-8 space-y-4">
        {competencies.map((comp, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{comp.name}</h4>
              <span className={`px-4 py-1 rounded-full font-bold text-sm ${
                comp.percentage >= 85 ? 'bg-green-100 text-green-800' :
                comp.percentage >= 70 ? 'bg-blue-100 text-blue-800' :
                comp.percentage >= 55 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {comp.percentage}%
              </span>
            </div>
            
            {comp.description && (
              <p className="text-gray-600 mb-4">{comp.description}</p>
            )}
            
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  comp.percentage >= 85 ? 'bg-green-500' :
                  comp.percentage >= 70 ? 'bg-blue-500' :
                  comp.percentage >= 55 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${comp.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{language === 'en' ? 'Needs Improvement' : 'يحتاج تحسين'}</span>
              <span>{language === 'en' ? 'Average' : 'متوسط'}</span>
              <span>{language === 'en' ? 'Good' : 'جيد'}</span>
              <span>{language === 'en' ? 'Excellent' : 'ممتاز'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recommendations Section
const RecommendationsSection = ({ reportData, language }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {language === 'en' ? 'Development Recommendations' : 'توصيات التطوير'}
      </h2>
      
      {reportData.recommendations.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">🎉</span>
          <p className="text-xl text-gray-600">
            {language === 'en' 
              ? 'Excellent performance across all areas! Continue maintaining your high standards.'
              : 'أداء ممتاز في جميع المجالات! استمر في الحفاظ على معاييرك العالية.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reportData.recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`border-l-4 p-6 rounded-r-xl ${
                rec.priority === 'high' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rec.priority === 'high'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {rec.priority === 'high' 
                    ? (language === 'en' ? 'High Priority' : 'أولوية عالية')
                    : (language === 'en' ? 'Medium Priority' : 'أولوية متوسطة')
                  }
                </span>
                <h3 className="text-lg font-bold text-gray-900">{rec.competency}</h3>
              </div>
              
              <h4 className="font-medium text-gray-700 mb-3">
                {language === 'en' ? 'Recommended Actions:' : 'الإجراءات الموصى بها:'}
              </h4>
              <ul className="space-y-2">
                {rec.actions.map((action, actionIndex) => (
                  <li key={actionIndex} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Action Plan Section
const ActionPlanSection = ({ reportData, language }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {language === 'en' ? '90-Day Development Action Plan' : 'خطة عمل تطوير 90 يوماً'}
      </h2>
      
      <div className="space-y-6">
        {reportData.actionPlan.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className={`p-4 ${
              item.priority === 1 ? 'bg-red-500' :
              item.priority === 2 ? 'bg-orange-500' :
              'bg-yellow-500'
            } text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {language === 'en' ? `Priority ${item.priority}` : `الأولوية ${item.priority}`}: {item.competency}
                </h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {language === 'en' ? item.timeline : item.timelineAr}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {/* Progress Targets */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{language === 'en' ? 'Current' : 'الحالي'}: {item.currentLevel}%</span>
                  <span>{language === 'en' ? 'Target' : 'المستهدف'}: {item.targetLevel}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-blue-300 absolute"
                    style={{ width: `${item.targetLevel}%` }}
                  ></div>
                  <div 
                    className="h-full bg-blue-600 absolute"
                    style={{ width: `${item.currentLevel}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Actions */}
              <h4 className="font-medium text-gray-800 mb-3">
                {language === 'en' ? 'Key Actions:' : 'الإجراءات الرئيسية:'}
              </h4>
              <ul className="space-y-2">
                {item.actions?.map((action, actionIndex) => (
                  <li key={actionIndex} className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      {/* Download reminder */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg flex items-center gap-4">
        <span className="text-3xl">💡</span>
        <p className="text-blue-800">
          {language === 'en' 
            ? 'Remember to download this report for your records and share with your manager or coach for follow-up discussions.'
            : 'تذكر تحميل هذا التقرير لسجلاتك ومشاركته مع مديرك أو مدربك لمناقشات المتابعة.'
          }
        </p>
      </div>
    </div>
  );
};

export default ReportPage;
