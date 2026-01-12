import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';

const HomePage = () => {
  const { language, t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-kafaat text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-kafaat-gold rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-kafaat-navy font-bold text-4xl">K</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('platformName')}
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            {t('platformSlogan')}
          </p>
          <p className="max-w-2xl mx-auto text-blue-100">
            {language === 'en' 
              ? 'Comprehensive AI-powered leadership assessment platform designed to evaluate and develop leadership competencies based on Kafaat curriculum.'
              : 'منصة تقييم القيادة الشاملة المدعومة بالذكاء الاصطناعي، مصممة لتقييم وتطوير الكفاءات القيادية بناءً على منهج كفاءات.'
            }
          </p>
        </div>
      </section>

      {/* Assessment Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {language === 'en' ? 'Assessment Types' : 'أنواع التقييم'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Kafaat Assessment Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="h-3 bg-gradient-to-r from-kafaat-navy to-blue-500"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('kafaatAssessment')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('kafaatDescription')}
                </p>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'AI-powered question generation' : 'توليد الأسئلة بالذكاء الاصطناعي'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'Scenario-based assessment' : 'تقييم قائم على السيناريوهات'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? '8 leadership competency areas' : '8 مجالات للكفاءة القيادية'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'Comprehensive analytics report' : 'تقرير تحليلي شامل'}
                  </li>
                </ul>
                <Link 
                  to="/kafaat"
                  className="block w-full bg-kafaat-navy text-white text-center py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  {language === 'en' ? 'Start Assessment' : 'بدء التقييم'}
                </Link>
              </div>
            </div>

            {/* 360 Assessment Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="h-3 bg-gradient-to-r from-kafaat-gold to-yellow-400"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('leadershipAssessment')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('leadershipDescription')}
                </p>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? '75 comprehensive questions' : '75 سؤالاً شاملاً'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'Multi-rater feedback' : 'تغذية راجعة متعددة المقيّمين'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'Colleagues, Staff, External clients' : 'الزملاء، الموظفين، العملاء الخارجيين'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {language === 'en' ? 'Gallup-style visual report' : 'تقرير بصري بأسلوب Gallup'}
                  </li>
                </ul>
                <Link 
                  to="/360"
                  className="block w-full bg-kafaat-gold text-kafaat-navy text-center py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  {language === 'en' ? 'Start 360° Assessment' : 'بدء تقييم 360°'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competency Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {language === 'en' ? 'Leadership Competency Areas' : 'مجالات الكفاءة القيادية'}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Based on Kafaat comprehensive leadership development curriculum'
              : 'بناءً على منهج كفاءات الشامل لتطوير القيادة'
            }
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🎯', en: 'Leadership Fundamentals', ar: 'أساسيات القيادة' },
              { icon: '🔄', en: 'Change Management', ar: 'إدارة التغيير' },
              { icon: '📊', en: 'Performance Management', ar: 'إدارة الأداء' },
              { icon: '👥', en: 'Team Building', ar: 'بناء الفرق' },
              { icon: '💬', en: 'Communication', ar: 'التواصل' },
              { icon: '🧩', en: 'Problem Solving', ar: 'حل المشكلات' },
              { icon: '❤️', en: 'Emotional Intelligence', ar: 'الذكاء العاطفي' },
              { icon: '🚀', en: 'Strategic Implementation', ar: 'التنفيذ الاستراتيجي' }
            ].map((comp, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors"
              >
                <span className="text-4xl mb-3 block">{comp.icon}</span>
                <h4 className="font-medium text-gray-800">
                  {language === 'en' ? comp.en : comp.ar}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {language === 'en' ? 'Platform Features' : 'مميزات المنصة'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: { en: 'Comprehensive Reports', ar: 'تقارير شاملة' },
                desc: { en: 'Gallup/Gr8-style visual analytics with actionable insights', ar: 'تحليلات بصرية بأسلوب Gallup مع رؤى قابلة للتنفيذ' }
              },
              {
                icon: '🌐',
                title: { en: 'Bilingual Support', ar: 'دعم ثنائي اللغة' },
                desc: { en: 'Full Arabic and English support throughout the platform', ar: 'دعم كامل للعربية والإنجليزية في جميع أنحاء المنصة' }
              },
              {
                icon: '🔗',
                title: { en: 'Easy Link Sharing', ar: 'مشاركة سهلة بالروابط' },
                desc: { en: 'Generate unique assessment links for applicants', ar: 'إنشاء روابط تقييم فريدة للمتقدمين' }
              },
              {
                icon: '📥',
                title: { en: 'PDF Download', ar: 'تحميل PDF' },
                desc: { en: 'Download comprehensive reports in PDF format', ar: 'تحميل التقارير الشاملة بصيغة PDF' }
              },
              {
                icon: '📈',
                title: { en: 'Progress Tracking', ar: 'تتبع التقدم' },
                desc: { en: 'Monitor assessment completion status in real-time', ar: 'متابعة حالة إكمال التقييم في الوقت الفعلي' }
              },
              {
                icon: '🔒',
                title: { en: 'Data Security', ar: 'أمان البيانات' },
                desc: { en: 'Secure storage and handling of assessment data', ar: 'تخزين ومعالجة آمنة لبيانات التقييم' }
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === 'en' ? feature.title.en : feature.title.ar}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' ? feature.desc.en : feature.desc.ar}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kafaat-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-200">
            © 2024 {t('platformName')}
          </p>
          <p className="text-sm text-blue-300 mt-2">
            {language === 'en' 
              ? 'Powered by THOT Knowledge'
              : 'مدعوم من ثوت للمعرفة'
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
