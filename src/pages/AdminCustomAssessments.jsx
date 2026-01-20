import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import { processUploadedCourse } from '../utils/courseAIAnalyzer';
import { bloomsLevels, questionTypes } from '../data/customAssessmentEngine';

const AdminCustomAssessments = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Upload and AI processing states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingStage, setProcessingStage] = useState('idle'); // idle, uploading, parsing, analyzing, generating, complete, error
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  useEffect(() => {
    if (!auth.isLoggedIn() || !auth.isAdmin()) {
      navigate('/admin-login');
      return;
    }
    loadCourses();
  }, [navigate]);

  const loadCourses = async () => {
    try {
      const storedCourses = localStorage.getItem('kafaat-custom-courses');
      if (storedCourses) {
        setCourses(JSON.parse(storedCourses));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
    setLoading(false);
  };

  const saveCourses = (updatedCourses) => {
    localStorage.setItem('kafaat-custom-courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
  };

  // File upload handler
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    const validExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
    
    const isValidType = validTypes.includes(file.type) || 
                        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      alert(language === 'en' 
        ? 'Please upload a PDF, DOCX, PPTX, or TXT file.' 
        : 'يرجى رفع ملف PDF أو DOCX أو PPTX أو TXT.');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert(language === 'en' 
        ? 'File size must be less than 20MB.' 
        : 'يجب أن يكون حجم الملف أقل من 20 ميجابايت.');
      return;
    }

    setUploadedFile(file);
    setProcessingStage('idle');
    setProcessingError(null);
    setAnalysisResult(null);
  };

  // Process uploaded file with AI
  const processFile = async () => {
    if (!uploadedFile) return;

    setProcessingStage('uploading');
    setProcessingProgress(10);
    setProcessingError(null);

    try {
      // Simulate upload progress
      setProcessingStage('parsing');
      setProcessingProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('analyzing');
      setProcessingProgress(50);
      
      // Process the file with AI
      const result = await processUploadedCourse(uploadedFile, {
        minQuestions: 10,
        maxQuestions: 20,
        language
      });

      setProcessingProgress(80);
      setProcessingStage('generating');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingProgress(100);
      setProcessingStage('complete');
      setAnalysisResult(result);
      setGeneratedQuestions(result.questions);

    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStage('error');
      setProcessingError(error.message || (language === 'en' ? 'Error processing file' : 'خطأ في معالجة الملف'));
    }
  };

  // Save the generated course and assessment
  const handleSaveAssessment = () => {
    if (!analysisResult) return;

    const courseWithAssessment = {
      ...analysisResult.course,
      status: 'active',
      assessments: [{
        id: `assessment-${Date.now()}`,
        courseId: analysisResult.course.id,
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
        status: 'active'
      }]
    };

    saveCourses([...courses, courseWithAssessment]);
    
    // Reset states
    setShowUploadModal(false);
    setUploadedFile(null);
    setProcessingStage('idle');
    setAnalysisResult(null);
    setGeneratedQuestions(null);
    
    alert(language === 'en' 
      ? 'Course and assessment saved successfully!' 
      : 'تم حفظ الدورة والتقييم بنجاح!');
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm(language === 'en' 
      ? 'Are you sure you want to delete this course?' 
      : 'هل أنت متأكد من حذف هذه الدورة؟')) {
      saveCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadedFile(null);
    setProcessingStage('idle');
    setProcessingProgress(0);
    setAnalysisResult(null);
    setProcessingError(null);
    setGeneratedQuestions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    if (fileName?.endsWith('.pdf')) return '📕';
    if (fileName?.endsWith('.docx')) return '📘';
    if (fileName?.endsWith('.pptx')) return '📙';
    if (fileName?.endsWith('.txt')) return '📄';
    return '📁';
  };

  // Processing stage messages
  const getProcessingMessage = () => {
    const messages = {
      idle: { en: 'Ready to process', ar: 'جاهز للمعالجة' },
      uploading: { en: 'Uploading file...', ar: 'جاري رفع الملف...' },
      parsing: { en: 'Parsing document content...', ar: 'جاري تحليل محتوى المستند...' },
      analyzing: { en: 'AI is analyzing course content...', ar: 'الذكاء الاصطناعي يحلل محتوى الدورة...' },
      generating: { en: 'Generating assessment questions...', ar: 'جاري إنشاء أسئلة التقييم...' },
      complete: { en: 'Processing complete!', ar: 'اكتملت المعالجة!' },
      error: { en: 'Error occurred', ar: 'حدث خطأ' }
    };
    return messages[processingStage]?.[language] || '';
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} isAdmin={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="text-kafaat-navy hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              <span>{isRTL ? '→' : '←'}</span>
              {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">🎓</span>
              {language === 'en' ? 'Custom Assessment Manager' : 'مدير التقييمات المخصصة'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'en' 
                ? 'Upload training course files and let AI generate assessments automatically' 
                : 'ارفع ملفات الدورات التدريبية ودع الذكاء الاصطناعي يُنشئ التقييمات تلقائياً'}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg"
          >
            <span>🤖</span>
            {language === 'en' ? 'Upload & Generate with AI' : 'رفع وإنشاء بالذكاء الاصطناعي'}
          </button>
        </div>

        {/* AI Feature Highlight */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">
                {language === 'en' ? 'AI-Powered Assessment Generation' : 'إنشاء التقييمات بالذكاء الاصطناعي'}
              </h3>
              <p className="text-purple-700 text-sm mb-3">
                {language === 'en'
                  ? 'Upload your training course file (PDF, DOCX, PPTX, or TXT) and our AI will automatically analyze the content, extract key concepts, and generate 10-20 intelligent pre and post-test questions.'
                  : 'ارفع ملف الدورة التدريبية (PDF أو DOCX أو PPTX أو TXT) وسيقوم الذكاء الاصطناعي تلقائياً بتحليل المحتوى واستخراج المفاهيم الرئيسية وإنشاء 10-20 سؤال ذكي للاختبار القبلي والبعدي.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOCX', 'PPTX', 'TXT'].map(format => (
                  <span key={format} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Total Courses' : 'إجمالي الدورات'}</p>
            <p className="text-3xl font-bold text-purple-600">{courses.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Active Assessments' : 'التقييمات النشطة'}</p>
            <p className="text-3xl font-bold text-green-600">
              {courses.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Total Questions' : 'إجمالي الأسئلة'}</p>
            <p className="text-3xl font-bold text-blue-600">
              {courses.reduce((sum, c) => sum + (c.assessments?.reduce((a, ass) => a + (ass.questions?.all?.length || 0), 0) || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'AI Generated' : 'مُنشأ بالذكاء الاصطناعي'}</p>
            <p className="text-3xl font-bold text-amber-600">
              {courses.filter(c => c.sourceFile).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'courses', en: 'Training Courses', ar: 'الدورات التدريبية', icon: '📚' },
                { id: 'assessments', en: 'Generated Assessments', ar: 'التقييمات المُنشأة', icon: '📝' },
                { id: 'reports', en: 'Assessment Reports', ar: 'تقارير التقييم', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {language === 'en' ? tab.en : tab.ar}
                </button>
              ))}
            </nav>
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="p-6">
              {courses.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-6xl block mb-4">📚</span>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {language === 'en' ? 'No Training Courses Yet' : 'لا توجد دورات تدريبية بعد'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {language === 'en' 
                      ? 'Upload your first training course file to generate AI-powered assessments' 
                      : 'ارفع أول ملف دورة تدريبية لإنشاء تقييمات مدعومة بالذكاء الاصطناعي'}
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 inline-flex items-center gap-2"
                  >
                    <span>🤖</span>
                    {language === 'en' ? 'Upload Course File' : 'رفع ملف الدورة'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {course.status === 'active' 
                              ? (language === 'en' ? 'Active' : 'نشط')
                              : (language === 'en' ? 'Draft' : 'مسودة')}
                          </span>
                          {course.sourceFile && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              🤖 AI
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {course.title?.[language] || course.title?.en}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description?.[language] || course.description?.en || 
                          (language === 'en' ? 'No description' : 'لا يوجد وصف')}
                      </p>

                      {/* Source file info */}
                      {course.sourceFile && (
                        <div className="bg-white rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
                          <span>{getFileIcon(course.sourceFile.name)}</span>
                          <span className="text-gray-600 truncate flex-1">{course.sourceFile.name}</span>
                        </div>
                      )}

                      {/* Analysis info */}
                      {course.analysis && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                            {course.analysis.wordCount} {language === 'en' ? 'words' : 'كلمة'}
                          </span>
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                            {course.analysis.difficulty === 'beginner' ? (language === 'en' ? 'Beginner' : 'مبتدئ') :
                             course.analysis.difficulty === 'intermediate' ? (language === 'en' ? 'Intermediate' : 'متوسط') :
                             (language === 'en' ? 'Advanced' : 'متقدم')}
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                            {course.analysis.conceptsExtracted} {language === 'en' ? 'concepts' : 'مفهوم'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          📦 {course.modules?.length || 0} {language === 'en' ? 'modules' : 'وحدات'}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {course.duration}
                        </span>
                      </div>

                      {/* Questions count */}
                      {course.assessments?.[0]?.questions && (
                        <div className="bg-purple-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-700">
                              {language === 'en' ? 'Pre-test:' : 'قبلي:'} {course.assessments[0].questions.preTest?.length || 0}
                            </span>
                            <span className="text-purple-700">
                              {language === 'en' ? 'Post-test:' : 'بعدي:'} {course.assessments[0].questions.postTest?.length || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setGeneratedQuestions(course.assessments?.[0]?.questions);
                          setShowPreviewModal(true);
                        }}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <span>👁️</span>
                        {language === 'en' ? 'View Assessment' : 'عرض التقييم'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <div className="p-6">
              {courses.filter(c => c.assessments?.length > 0).length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-6xl block mb-4">📝</span>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {language === 'en' ? 'No Assessments Generated' : 'لم يتم إنشاء تقييمات'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'en' 
                      ? 'Upload a training course to generate assessments' 
                      : 'ارفع دورة تدريبية لإنشاء تقييمات'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.filter(c => c.assessments?.length > 0).map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {course.title?.[language] || course.title?.en}
                          </h3>
                          {course.sourceFile && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              {getFileIcon(course.sourceFile.name)} {course.sourceFile.name}
                            </p>
                          )}
                        </div>
                        {course.analysis && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            🤖 {language === 'en' ? 'AI Generated' : 'مُنشأ بالذكاء الاصطناعي'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {course.assessments.map(assessment => (
                          <div key={assessment.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {language === 'en' ? 'Assessment' : 'تقييم'} #{assessment.id.split('-')[1]}
                              </p>
                              <p className="text-sm text-gray-500">
                                {language === 'en' ? 'Pre-test:' : 'اختبار قبلي:'} {assessment.questions?.preTest?.length || 0} | 
                                {language === 'en' ? ' Post-test:' : ' اختبار بعدي:'} {assessment.questions?.postTest?.length || 0} |
                                {language === 'en' ? ' Total:' : ' إجمالي:'} {assessment.questions?.all?.length || 0}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {language === 'en' ? 'Created:' : 'تم الإنشاء:'} {new Date(assessment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedCourse(course);
                                setGeneratedQuestions(assessment.questions);
                                setShowPreviewModal(true);
                              }}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              {language === 'en' ? 'Preview' : 'معاينة'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="text-center py-16">
                <span className="text-6xl block mb-4">📊</span>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {language === 'en' ? 'No Reports Yet' : 'لا توجد تقارير بعد'}
                </h3>
                <p className="text-gray-500">
                  {language === 'en' 
                    ? 'Reports will appear here after trainees complete assessments' 
                    : 'ستظهر التقارير هنا بعد إكمال المتدربين للتقييمات'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {language === 'en' ? 'AI Course Analyzer' : 'محلل الدورات بالذكاء الاصطناعي'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {language === 'en' ? 'Upload your training course file' : 'ارفع ملف الدورة التدريبية'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetUploadModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* File Upload Area */}
              {processingStage === 'idle' && !uploadedFile && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="text-5xl block mb-4">📁</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'en' ? 'Drop your file here or click to browse' : 'أسقط ملفك هنا أو انقر للتصفح'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {language === 'en' 
                      ? 'Supported formats: PDF, DOCX, PPTX, TXT (max 20MB)' 
                      : 'الصيغ المدعومة: PDF, DOCX, PPTX, TXT (حد أقصى 20 ميجابايت)'}
                  </p>
                  <div className="flex justify-center gap-2">
                    {['📕 PDF', '📘 DOCX', '📙 PPTX', '📄 TXT'].map(format => (
                      <span key={format} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Selected - Ready to Process */}
              {uploadedFile && processingStage === 'idle' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-6 flex items-center gap-4">
                    <span className="text-4xl">{getFileIcon(uploadedFile.name)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{uploadedFile.name}</h4>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <span>🧠</span>
                      {language === 'en' ? 'AI will automatically:' : 'الذكاء الاصطناعي سيقوم تلقائياً بـ:'}
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {language === 'en' ? 'Extract course title, description, and objectives' : 'استخراج عنوان الدورة والوصف والأهداف'}</li>
                      <li>• {language === 'en' ? 'Identify key concepts and learning points' : 'تحديد المفاهيم الرئيسية ونقاط التعلم'}</li>
                      <li>• {language === 'en' ? 'Generate 10-20 questions based on content complexity' : 'إنشاء 10-20 سؤال بناءً على تعقيد المحتوى'}</li>
                      <li>• {language === 'en' ? 'Create pre-test and post-test question sets' : 'إنشاء مجموعات أسئلة الاختبار القبلي والبعدي'}</li>
                    </ul>
                  </div>

                  <button
                    onClick={processFile}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 text-lg"
                  >
                    <span>🚀</span>
                    {language === 'en' ? 'Analyze & Generate Assessment' : 'تحليل وإنشاء التقييم'}
                  </button>
                </div>
              )}

              {/* Processing Progress */}
              {['uploading', 'parsing', 'analyzing', 'generating'].includes(processingStage) && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{getProcessingMessage()}</h3>
                    <p className="text-gray-500 text-sm">
                      {language === 'en' ? 'Please wait while AI processes your file...' : 'يرجى الانتظار بينما يعالج الذكاء الاصطناعي ملفك...'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>

                  {/* Progress Steps */}
                  <div className="flex justify-between text-sm">
                    {[
                      { stage: 'uploading', en: 'Upload', ar: 'رفع' },
                      { stage: 'parsing', en: 'Parse', ar: 'تحليل' },
                      { stage: 'analyzing', en: 'Analyze', ar: 'فحص' },
                      { stage: 'generating', en: 'Generate', ar: 'إنشاء' }
                    ].map((step, idx) => (
                      <div key={step.stage} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          processingProgress >= (idx + 1) * 25
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {processingProgress >= (idx + 1) * 25 ? '✓' : idx + 1}
                        </div>
                        <span className="text-gray-600">{step[language]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error State */}
              {processingStage === 'error' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h3 className="text-xl font-medium text-red-800 mb-2">
                    {language === 'en' ? 'Processing Error' : 'خطأ في المعالجة'}
                  </h3>
                  <p className="text-red-600 mb-6">{processingError}</p>
                  <button
                    onClick={() => {
                      setProcessingStage('idle');
                      setProcessingError(null);
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {language === 'en' ? 'Try Again' : 'حاول مرة أخرى'}
                  </button>
                </div>
              )}

              {/* Success - Analysis Results */}
              {processingStage === 'complete' && analysisResult && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✓</span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {language === 'en' ? 'Analysis Complete!' : 'اكتمل التحليل!'}
                    </h3>
                  </div>

                  {/* Extracted Course Info */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <span>📚</span>
                      {language === 'en' ? 'Extracted Course Information' : 'معلومات الدورة المستخرجة'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{language === 'en' ? 'Title' : 'العنوان'}</p>
                        <p className="font-medium">{analysisResult.course.title?.en || analysisResult.course.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'en' ? 'Duration' : 'المدة'}</p>
                        <p className="font-medium">{analysisResult.course.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'en' ? 'Difficulty' : 'المستوى'}</p>
                        <p className="font-medium capitalize">{analysisResult.analysis.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'en' ? 'Content Type' : 'نوع المحتوى'}</p>
                        <p className="font-medium capitalize">{analysisResult.analysis.contentType}</p>
                      </div>
                    </div>

                    {/* Key Topics */}
                    {analysisResult.analysis.keyTopics?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Key Topics Identified' : 'المواضيع الرئيسية المحددة'}</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.keyTopics.slice(0, 6).map((topic, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {topic.substring(0, 30)}{topic.length > 30 ? '...' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generated Questions Summary */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                      <span>📝</span>
                      {language === 'en' ? 'Generated Assessment' : 'التقييم المُنشأ'}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-2xl font-bold text-blue-600">{generatedQuestions?.preTest?.length || 0}</p>
                        <p className="text-sm text-gray-600">{language === 'en' ? 'Pre-Test' : 'اختبار قبلي'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-2xl font-bold text-green-600">{generatedQuestions?.postTest?.length || 0}</p>
                        <p className="text-sm text-gray-600">{language === 'en' ? 'Post-Test' : 'اختبار بعدي'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-2xl font-bold text-purple-600">{generatedQuestions?.all?.length || 0}</p>
                        <p className="text-sm text-gray-600">{language === 'en' ? 'Total' : 'إجمالي'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedCourse(analysisResult.course);
                        setShowPreviewModal(true);
                      }}
                      className="flex-1 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50"
                    >
                      {language === 'en' ? 'Preview Questions' : 'معاينة الأسئلة'}
                    </button>
                    <button
                      onClick={handleSaveAssessment}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      {language === 'en' ? 'Save & Activate' : 'حفظ وتفعيل'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && generatedQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Assessment Preview' : 'معاينة التقييم'}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCourse?.title?.[language] || selectedCourse?.title?.en}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{generatedQuestions.preTest?.length || 0}</p>
                  <p className="text-sm text-blue-700">{language === 'en' ? 'Pre-Test' : 'اختبار قبلي'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{generatedQuestions.postTest?.length || 0}</p>
                  <p className="text-sm text-green-700">{language === 'en' ? 'Post-Test' : 'اختبار بعدي'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{generatedQuestions.all?.length || 0}</p>
                  <p className="text-sm text-purple-700">{language === 'en' ? 'Total' : 'إجمالي'}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {new Set(generatedQuestions.all?.map(q => q.type) || []).size}
                  </p>
                  <p className="text-sm text-amber-700">{language === 'en' ? 'Question Types' : 'أنواع الأسئلة'}</p>
                </div>
              </div>

              {/* Pre-Test Questions */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">📋</span>
                  {language === 'en' ? 'Pre-Test Questions' : 'أسئلة الاختبار القبلي'}
                </h3>
                <div className="space-y-4">
                  {generatedQuestions.preTest?.slice(0, 5).map((q, idx) => (
                    <div key={q.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {questionTypes[q.type]?.[language] || q.type}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {bloomsLevels[q.bloomLevel]?.[language] || q.bloomLevel}
                            </span>
                            <span className="text-xs text-gray-500">
                              {q.points} {language === 'en' ? 'pts' : 'نقاط'}
                            </span>
                          </div>
                          <p className="text-gray-900">{q.question?.[language] || q.question?.en}</p>
                          {q.options && (
                            <div className="mt-3 space-y-2">
                              {q.options.slice(0, 4).map(opt => (
                                <div key={opt.id} className={`flex items-center gap-2 text-sm p-2 rounded ${
                                  opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-white'
                                }`}>
                                  <span className="font-medium">{opt.id.toUpperCase()}.</span>
                                  <span className="truncate">{(opt.text?.[language] || opt.text?.en || '').substring(0, 80)}</span>
                                  {opt.isCorrect && <span className="text-green-600 ml-auto">✓</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(generatedQuestions.preTest?.length || 0) > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{generatedQuestions.preTest.length - 5} {language === 'en' ? 'more questions' : 'أسئلة أخرى'}
                    </p>
                  )}
                </div>
              </div>

              {/* Post-Test Questions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">📝</span>
                  {language === 'en' ? 'Post-Test Questions' : 'أسئلة الاختبار البعدي'}
                </h3>
                <div className="space-y-4">
                  {generatedQuestions.postTest?.slice(0, 3).map((q, idx) => (
                    <div key={q.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {questionTypes[q.type]?.[language] || q.type}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {bloomsLevels[q.bloomLevel]?.[language] || q.bloomLevel}
                            </span>
                          </div>
                          <p className="text-gray-900">{q.question?.[language] || q.question?.en}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(generatedQuestions.postTest?.length || 0) > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{generatedQuestions.postTest.length - 3} {language === 'en' ? 'more questions' : 'أسئلة أخرى'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedCourse(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {language === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomAssessments;
