import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import Header from '../components/Header';
import * as auth from '../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Check authentication - admin must use admin-login route
    if (!auth.isLoggedIn()) {
      navigate('/admin-login');
      return;
    }

    if (!auth.isAdmin()) {
      auth.logout();
      navigate('/login');
      return;
    }

    loadData();
    
    // Auto-refresh data every 10 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      loadData();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const loadData = () => {
    // Get fresh data from storage
    const allUsers = auth.getUsers();
    // Show all users except the main admin
    setUsers(allUsers.filter(u => u.email !== 'eslamelkilany@gmail.com'));
    setReports(auth.getAllReports());
    setLastRefresh(new Date());
  };
  
  // Manual refresh function
  const handleRefresh = () => {
    loadData();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(language === 'en' 
      ? 'Are you sure you want to delete this user?' 
      : 'هل أنت متأكد من حذف هذا المستخدم؟'
    )) {
      auth.deleteUser(userId);
      loadData();
    }
  };

  const handleToggleAssessment = (userId, assessmentType) => {
    const user = auth.getUserById(userId);
    if (user.role === 'admin') return; // Admins don't need assessment toggles
    
    if (user.assignedAssessments?.includes(assessmentType)) {
      auth.removeAssessment(userId, assessmentType);
    } else {
      auth.assignAssessment(userId, assessmentType);
    }
    loadData();
  };

  const handleResetTokens = (userId) => {
    auth.resetUserTokens(userId);
    loadData();
    alert(language === 'en' ? 'Tokens reset successfully!' : 'تم إعادة تعيين الرموز بنجاح!');
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalReports: reports.length,
    kafaatReports: reports.filter(r => r.assessmentType === 'kafaat').length,
    report360: reports.filter(r => r.assessmentType === '360').length
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header showLogout={true} isAdmin={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-12 h-12 bg-kafaat-gold rounded-xl flex items-center justify-center">👑</span>
            {language === 'en' ? 'Admin Dashboard' : 'لوحة تحكم المسؤول'}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === 'en' ? 'Manage users, assessments, tokens, and reports' : 'إدارة المستخدمين والتقييمات والرموز والتقارير'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Total Users' : 'إجمالي المستخدمين'}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Active Users' : 'مستخدمون نشطون'}</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Total Reports' : 'إجمالي التقارير'}</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalReports}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? 'Kafaat Reports' : 'تقارير كفاءات'}</p>
            <p className="text-3xl font-bold text-blue-600">{stats.kafaatReports}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">{language === 'en' ? '360° Reports' : 'تقارير 360°'}</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.report360}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'users', en: 'Users Management', ar: 'إدارة المستخدمين', icon: '👥' },
                { id: 'reports', en: 'Assessment Reports', ar: 'تقارير التقييمات', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-kafaat-navy text-kafaat-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {language === 'en' ? tab.en : tab.ar}
                </button>
              ))}
            </nav>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Registered Users' : 'المستخدمون المسجلون'}
                </h2>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-kafaat-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 flex items-center gap-2 shadow-lg"
                >
                  <span>+</span>
                  {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
                </button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">👤</span>
                  <p className="text-xl">{language === 'en' ? 'No users registered yet' : 'لا يوجد مستخدمون مسجلون بعد'}</p>
                  <p className="text-sm mt-2">{language === 'en' ? 'Click "Add User" to create a new user' : 'انقر على "إضافة مستخدم" لإنشاء مستخدم جديد'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'User' : 'المستخدم'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Role' : 'الدور'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Department' : 'القسم'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Tokens' : 'الرموز'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Assessments' : 'التقييمات'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Progress' : 'التقدم'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Status' : 'الحالة'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {language === 'en' ? 'Actions' : 'الإجراءات'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(user => {
                        const usedTokens = user.completedAssessments?.length || 0;
                        const totalTokens = user.tokens || 0;
                        const hasTokens = user.role === 'admin' || totalTokens > usedTokens;
                        
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'admin' 
                                  ? (language === 'en' ? '👑 Admin' : '👑 مسؤول')
                                  : (language === 'en' ? '👤 Candidate' : '👤 مرشح')
                                }
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-gray-900">{user.department || '-'}</div>
                              <div className="text-sm text-gray-500">{user.position || '-'}</div>
                            </td>
                            <td className="px-4 py-4">
                              {user.role !== 'admin' ? (
                                <div className="flex flex-col items-start gap-1">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    hasTokens ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    🎫 {usedTokens} / {totalTokens}
                                  </span>
                                  {!hasTokens && (
                                    <span className="text-xs text-red-500">
                                      {language === 'en' ? 'No tokens left' : 'لا رموز متبقية'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {user.role !== 'admin' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleToggleAssessment(user.id, 'kafaat')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      user.assignedAssessments?.includes('kafaat')
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    🤖 Kafaat
                                  </button>
                                  <button
                                    onClick={() => handleToggleAssessment(user.id, '360')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      user.assignedAssessments?.includes('360')
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    🔄 360°
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Full Access</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-gray-600 text-sm">
                                {user.completedAssessments?.length || 0} / {user.assignedAssessments?.length || 0}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive 
                                  ? (language === 'en' ? 'Active' : 'نشط')
                                  : (language === 'en' ? 'Inactive' : 'غير نشط')
                                }
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title={language === 'en' ? 'Edit' : 'تعديل'}
                                >
                                  ✏️
                                </button>
                                {user.role !== 'admin' && (
                                  <button
                                    onClick={() => handleResetTokens(user.id)}
                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                    title={language === 'en' ? 'Reset Tokens' : 'إعادة تعيين الرموز'}
                                  >
                                    🔄
                                  </button>
                                )}
                                {user.reports?.length > 0 && (
                                  <Link
                                    to={`/admin/user-reports/${user.id}`}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                    title={language === 'en' ? 'View Reports' : 'عرض التقارير'}
                                  >
                                    📊
                                  </Link>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title={language === 'en' ? 'Delete' : 'حذف'}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'en' ? 'Completed Assessment Reports' : 'تقارير التقييمات المكتملة'}
              </h2>

              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">📊</span>
                  <p className="text-xl">{language === 'en' ? 'No completed reports yet' : 'لا توجد تقارير مكتملة بعد'}</p>
                  <p className="text-sm mt-2">{language === 'en' ? 'Reports will appear here after users complete assessments' : 'ستظهر التقارير هنا بعد إكمال المستخدمين للتقييمات'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow ${
                            report.assessmentType === 'kafaat' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            <span className="text-3xl">
                              {report.assessmentType === 'kafaat' ? '🤖' : '🔄'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{report.userName}</h3>
                            <p className="text-sm text-gray-500">
                              {report.userEmail} • {report.userDepartment || '-'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {language === 'en' ? 'Completed:' : 'مكتمل:'} {new Date(report.completedAt).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              report.data.overallScore >= 80 ? 'bg-green-100' :
                              report.data.overallScore >= 60 ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              <span className={`text-2xl font-bold ${
                                report.data.overallScore >= 80 ? 'text-green-600' :
                                report.data.overallScore >= 60 ? 'text-blue-600' :
                                'text-yellow-600'
                              }`}>
                                {report.data.overallScore}%
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/admin/report/${report.userId}/${report.id}`}
                            className="bg-kafaat-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 flex items-center gap-2 shadow"
                          >
                            <span>📄</span>
                            {language === 'en' ? 'View Full Report' : 'عرض التقرير الكامل'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          onClose={() => {
            setShowCreateUserModal(false);
            loadData();
          }}
          language={language}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setEditingUser(null);
            loadData();
          }}
          language={language}
        />
      )}
    </div>
  );
};

// Create User Modal Component with Token System
const CreateUserModal = ({ onClose, language }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    password: '',
    department: '',
    position: '',
    role: 'candidate',
    tokens: 1, // Default 1 token (1 assessment session)
    assignedAssessments: []
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.role === 'candidate') {
      if (formData.assignedAssessments.length === 0) {
        setError(language === 'en' 
          ? 'Please assign at least one assessment for the candidate'
          : 'يرجى تعيين تقييم واحد على الأقل للمرشح'
        );
        return;
      }
      if (formData.tokens < 1) {
        setError(language === 'en' 
          ? 'Please assign at least 1 token for the candidate'
          : 'يرجى تعيين رمز واحد على الأقل للمرشح'
        );
        return;
      }
    }

    const result = auth.createUser(formData);
    
    if (result.success) {
      const roleText = formData.role === 'candidate' 
        ? (language === 'en' ? 'Candidate' : 'مرشح')
        : (language === 'en' ? 'Administrator' : 'مسؤول');
      
      const tokenInfo = formData.role === 'candidate' 
        ? `\n${language === 'en' ? 'Tokens' : 'الرموز'}: ${formData.tokens}`
        : '';
      
      const loginUrl = formData.role === 'admin'
        ? `\n${language === 'en' ? 'Login URL' : 'رابط الدخول'}: /admin-login`
        : `\n${language === 'en' ? 'Login URL' : 'رابط الدخول'}: /login`;
      
      // Log the created user for debugging
      console.log('User created successfully:', {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive
      });
      
      // Verify user was saved
      const savedUsers = auth.getUsers();
      console.log('All users after creation:', savedUsers.map(u => ({ email: u.email, role: u.role })));
      
      alert(language === 'en' 
        ? `✅ User created successfully!\n\n👤 Role: ${roleText}\n📧 Email: ${formData.email}\n🔑 Password: ${formData.password}${tokenInfo}${loginUrl}\n\n⚠️ Important: Share these credentials with the user.\nThe user can now login at the /login page.`
        : `✅ تم إنشاء المستخدم بنجاح!\n\n👤 الدور: ${roleText}\n📧 البريد: ${formData.email}\n🔑 كلمة المرور: ${formData.password}${tokenInfo}${loginUrl}\n\n⚠️ مهم: شارك هذه البيانات مع المستخدم.\nيمكن للمستخدم الآن تسجيل الدخول من صفحة /login.`
      );
      onClose();
    } else {
      console.error('Failed to create user:', result.error);
      setError(result.error);
    }
  };

  const toggleAssessment = (type) => {
    setFormData(prev => ({
      ...prev,
      assignedAssessments: prev.assignedAssessments.includes(type)
        ? prev.assignedAssessments.filter(a => a !== type)
        : [...prev.assignedAssessments, type]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-kafaat-navy to-blue-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {language === 'en' ? 'Add New User' : 'إضافة مستخدم جديد'}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'User Role' : 'دور المستخدم'} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'candidate', tokens: 1})}
                className={`p-4 border-2 rounded-xl transition-all text-center ${
                  formData.role === 'candidate'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <span className="text-3xl block mb-2">👤</span>
                <span className="font-bold text-gray-900 block">
                  {language === 'en' ? 'Candidate' : 'مرشح'}
                </span>
                <span className="text-xs text-gray-500">
                  {language === 'en' ? 'Takes assessments' : 'يجري التقييمات'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'admin', assignedAssessments: ['kafaat', '360'], tokens: 0})}
                className={`p-4 border-2 rounded-xl transition-all text-center ${
                  formData.role === 'admin'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-3xl block mb-2">👑</span>
                <span className="font-bold text-gray-900 block">
                  {language === 'en' ? 'Administrator' : 'مسؤول'}
                </span>
                <span className="text-xs text-gray-500">
                  {language === 'en' ? 'Full system access' : 'وصول كامل'}
                </span>
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Name (English)' : 'الاسم (إنجليزي)'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Name (Arabic)' : 'الاسم (عربي)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
                placeholder="الاسم بالعربي"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Email' : 'البريد الإلكتروني'} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="ltr"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Password' : 'كلمة المرور'} *
            </label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="ltr"
              placeholder="Password123"
            />
          </div>

          {/* Department & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Department' : 'القسم'}
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Position' : 'المنصب'}
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* TOKEN SYSTEM - Only for Candidates */}
          {formData.role === 'candidate' && (
            <>
              {/* Tokens */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <span>🎫</span>
                  {language === 'en' ? 'Assessment Tokens (Sessions)' : 'رموز التقييم (الجلسات)'} *
                </label>
                <p className="text-xs text-yellow-700 mb-3">
                  {language === 'en' 
                    ? 'Number of times this user can complete assessments. Each assessment completion uses 1 token.'
                    : 'عدد المرات التي يمكن لهذا المستخدم إكمال التقييمات. كل إكمال تقييم يستخدم رمزاً واحداً.'
                  }
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tokens: Math.max(1, formData.tokens - 1)})}
                    className="w-10 h-10 bg-white border-2 border-yellow-400 rounded-lg text-yellow-600 font-bold hover:bg-yellow-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.tokens}
                    onChange={(e) => setFormData({...formData, tokens: Math.max(1, parseInt(e.target.value) || 1)})}
                    className="w-20 text-center px-4 py-2 border-2 border-yellow-400 rounded-lg text-xl font-bold text-yellow-800"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tokens: formData.tokens + 1})}
                    className="w-10 h-10 bg-white border-2 border-yellow-400 rounded-lg text-yellow-600 font-bold hover:bg-yellow-100"
                  >
                    +
                  </button>
                  <span className="text-sm text-yellow-700">
                    {language === 'en' ? 'tokens' : 'رموز'}
                  </span>
                </div>
              </div>

              {/* Assessment Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Assign Assessments' : 'تعيين التقييمات'} *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => toggleAssessment('kafaat')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.assignedAssessments.includes('kafaat')
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🤖</span>
                    <span className="font-medium block">Kafaat AI</span>
                    <span className="text-xs text-gray-500">16 {language === 'en' ? 'questions' : 'سؤال'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAssessment('360')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.assignedAssessments.includes('360')
                        ? 'border-yellow-500 bg-yellow-50 shadow-md'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🔄</span>
                    <span className="font-medium block">360° Leadership</span>
                    <span className="text-xs text-gray-500">75 {language === 'en' ? 'questions' : 'سؤال'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Admin Info */}
          {formData.role === 'admin' && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-purple-800 text-sm flex items-center gap-2">
                <span>ℹ️</span>
                {language === 'en' 
                  ? 'Administrators have full access to the system and do not need tokens. They must use the Admin Login page (/admin-login).'
                  : 'المسؤولون لديهم وصول كامل للنظام ولا يحتاجون رموز. يجب عليهم استخدام صفحة دخول المسؤول (/admin-login).'
                }
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-kafaat-navy text-white rounded-lg hover:bg-blue-800 font-medium shadow-lg"
            >
              {language === 'en' ? 'Create User' : 'إنشاء المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, language }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    nameAr: user.nameAr || '',
    password: user.password || '',
    department: user.department || '',
    position: user.position || '',
    tokens: user.tokens || 1,
    isActive: user.isActive !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    auth.updateUser(user.id, formData);
    alert(language === 'en' ? 'User updated successfully!' : 'تم تحديث المستخدم بنجاح!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {language === 'en' ? 'Edit User' : 'تعديل المستخدم'}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">{language === 'en' ? 'Email (cannot be changed)' : 'البريد الإلكتروني (لا يمكن تغييره)'}</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Name (English)' : 'الاسم (إنجليزي)'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Name (Arabic)' : 'الاسم (عربي)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Password' : 'كلمة المرور'} *
            </label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Department' : 'القسم'}
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'en' ? 'Position' : 'المنصب'}
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Edit Tokens */}
          {user.role !== 'admin' && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span>🎫</span>
                {language === 'en' ? 'Assessment Tokens' : 'رموز التقييم'}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tokens: Math.max(0, formData.tokens - 1)})}
                  className="w-10 h-10 bg-white border-2 border-yellow-400 rounded-lg text-yellow-600 font-bold hover:bg-yellow-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={formData.tokens}
                  onChange={(e) => setFormData({...formData, tokens: Math.max(0, parseInt(e.target.value) || 0)})}
                  className="w-20 text-center px-4 py-2 border-2 border-yellow-400 rounded-lg text-xl font-bold text-yellow-800"
                />
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tokens: formData.tokens + 1})}
                  className="w-10 h-10 bg-white border-2 border-yellow-400 rounded-lg text-yellow-600 font-bold hover:bg-yellow-100"
                >
                  +
                </button>
                <span className="text-sm text-yellow-700">
                  ({user.completedAssessments?.length || 0} {language === 'en' ? 'used' : 'مستخدم'})
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">
                {language === 'en' ? 'Account Active' : 'الحساب نشط'}
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg"
            >
              {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
