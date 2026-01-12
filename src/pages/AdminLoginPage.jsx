import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import * as auth from '../utils/auth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { language, isRTL, toggleLanguage } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      await auth.initializeAuth();
      
      // If already logged in as admin, redirect to admin dashboard
      if (auth.isLoggedIn() && auth.isAdmin()) {
        navigate('/admin');
      }
    };
    init();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin login with isAdminLogin = true - MUST await async function
      const result = await auth.login(email, password, true);
      
      if (result.success) {
        navigate('/admin');
      } else {
        let errorMessage = result.error || 'Login failed';
        if (language === 'ar') {
          if (result.error === 'Invalid email or password') {
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else if (result.error === 'Account is deactivated') {
            errorMessage = 'الحساب معطل';
          } else if (result.error === 'Admin credentials required') {
            errorMessage = 'مطلوب بيانات اعتماد المسؤول';
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
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
            <div className="w-24 h-24 bg-gradient-to-br from-kafaat-gold to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform rotate-3">
              <span className="text-purple-900 font-bold text-4xl">👑</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'en' ? 'Admin Portal' : 'بوابة المسؤول'}
            </h1>
            <p className="text-purple-200">
              {language === 'en' 
                ? 'Kafaat Smart Evaluation Platform'
                : 'منصة كفاءات للتقييم الذكي'
              }
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🔐</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Administrator Login' : 'دخول المسؤول'}
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
                  {language === 'en' ? 'Admin Email' : 'بريد المسؤول'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    👑
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={language === 'en' ? 'admin@example.com' : 'admin@example.com'}
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
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={language === 'en' ? 'Enter password' : 'أدخل كلمة المرور'}
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
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading 
                  ? (language === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...')
                  : (language === 'en' ? 'Admin Sign In' : 'دخول المسؤول')
                }
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-800 flex items-start gap-2">
                  <span className="text-lg">🛡️</span>
                  <span>
                    {language === 'en' 
                      ? 'This is a secure admin portal. Only authorized administrators can access this area.'
                      : 'هذه بوابة مسؤول آمنة. فقط المسؤولون المخولون يمكنهم الوصول لهذه المنطقة.'
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-purple-200 text-sm">
            <p>© 2024 Kafaat Smart Evaluation Platform</p>
            <p className="mt-1">
              {language === 'en' 
                ? 'Powered by THOT Knowledge'
                : 'مدعوم من ثوت للمعرفة'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
