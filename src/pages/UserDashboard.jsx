import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [customCourses, setCustomCourses] = useState([]);

  // Function to load fresh user data
  const loadUserData = async () => {
    const currentUser = await auth.getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      setUser(currentUser);
      const tokens = await auth.getRemainingTokens();
      setRemainingTokens(tokens);
    }
    
    // Load custom courses
    try {
      const storedCourses = localStorage.getItem('kafaat-custom-courses');
      if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        setCustomCourses(courses.filter(c => c.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading custom courses:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check authentication
      if (!auth.isLoggedIn()) {
        navigate('/login');
        return;
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        await auth.logout();
        navigate('/login');
        return;
      }

      // Redirect admin to admin dashboard via admin-login
      if (currentUser.role === 'admin') {
        await auth.logout();
        navigate('/admin-login');
        return;
      }

      setUser(currentUser);
      const tokens = await auth.getRemainingTokens();
      setRemainingTokens(tokens);
    };
    
    init();
    
    // Auto-refresh user data every 5 seconds to get admin updates
    const refreshInterval = setInterval(() => {
      loadUserData();
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kafaat-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  const assessmentTypes = [
    {
      id: 'kafaat',
      icon: '🤖',
      name: { en: 'Kafaat AI Assessment', ar: 'تقييم كفاءات الذكي' },
      description: { 
        en: 'AI-powered leadership assessment based on Kafaat curriculum',
        ar: 'تقييم قيادي مدعوم بالذكاء الاصطناعي مبني على منهج كفاءات'
      },
      duration: { en: '15-20 minutes', ar: '15-20 دقيقة' },
      questions: 16,
      color: 'blue'
    },
    {
      id: '360',
      icon: '🔄',
      name: { en: '360° Leadership Assessment', ar: 'تقييم القيادة 360°' },
      description: { 
        en: 'Comprehensive multi-rater leadership evaluation',
        ar: 'تقييم قيادي شامل متعدد المقيّمين'
      },
      duration: { en: '20-30 minutes', ar: '20-30 دقيقة' },
      questions: 75,
      color: 'yellow'
    }
  ];

  const assignedAssessments = assessmentTypes.filter(a => 
    user.assignedAssessments?.includes(a.id)
  );

  const completedAssessments = user.completedAssessments || [];
  const totalTokens = user.tokens || 0;
  const hasTokens = remainingTokens > 0;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-kafaat-navy to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'en' 
                    ? `Welcome, ${user.name}!`
                    : `مرحباً، ${user.nameAr || user.name}!`
                  }
                </h1>
                <p className="text-blue-200">
                  {user.position && `${user.position}`}
                  {user.position && user.department && ' • '}
                  {user.department && user.department}
                </p>
              </div>
            </div>
            
            {/* Token Display */}
            <div className="text-center">
              <div className={`px-6 py-3 rounded-xl ${hasTokens ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <span className="text-3xl block mb-1">🎫</span>
                <p className="text-2xl font-bold">{remainingTokens} / {totalTokens}</p>
                <p className="text-xs text-blue-200">
                  {language === 'en' ? 'Tokens Available' : 'الرموز المتاحة'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Assigned Assessments' : 'التقييمات المعينة'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.assignedAssessments?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Completed' : 'المكتملة'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedAssessments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Pending' : 'في الانتظار'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(user.assignedAssessments?.length || 0) - completedAssessments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Warning */}
        {!hasTokens && assignedAssessments.length > completedAssessments.length && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-red-800">
                  {language === 'en' ? 'No Tokens Available' : 'لا توجد رموز متاحة'}
                </h3>
                <p className="text-red-700 text-sm">
                  {language === 'en' 
                    ? 'You have used all your assessment tokens. Please contact your administrator for more tokens.'
                    : 'لقد استخدمت جميع رموز التقييم الخاصة بك. يرجى التواصل مع المسؤول للحصول على المزيد من الرموز.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Assessments */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {language === 'en' ? 'Your Assessments' : 'تقييماتك'}
        </h2>

        {assignedAssessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'No Assessments Assigned' : 'لا توجد تقييمات معينة'}
            </h3>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'Your administrator will assign assessments to you. Please check back later.'
                : 'سيقوم المسؤول بتعيين التقييمات لك. يرجى المراجعة لاحقاً.'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assignedAssessments.map((assessment) => {
              const isCompleted = completedAssessments.includes(assessment.id);
              const canStart = hasTokens && !isCompleted;
              
              return (
                <div 
                  key={assessment.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden ${
                    isCompleted ? 'opacity-75' : ''
                  }`}
                >
                  <div className={`h-2 ${
                    assessment.color === 'blue' 
                      ? 'bg-gradient-to-r from-kafaat-navy to-blue-500'
                      : 'bg-gradient-to-r from-kafaat-gold to-yellow-400'
                  }`}></div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          assessment.color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          <span className="text-2xl">{assessment.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {assessment.name[language]}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {assessment.questions} {language === 'en' ? 'questions' : 'سؤال'} • {assessment.duration[language]}
                          </p>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <span>✓</span>
                          {language === 'en' ? 'Completed' : 'مكتمل'}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-6">
                      {assessment.description[language]}
                    </p>

                    {isCompleted ? (
                      <div className="text-center py-3 bg-gray-50 rounded-lg text-gray-500">
                        {language === 'en' 
                          ? 'You have already completed this assessment. Your results have been submitted.'
                          : 'لقد أكملت هذا التقييم بالفعل. تم إرسال نتائجك.'
                        }
                      </div>
                    ) : !hasTokens ? (
                      <div className="text-center py-3 bg-red-50 rounded-lg text-red-600">
                        {language === 'en' 
                          ? 'No tokens available. Contact your administrator.'
                          : 'لا توجد رموز متاحة. تواصل مع المسؤول.'
                        }
                      </div>
                    ) : (
                      <Link
                        to={`/assessment/${assessment.id}`}
                        className={`block w-full text-center py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                          assessment.color === 'blue'
                            ? 'bg-kafaat-navy text-white hover:bg-blue-800'
                            : 'bg-kafaat-gold text-kafaat-navy hover:bg-yellow-400'
                        }`}
                      >
                        {language === 'en' ? 'Start Assessment' : 'بدء التقييم'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Training Assessments */}
        {customCourses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎓</span>
              {language === 'en' ? 'Training Course Assessments' : 'تقييمات الدورات التدريبية'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {customCourses.map((course) => {
                // Check if user has completed pre-test and post-test
                const preTestCompleted = user?.reports?.some(r => 
                  r.assessmentType === 'custom' && 
                  r.data?.courseId === course.id && 
                  r.data?.testType === 'pre'
                );
                const postTestCompleted = user?.reports?.some(r => 
                  r.assessmentType === 'custom' && 
                  r.data?.courseId === course.id && 
                  r.data?.testType === 'post'
                );

                return (
                  <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-500"></div>
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🎓</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {course.title?.[language] || course.title?.en}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {course.duration} • {course.modules?.length || 0} {language === 'en' ? 'modules' : 'وحدات'}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        {course.description?.[language] || course.description?.en || (language === 'en' ? 'Training course assessment' : 'تقييم دورة تدريبية')}
                      </p>

                      {/* Test Progress */}
                      <div className="space-y-3">
                        {/* Pre-Test */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              preTestCompleted ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {preTestCompleted ? '✓' : '1'}
                            </span>
                            <span className="text-sm font-medium">
                              {language === 'en' ? 'Pre-Test' : 'الاختبار القبلي'}
                            </span>
                          </div>
                          {preTestCompleted ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {language === 'en' ? 'Completed' : 'مكتمل'}
                            </span>
                          ) : (
                            <Link
                              to={`/custom-assessment/${course.id}/pre`}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              {language === 'en' ? 'Start' : 'ابدأ'}
                            </Link>
                          )}
                        </div>

                        {/* Training Indicator */}
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-8 border-t border-dashed border-gray-300"></div>
                            <span className="text-xs">📚 {language === 'en' ? 'Complete Training' : 'أكمل التدريب'}</span>
                            <div className="w-8 border-t border-dashed border-gray-300"></div>
                          </div>
                        </div>

                        {/* Post-Test */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              postTestCompleted ? 'bg-green-500 text-white' : 
                              preTestCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {postTestCompleted ? '✓' : '2'}
                            </span>
                            <span className="text-sm font-medium">
                              {language === 'en' ? 'Post-Test' : 'الاختبار البعدي'}
                            </span>
                          </div>
                          {postTestCompleted ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {language === 'en' ? 'Completed' : 'مكتمل'}
                            </span>
                          ) : preTestCompleted ? (
                            <Link
                              to={`/custom-assessment/${course.id}/post`}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              {language === 'en' ? 'Start' : 'ابدأ'}
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {language === 'en' ? 'Complete pre-test first' : 'أكمل الاختبار القبلي أولاً'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Report Link (if post-test completed) */}
                      {postTestCompleted && (
                        <Link
                          to={`/custom-thank-you/${course.id}/post`}
                          className="mt-4 block w-full text-center py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm"
                        >
                          {language === 'en' ? 'View Report' : 'عرض التقرير'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                {language === 'en' ? 'Important Information' : 'معلومات مهمة'}
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• {language === 'en' 
                  ? 'Each assessment completion uses 1 token from your account.'
                  : 'كل إكمال تقييم يستخدم رمزاً واحداً من حسابك.'
                }</li>
                <li>• {language === 'en' 
                  ? 'Your results will be stored securely and reviewed by your administrator.'
                  : 'سيتم تخزين نتائجك بشكل آمن ومراجعتها من قبل المسؤول.'
                }</li>
                <li>• {language === 'en' 
                  ? 'Take your time to answer each question thoughtfully.'
                  : 'خذ وقتك للإجابة على كل سؤال بعناية.'
                }</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
