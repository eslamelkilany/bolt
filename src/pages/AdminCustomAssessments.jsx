import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';
import { 
  parseCoursePlan, 
  generateQuestionsFromCourse, 
  bloomsLevels, 
  questionTypes 
} from '../data/customAssessmentEngine';

const AdminCustomAssessments = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form state for new course
  const [courseForm, setCourseForm] = useState({
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    duration: '1 day',
    targetAudience: { en: '', ar: '' },
    modules: []
  });

  const [moduleForm, setModuleForm] = useState({
    title: { en: '', ar: '' },
    duration: '1 hour',
    objectives: [],
    topics: []
  });

  const [objectiveInput, setObjectiveInput] = useState({ en: '', ar: '' });
  const [topicInput, setTopicInput] = useState({ en: '', ar: '' });

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

  const handleCreateCourse = () => {
    if (!courseForm.title.en || !courseForm.title.ar) {
      alert(language === 'en' ? 'Please enter course title in both languages' : 'يرجى إدخال عنوان الدورة بكلا اللغتين');
      return;
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      ...courseForm,
      createdAt: new Date().toISOString(),
      status: 'draft',
      assessments: []
    };

    saveCourses([...courses, newCourse]);
    setCourseForm({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      duration: '1 day',
      targetAudience: { en: '', ar: '' },
      modules: []
    });
    setShowCreateModal(false);
  };

  const handleAddModule = () => {
    if (!moduleForm.title.en || !moduleForm.title.ar) {
      alert(language === 'en' ? 'Please enter module title in both languages' : 'يرجى إدخال عنوان الوحدة بكلا اللغتين');
      return;
    }

    setCourseForm({
      ...courseForm,
      modules: [...courseForm.modules, { ...moduleForm, id: `module-${Date.now()}` }]
    });
    setModuleForm({
      title: { en: '', ar: '' },
      duration: '1 hour',
      objectives: [],
      topics: []
    });
  };

  const handleAddObjective = () => {
    if (!objectiveInput.en || !objectiveInput.ar) return;
    setModuleForm({
      ...moduleForm,
      objectives: [...moduleForm.objectives, { ...objectiveInput }]
    });
    setObjectiveInput({ en: '', ar: '' });
  };

  const handleAddTopic = () => {
    if (!topicInput.en || !topicInput.ar) return;
    setModuleForm({
      ...moduleForm,
      topics: [...moduleForm.topics, { ...topicInput }]
    });
    setTopicInput({ en: '', ar: '' });
  };

  const handleGenerateAssessment = async (course) => {
    setGenerating(true);
    setSelectedCourse(course);

    try {
      const parsedCourse = parseCoursePlan(course);
      const questions = generateQuestionsFromCourse(parsedCourse, {
        totalQuestions: 20,
        preTestRatio: 0.5
      });

      setGeneratedQuestions(questions);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error generating assessment:', error);
      alert(language === 'en' ? 'Error generating assessment' : 'خطأ في إنشاء التقييم');
    }

    setGenerating(false);
  };

  const handleSaveAssessment = () => {
    if (!selectedCourse || !generatedQuestions) return;

    const assessment = {
      id: `assessment-${Date.now()}`,
      courseId: selectedCourse.id,
      questions: generatedQuestions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourse.id) {
        return {
          ...c,
          status: 'active',
          assessments: [...(c.assessments || []), assessment]
        };
      }
      return c;
    });

    saveCourses(updatedCourses);
    setShowPreviewModal(false);
    setGeneratedQuestions(null);
    setSelectedCourse(null);
    alert(language === 'en' ? 'Assessment saved successfully!' : 'تم حفظ التقييم بنجاح!');
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this course?' : 'هل أنت متأكد من حذف هذه الدورة؟')) {
      saveCourses(courses.filter(c => c.id !== courseId));
    }
  };

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
                ? 'Create AI-powered assessments from training course plans' 
                : 'إنشاء تقييمات مدعومة بالذكاء الاصطناعي من خطط الدورات التدريبية'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-kafaat-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 flex items-center gap-2 shadow-lg"
          >
            <span>+</span>
            {language === 'en' ? 'Add Training Course' : 'إضافة دورة تدريبية'}
          </button>
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
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Completed Tests' : 'الاختبارات المكتملة'}</p>
            <p className="text-3xl font-bold text-amber-600">0</p>
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
                      ? 'Add your first training course to generate AI-powered assessments' 
                      : 'أضف أول دورة تدريبية لإنشاء تقييمات مدعومة بالذكاء الاصطناعي'}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                  >
                    {language === 'en' ? 'Add Training Course' : 'إضافة دورة تدريبية'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status === 'active' 
                            ? (language === 'en' ? 'Active' : 'نشط')
                            : (language === 'en' ? 'Draft' : 'مسودة')}
                        </span>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {course.title[language] || course.title.en}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description[language] || course.description.en || 
                          (language === 'en' ? 'No description' : 'لا يوجد وصف')}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          📦 {course.modules?.length || 0} {language === 'en' ? 'modules' : 'وحدات'}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {course.duration}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateAssessment(course)}
                          disabled={generating}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {generating ? (
                            <span className="animate-spin">⚙️</span>
                          ) : (
                            <span>🤖</span>
                          )}
                          {language === 'en' ? 'Generate' : 'إنشاء'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setCourseForm(course);
                            setShowCreateModal(true);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          ✏️
                        </button>
                      </div>
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
                      ? 'Generate assessments from your training courses' 
                      : 'أنشئ تقييمات من دوراتك التدريبية'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.filter(c => c.assessments?.length > 0).map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {course.title[language] || course.title.en}
                      </h3>
                      <div className="space-y-3">
                        {course.assessments.map(assessment => (
                          <div key={assessment.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {language === 'en' ? 'Assessment' : 'تقييم'} #{assessment.id.split('-')[1]}
                              </p>
                              <p className="text-sm text-gray-500">
                                {language === 'en' ? 'Pre-test:' : 'اختبار قبلي:'} {assessment.questions?.preTest?.length || 0} {language === 'en' ? 'questions' : 'أسئلة'} | 
                                {language === 'en' ? ' Post-test:' : ' اختبار بعدي:'} {assessment.questions?.postTest?.length || 0} {language === 'en' ? 'questions' : 'أسئلة'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {language === 'en' ? 'Created:' : 'تم الإنشاء:'} {new Date(assessment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
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
                              <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                {language === 'en' ? 'Assign' : 'تعيين'}
                              </button>
                            </div>
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

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCourse 
                  ? (language === 'en' ? 'Edit Training Course' : 'تعديل الدورة التدريبية')
                  : (language === 'en' ? 'Add Training Course' : 'إضافة دورة تدريبية')}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedCourse(null);
                  setCourseForm({
                    title: { en: '', ar: '' },
                    description: { en: '', ar: '' },
                    duration: '1 day',
                    targetAudience: { en: '', ar: '' },
                    modules: []
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Course Title (English)' : 'عنوان الدورة (إنجليزي)'} *
                  </label>
                  <input
                    type="text"
                    value={courseForm.title.en}
                    onChange={(e) => setCourseForm({ ...courseForm, title: { ...courseForm.title, en: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Leadership Excellence Program"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Course Title (Arabic)' : 'عنوان الدورة (عربي)'} *
                  </label>
                  <input
                    type="text"
                    value={courseForm.title.ar}
                    onChange={(e) => setCourseForm({ ...courseForm, title: { ...courseForm.title, ar: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="مثال: برنامج التميز القيادي"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Description (English)' : 'الوصف (إنجليزي)'}
                  </label>
                  <textarea
                    value={courseForm.description.en}
                    onChange={(e) => setCourseForm({ ...courseForm, description: { ...courseForm.description, en: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Course description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Description (Arabic)' : 'الوصف (عربي)'}
                  </label>
                  <textarea
                    value={courseForm.description.ar}
                    onChange={(e) => setCourseForm({ ...courseForm, description: { ...courseForm.description, ar: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="وصف الدورة..."
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Duration' : 'المدة'}
                  </label>
                  <select
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="half day">{language === 'en' ? 'Half Day' : 'نصف يوم'}</option>
                    <option value="1 day">{language === 'en' ? '1 Day' : 'يوم واحد'}</option>
                    <option value="2 days">{language === 'en' ? '2 Days' : 'يومان'}</option>
                    <option value="3 days">{language === 'en' ? '3 Days' : '3 أيام'}</option>
                    <option value="1 week">{language === 'en' ? '1 Week' : 'أسبوع'}</option>
                    <option value="2 weeks">{language === 'en' ? '2 Weeks' : 'أسبوعان'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Target Audience (English)' : 'الفئة المستهدفة (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={courseForm.targetAudience.en}
                    onChange={(e) => setCourseForm({ ...courseForm, targetAudience: { ...courseForm.targetAudience, en: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Mid-level managers"
                  />
                </div>
              </div>

              {/* Modules Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📦</span>
                  {language === 'en' ? 'Course Modules' : 'وحدات الدورة'}
                </h3>

                {/* Added Modules */}
                {courseForm.modules.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {courseForm.modules.map((module, idx) => (
                      <div key={module.id || idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-purple-900">{module.title[language] || module.title.en}</h4>
                            <p className="text-sm text-purple-600">
                              {module.objectives?.length || 0} {language === 'en' ? 'objectives' : 'أهداف'} | 
                              {module.topics?.length || 0} {language === 'en' ? 'topics' : 'مواضيع'}
                            </p>
                          </div>
                          <button
                            onClick={() => setCourseForm({
                              ...courseForm,
                              modules: courseForm.modules.filter((_, i) => i !== idx)
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Module Form */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={moduleForm.title.en}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: { ...moduleForm.title, en: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={language === 'en' ? 'Module Title (English)' : 'عنوان الوحدة (إنجليزي)'}
                    />
                    <input
                      type="text"
                      value={moduleForm.title.ar}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: { ...moduleForm.title, ar: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={language === 'en' ? 'Module Title (Arabic)' : 'عنوان الوحدة (عربي)'}
                      dir="rtl"
                    />
                  </div>

                  {/* Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Learning Objectives' : 'أهداف التعلم'}
                    </label>
                    {moduleForm.objectives.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {moduleForm.objectives.map((obj, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                            <span className="text-green-500">✓</span>
                            <span className="flex-1">{obj[language] || obj.en}</span>
                            <button
                              onClick={() => setModuleForm({
                                ...moduleForm,
                                objectives: moduleForm.objectives.filter((_, i) => i !== idx)
                              })}
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={objectiveInput.en}
                        onChange={(e) => setObjectiveInput({ ...objectiveInput, en: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={language === 'en' ? 'Objective (EN) - e.g., Demonstrate leadership skills' : 'الهدف (EN)'}
                      />
                      <input
                        type="text"
                        value={objectiveInput.ar}
                        onChange={(e) => setObjectiveInput({ ...objectiveInput, ar: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={language === 'en' ? 'Objective (AR)' : 'الهدف (عربي)'}
                        dir="rtl"
                      />
                      <button
                        onClick={handleAddObjective}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Topics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Topics' : 'المواضيع'}
                    </label>
                    {moduleForm.topics.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {moduleForm.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                            <span className="text-blue-500">•</span>
                            <span className="flex-1">{topic[language] || topic.en}</span>
                            <button
                              onClick={() => setModuleForm({
                                ...moduleForm,
                                topics: moduleForm.topics.filter((_, i) => i !== idx)
                              })}
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={topicInput.en}
                        onChange={(e) => setTopicInput({ ...topicInput, en: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={language === 'en' ? 'Topic (EN)' : 'الموضوع (EN)'}
                      />
                      <input
                        type="text"
                        value={topicInput.ar}
                        onChange={(e) => setTopicInput({ ...topicInput, ar: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={language === 'en' ? 'Topic (AR)' : 'الموضوع (عربي)'}
                        dir="rtl"
                      />
                      <button
                        onClick={handleAddTopic}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddModule}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {language === 'en' ? 'Add Module' : 'إضافة وحدة'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedCourse(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {selectedCourse 
                  ? (language === 'en' ? 'Update Course' : 'تحديث الدورة')
                  : (language === 'en' ? 'Create Course' : 'إنشاء الدورة')}
              </button>
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
                  {language === 'en' ? 'Generated Assessment Preview' : 'معاينة التقييم المُنشأ'}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCourse?.title?.[language] || selectedCourse?.title?.en}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setGeneratedQuestions(null);
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
                  <p className="text-sm text-blue-700">{language === 'en' ? 'Pre-Test Questions' : 'أسئلة الاختبار القبلي'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{generatedQuestions.postTest?.length || 0}</p>
                  <p className="text-sm text-green-700">{language === 'en' ? 'Post-Test Questions' : 'أسئلة الاختبار البعدي'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{generatedQuestions.all?.length || 0}</p>
                  <p className="text-sm text-purple-700">{language === 'en' ? 'Total Questions' : 'إجمالي الأسئلة'}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {Object.keys(questionTypes).length}
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
                              {q.points} {language === 'en' ? 'points' : 'نقاط'}
                            </span>
                          </div>
                          <p className="text-gray-900">{q.question?.[language] || q.question?.en}</p>
                          {q.scenario && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              {q.scenario?.[language] || q.scenario?.en}
                            </p>
                          )}
                          {q.options && (
                            <div className="mt-3 space-y-2">
                              {q.options.map(opt => (
                                <div key={opt.id} className={`flex items-center gap-2 text-sm p-2 rounded ${
                                  opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-white'
                                }`}>
                                  <span className="font-medium">{opt.id.toUpperCase()}.</span>
                                  <span>{opt.text?.[language] || opt.text?.en}</span>
                                  {opt.isCorrect && <span className="text-green-600">✓</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {generatedQuestions.preTest?.length > 5 && (
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
                  {generatedQuestions.postTest?.length > 3 && (
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
                  setGeneratedQuestions(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {language === 'en' ? 'Close' : 'إغلاق'}
              </button>
              <button
                onClick={handleSaveAssessment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <span>💾</span>
                {language === 'en' ? 'Save Assessment' : 'حفظ التقييم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomAssessments;
