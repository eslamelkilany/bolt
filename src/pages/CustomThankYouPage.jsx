import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CustomThankYouPage = () => {
  const { courseId, testType } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [report, setReport] = useState(null);
  const [preTestReport, setPreTestReport] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // Load course
      const storedCourses = localStorage.getItem('kafaat-custom-courses');
      if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        const foundCourse = courses.find(c => c.id === courseId);
        setCourse(foundCourse);
      }

      // Find report
      const currentReport = currentUser.reports?.find(r =>
        r.assessmentType === 'custom' &&
        r.data?.courseId === courseId &&
        r.data?.testType === testType
      );
      setReport(currentReport);

      // If post-test, also get pre-test report
      if (testType === 'post') {
        const preReport = currentUser.reports?.find(r =>
          r.assessmentType === 'custom' &&
          r.data?.courseId === courseId &&
          r.data?.testType === 'pre'
        );
        setPreTestReport(preReport);
      }

      setLoading(false);
    };

    loadData();
  }, [courseId, testType, navigate]);

  const downloadPDF = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
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

      const fileName = `${user.name}_${testType}_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(language === 'en' ? 'Error generating PDF' : 'خطأ في إنشاء PDF');
    }

    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  const score = report?.data?.score;
  const improvement = report?.data?.improvement;
  const fullReport = report?.data?.fullReport;

  // Pre-test completion view
  if (testType === 'pre') {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header showLogout={true} />

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Pre-Test Completed!' : 'تم إكمال الاختبار القبلي!'}
            </h1>

            <p className="text-lg text-purple-600 font-medium mb-4">
              {course?.title?.[language] || course?.title?.en}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Your Score' : 'درجتك'}</p>
                  <p className="text-4xl font-bold text-blue-600">{score?.percentage || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Questions' : 'الأسئلة'}</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {score?.questionResults?.filter(q => q.isCorrect).length || 0}/{score?.questionResults?.length || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {language === 'en' 
                  ? 'This baseline score will be compared to your post-test results after training.'
                  : 'سيتم مقارنة هذه الدرجة الأساسية بنتائج اختبارك البعدي بعد التدريب.'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2 justify-center">
                <span>📚</span>
                {language === 'en' ? 'Next Steps' : 'الخطوات التالية'}
              </h3>
              <p className="text-amber-700">
                {language === 'en'
                  ? 'Complete your training course, then return to take the post-test to measure your learning progress.'
                  : 'أكمل دورتك التدريبية، ثم عد لأخذ الاختبار البعدي لقياس تقدمك في التعلم.'}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-kafaat-navy text-white rounded-lg font-medium hover:bg-blue-800"
              >
                {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post-test completion view with full report
  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-kafaat-navy hover:text-blue-700 flex items-center gap-2"
          >
            <span>{isRTL ? '→' : '←'}</span>
            {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? (
              <span className="animate-spin">⚙️</span>
            ) : (
              <span>📥</span>
            )}
            {language === 'en' ? 'Download Report' : 'تحميل التقرير'}
          </button>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'en' ? 'Training Assessment Report' : 'تقرير تقييم التدريب'}
                </h1>
                <p className="text-purple-200">
                  {course?.title?.[language] || course?.title?.en}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-purple-200">{language === 'en' ? 'Trainee' : 'المتدرب'}</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-purple-200">{language === 'en' ? 'Department' : 'القسم'}</p>
                <p className="font-medium">{user?.department || '-'}</p>
              </div>
              <div>
                <p className="text-purple-200">{language === 'en' ? 'Date' : 'التاريخ'}</p>
                <p className="font-medium">{new Date(report?.completedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-purple-200">{language === 'en' ? 'Duration' : 'المدة'}</p>
                <p className="font-medium">{report?.data?.duration || '-'} {language === 'en' ? 'min' : 'دقيقة'}</p>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📊</span>
              {language === 'en' ? 'Performance Summary' : 'ملخص الأداء'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pre-Test Score */}
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <p className="text-sm text-blue-600 mb-2">{language === 'en' ? 'Pre-Test Score' : 'درجة الاختبار القبلي'}</p>
                <p className="text-4xl font-bold text-blue-700">{preTestReport?.data?.score?.percentage || improvement?.preScore || 0}%</p>
                <p className="text-sm text-blue-500 mt-1">
                  {language === 'en' ? 'Baseline' : 'خط الأساس'}
                </p>
              </div>

              {/* Post-Test Score */}
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <p className="text-sm text-green-600 mb-2">{language === 'en' ? 'Post-Test Score' : 'درجة الاختبار البعدي'}</p>
                <p className="text-4xl font-bold text-green-700">{score?.percentage || 0}%</p>
                <p className="text-sm text-green-500 mt-1">
                  {score?.passed 
                    ? (language === 'en' ? 'Passed' : 'ناجح')
                    : (language === 'en' ? 'Needs Review' : 'يحتاج مراجعة')}
                </p>
              </div>

              {/* Improvement */}
              <div className={`${improvement?.points >= 0 ? 'bg-purple-50' : 'bg-red-50'} rounded-xl p-6 text-center`}>
                <p className={`text-sm ${improvement?.points >= 0 ? 'text-purple-600' : 'text-red-600'} mb-2`}>
                  {language === 'en' ? 'Improvement' : 'التحسن'}
                </p>
                <p className={`text-4xl font-bold ${improvement?.points >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                  {improvement?.points >= 0 ? '+' : ''}{improvement?.points || 0}%
                </p>
                <p className={`text-sm ${improvement?.points >= 0 ? 'text-purple-500' : 'text-red-500'} mt-1`}>
                  {improvement?.description?.[language] || improvement?.description?.en || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Progress */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📈</span>
              {language === 'en' ? 'Learning Progress' : 'تقدم التعلم'}
            </h2>

            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              {/* Pre-test marker */}
              <div 
                className="absolute top-0 bottom-0 bg-blue-400 transition-all"
                style={{ width: `${preTestReport?.data?.score?.percentage || improvement?.preScore || 0}%` }}
              />
              {/* Post-test marker (overlay) */}
              <div 
                className="absolute top-0 bottom-0 bg-green-500 transition-all"
                style={{ width: `${score?.percentage || 0}%` }}
              />
              {/* Passing threshold line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: '70%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>0%</span>
              <span className="text-red-500">{language === 'en' ? '70% (Pass)' : '70% (النجاح)'}</span>
              <span>100%</span>
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>{language === 'en' ? 'Pre-Test' : 'قبلي'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{language === 'en' ? 'Post-Test' : 'بعدي'}</span>
              </div>
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          {fullReport?.traineeReport && (
            <>
              <div className="p-8 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                      <span>💪</span>
                      {language === 'en' ? 'Your Strengths' : 'نقاط قوتك'}
                    </h3>
                    <div className="space-y-3">
                      {fullReport.traineeReport.strengths?.map((strength, idx) => (
                        <div key={idx} className="bg-green-50 rounded-lg p-4">
                          <p className="font-medium text-green-800">
                            {typeof strength.name === 'object' ? strength.name[language] || strength.name.en : strength.name}
                          </p>
                          <p className="text-sm text-green-600 mt-1">{strength.description}</p>
                        </div>
                      )) || (
                        <p className="text-gray-500">{language === 'en' ? 'No specific strengths identified yet.' : 'لم يتم تحديد نقاط قوة محددة بعد.'}</p>
                      )}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                      <span>🎯</span>
                      {language === 'en' ? 'Areas for Improvement' : 'مجالات التحسين'}
                    </h3>
                    <div className="space-y-3">
                      {fullReport.traineeReport.areasForImprovement?.map((area, idx) => (
                        <div key={idx} className="bg-amber-50 rounded-lg p-4">
                          <p className="font-medium text-amber-800">
                            {typeof area.name === 'object' ? area.name[language] || area.name.en : area.name}
                          </p>
                          <p className="text-sm text-amber-600 mt-1">{area.description}</p>
                        </div>
                      )) || (
                        <p className="text-gray-500">{language === 'en' ? 'No specific areas identified.' : 'لم يتم تحديد مجالات محددة.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💡</span>
                  {language === 'en' ? 'Personalized Recommendations' : 'توصيات مخصصة'}
                </h2>
                <div className="space-y-4">
                  {fullReport.traineeReport.recommendations?.map((rec, idx) => (
                    <div key={idx} className={`rounded-lg p-4 ${
                      rec.priority === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                      rec.priority === 'medium' ? 'bg-amber-50 border-l-4 border-amber-500' :
                      'bg-blue-50 border-l-4 border-blue-500'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          rec.priority === 'high' ? 'bg-red-200 text-red-700' :
                          rec.priority === 'medium' ? 'bg-amber-200 text-amber-700' :
                          'bg-blue-200 text-blue-700'
                        }`}>
                          {rec.priority === 'high' 
                            ? (language === 'en' ? 'HIGH' : 'عالي')
                            : rec.priority === 'medium'
                              ? (language === 'en' ? 'MEDIUM' : 'متوسط')
                              : (language === 'en' ? 'LOW' : 'منخفض')}
                        </span>
                        <p className="flex-1 text-gray-700">{rec.recommendation}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">{language === 'en' ? 'No recommendations available.' : 'لا توجد توصيات متاحة.'}</p>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🚀</span>
                  {language === 'en' ? 'Your Action Plan' : 'خطة عملك'}
                </h2>
                <div className="space-y-4">
                  {fullReport.traineeReport.nextSteps?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-purple-700">{step.timeframe}</p>
                        <p className="text-gray-600">{step.action}</p>
                      </div>
                    </div>
                  )) || null}
                </div>
              </div>
            </>
          )}

          {/* Certificate Section (if passed) */}
          {score?.passed && fullReport?.traineeReport?.certificate && (
            <div className="p-8 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-800 mb-2">
                  {language === 'en' ? 'Congratulations!' : 'تهانينا!'}
                </h2>
                <p className="text-amber-700 mb-4">
                  {language === 'en' 
                    ? 'You have successfully completed the training assessment.'
                    : 'لقد أكملت بنجاح تقييم التدريب.'}
                </p>
                <div className="bg-white rounded-lg p-4 inline-block shadow-md">
                  <p className="text-sm text-gray-500">{language === 'en' ? 'Certificate ID' : 'رقم الشهادة'}</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{fullReport.traineeReport.certificate.certificateId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50 text-center text-sm text-gray-500">
            <p>
              {language === 'en' 
                ? 'This report was generated by Kafaat Smart Evaluation Platform'
                : 'تم إنشاء هذا التقرير بواسطة منصة كفاءات للتقييم الذكي'}
            </p>
            <p className="mt-1">
              {language === 'en' ? 'Report generated on' : 'تم إنشاء التقرير في'}: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Post-Test Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-kafaat-navy text-white rounded-lg font-medium hover:bg-blue-800"
          >
            {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomThankYouPage;
