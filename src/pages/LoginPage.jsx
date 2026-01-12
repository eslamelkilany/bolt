import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import * as auth from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { language, isRTL, toggleLanguage } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Check if already logged in
      if (auth.isLoggedIn()) {
        const session = auth.getCurrentSession();
        if (session?.role === 'admin') {
          await auth.logout();
        } else {
          navigate('/dashboard');
          return;
        }
      }
      setInitializing(false);
    };
    
    init();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.login(email.trim().toLowerCase(), password, false);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        let errorMessage = result.error;
        if (language === 'ar') {
          if (result.error === 'Invalid email or password') {
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else if (result.error === 'Account is deactivated') {
            errorMessage = 'الحساب معطل';
          } else if (result.error === 'Please use Admin Login page') {
            errorMessage = 'يرجى استخدام صفحة دخول المسؤول';
          }
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(language === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kafaat-navy via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-kafaat-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-kafaat-navy via-blue-800 to-blue-900 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-kafaat-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-kafaat-navy font-bold text-4xl">K</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'en' ? 'Kafaat Smart Evaluation' : 'منصة كفاءات للتقييم الذكي'}
            </h1>
            <p className="text-blue-200">
              {language === 'en' 
                ? 'Leadership Assessment Platform'
                : 'منصة تقييم القيادة'
              }
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">👤</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Candidate Login' : 'دخول المرشح'}
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center flex items-center justify-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    📧
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-kafaat-navy focus:border-transparent"
                    placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Password' : 'كلمة المرور'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-kafaat-navy focus:border-transparent"
                    placeholder={language === 'en' ? 'Enter your password' : 'أدخل كلمة المرور'}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-kafaat-navy text-white hover:bg-blue-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading 
                  ? (language === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...')
                  : (language === 'en' ? 'Sign In' : 'تسجيل الدخول')
                }
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">
                {language === 'en' 
                  ? 'Contact your administrator for account access'
                  : 'تواصل مع المسؤول للحصول على حساب'
                }
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                <span>☁️</span>
                {language === 'en' ? 'Cloud-connected database' : 'قاعدة بيانات سحابية'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-blue-200 text-sm">
            <p>© 2024 Kafaat Smart Evaluation Platform</p>
            <p className="mt-1">
              {language === 'en' 
                ? 'Powered by Qatar Skills Training Curriculum'
                : 'مدعوم من منهج قطر سكيلز التدريبي'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
