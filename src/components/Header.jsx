import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import * as auth from '../utils/auth';

const Header = ({ showLogout = false, isAdmin = false }) => {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate(isAdmin ? '/admin-login' : '/login');
  };

  return (
    <header className={`bg-gradient-to-r ${isAdmin ? 'from-purple-900 to-indigo-900' : 'from-kafaat-navy to-blue-800'} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isAdmin ? 'bg-kafaat-gold' : 'bg-kafaat-gold'} rounded-lg flex items-center justify-center shadow-md`}>
              <span className={`font-bold text-lg ${isAdmin ? 'text-purple-900' : 'text-kafaat-navy'}`}>
                {isAdmin ? '👑' : 'K'}
              </span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                {isAdmin 
                  ? (language === 'en' ? 'Admin Portal' : 'بوابة المسؤول')
                  : (language === 'en' ? 'Kafaat Smart Evaluation' : 'منصة كفاءات للتقييم الذكي')
                }
              </h1>
              <p className={`text-xs ${isAdmin ? 'text-purple-200' : 'text-blue-200'}`}>
                {isAdmin 
                  ? (language === 'en' ? 'Management Dashboard' : 'لوحة الإدارة')
                  : (language === 'en' ? 'Leadership Assessment' : 'تقييم القيادة')
                }
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isAdmin 
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            {/* Logout Button */}
            {showLogout && (
              <button
                onClick={handleLogout}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isAdmin 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                }`}
              >
                <span>🚪</span>
                {language === 'en' ? 'Logout' : 'خروج'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
