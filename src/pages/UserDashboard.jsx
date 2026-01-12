import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);

  // Function to load fresh user data
  const loadUserData = () => {
    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      setUser(currentUser);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!auth.isLoggedIn()) {
      navigate('/login');
      return;
    }

    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      auth.logout();
      navigate('/login');
      return;
    }

    // Redirect admin to admin dashboard via admin-login
    if (currentUser.role === 'admin') {
      auth.logout();
      navigate('/admin-login');
      return;
    }

    setUser(currentUser);
    
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
        en: 'AI-powered leadership assessment based on Qatar Skills curriculum',
        ar: 'تقييم قيادي مدعوم بالذكاء الاصطناعي مبني على منهج قطر سكيلز'
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
  const remainingTokens = auth.getRemainingTokens();
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
