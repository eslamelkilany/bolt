import React, { useMemo, useState } from 'react';
import { extractModules } from '../utils/courseAIAnalyzer';

const MIN_MODULE_CONTENT_LENGTH = 50;

const cloneModules = (modules) =>
  modules.map((m, i) => ({
    id: m.id || `module-${i + 1}`,
    title: {
      en: m.title?.en || `Module ${i + 1}`,
      ar: m.title?.ar || `الوحدة ${i + 1}`
    },
    content: m.content || '',
    startOffset: typeof m.startOffset === 'number' ? m.startOffset : null,
    endOffset: typeof m.endOffset === 'number' ? m.endOffset : null,
    objectives: m.objectives || [],
    topics: m.topics || []
  }));

const reindexIds = (modules) =>
  modules.map((m, i) => ({ ...m, id: `module-${i + 1}` }));

const ModuleBoundaryEditor = ({ course, language, isRTL, onConfirm, onCancel }) => {
  const [modules, setModules] = useState(() => cloneModules(course.modules || []));
  const parsedText = course.parsedText || '';

  const t = (en, ar) => (language === 'en' ? en : ar);

  const tooShort = useMemo(
    () => modules.some((m) => (m.content || '').trim().length < MIN_MODULE_CONTENT_LENGTH),
    [modules]
  );
  const canContinue = modules.length > 0 && !tooShort;

  const updateModule = (idx, patch) => {
    setModules((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const renameModule = (idx, lang, value) => {
    setModules((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, title: { ...m.title, [lang]: value } } : m))
    );
  };

  // Manual edits invalidate offsets into parsedText — clear them so the
  // downstream generator relies on content only.
  const editContent = (idx, value) => {
    updateModule(idx, { content: value, startOffset: null, endOffset: null });
  };

  const removeModule = (idx) => {
    setModules((prev) => reindexIds(prev.filter((_, i) => i !== idx)));
  };

  const mergeWithNext = (idx) => {
    setModules((prev) => {
      if (idx >= prev.length - 1) return prev;
      const a = prev[idx];
      const b = prev[idx + 1];
      const merged = {
        ...a,
        content: [a.content, b.content].filter(Boolean).join('\n\n'),
        endOffset: b.endOffset ?? a.endOffset,
        objectives: [...(a.objectives || []), ...(b.objectives || [])],
        topics: [...(a.topics || []), ...(b.topics || [])]
      };
      const next = [...prev.slice(0, idx), merged, ...prev.slice(idx + 2)];
      return reindexIds(next);
    });
  };

  const moveUp = (idx) => {
    setModules((prev) => {
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return reindexIds(next);
    });
  };

  const moveDown = (idx) => {
    setModules((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return reindexIds(next);
    });
  };

  const addModuleAfter = (idx) => {
    setModules((prev) => {
      const blank = {
        id: `module-${prev.length + 1}`,
        title: { en: `New Module`, ar: `وحدة جديدة` },
        content: '',
        startOffset: null,
        endOffset: null,
        objectives: [],
        topics: []
      };
      const next = [...prev.slice(0, idx + 1), blank, ...prev.slice(idx + 1)];
      return reindexIds(next);
    });
  };

  const redetect = () => {
    if (!parsedText) return;
    const confirmMsg = t(
      'Re-detect module boundaries from the uploaded text? Your current edits will be lost.',
      'إعادة اكتشاف حدود الوحدات من النص المرفوع؟ ستفقد التعديلات الحالية.'
    );
    if (!window.confirm(confirmMsg)) return;
    const detected = extractModules(parsedText);
    setModules(cloneModules(detected));
  };

  const handleConfirm = () => {
    if (!canContinue) return;
    onConfirm(reindexIds(modules));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 ${isRTL ? 'rtl' : 'ltr'}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('Review course modules', 'مراجعة وحدات الدورة')}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('Review course modules', 'مراجعة وحدات الدورة')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t(
                'Questions will be generated strictly from the content of each module. Edit titles, adjust content, merge or split modules before generation.',
                'سيتم إنشاء الأسئلة بناءً على محتوى كل وحدة حصراً. قم بتعديل العناوين أو المحتوى أو دمج الوحدات قبل الإنشاء.'
              )}
            </p>
            {course.sourceFile?.name && (
              <p className="text-xs text-gray-500 mt-2">
                {t('Source file', 'الملف المصدر')}: <span className="font-mono">{course.sourceFile.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={redetect}
            disabled={!parsedText}
            className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('Re-run automatic detection', 'إعادة الاكتشاف التلقائي')}
          >
            {t('Re-detect', 'إعادة الاكتشاف')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {modules.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {t('No modules. Add one below.', 'لا توجد وحدات. أضف واحدة بالأسفل.')}
            </div>
          )}

          {modules.map((m, idx) => {
            const length = (m.content || '').trim().length;
            const isShort = length < MIN_MODULE_CONTENT_LENGTH;
            return (
              <div
                key={m.id + '-' + idx}
                className={`border rounded-lg p-4 ${isShort ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={m.title.en}
                      onChange={(e) => renameModule(idx, 'en', e.target.value)}
                      placeholder="Title (EN)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={m.title.ar}
                      onChange={(e) => renameModule(idx, 'ar', e.target.value)}
                      placeholder="العنوان (عربي)"
                      dir="rtl"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <textarea
                  value={m.content}
                  onChange={(e) => editContent(idx, e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={t(
                    'Module content that questions will be grounded on...',
                    'محتوى الوحدة الذي ستُبنى عليه الأسئلة...'
                  )}
                />

                <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-xs ${isShort ? 'text-red-600' : 'text-gray-500'}`}>
                    {t(`${length} characters`, `${length} حرف`)}
                    {isShort && (
                      <span className="ms-2">
                        ·{' '}
                        {t(
                          `min ${MIN_MODULE_CONTENT_LENGTH} required`,
                          `الحد الأدنى ${MIN_MODULE_CONTENT_LENGTH}`
                        )}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40"
                      title={t('Move up', 'نقل لأعلى')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx >= modules.length - 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40"
                      title={t('Move down', 'نقل لأسفل')}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => mergeWithNext(idx)}
                      disabled={idx >= modules.length - 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40"
                    >
                      {t('Merge with next', 'دمج مع التالي')}
                    </button>
                    <button
                      type="button"
                      onClick={() => addModuleAfter(idx)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      {t('Add after', 'إضافة بعد')}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModule(idx)}
                      className="px-2 py-1 text-xs text-red-700 border border-red-300 rounded hover:bg-red-50"
                    >
                      {t('Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => addModuleAfter(modules.length - 1)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-700"
          >
            + {t('Add module', 'إضافة وحدة')}
          </button>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {tooShort
              ? t(
                  'Some modules have too little content. Fix or remove them to continue.',
                  'بعض الوحدات تحتوي على محتوى قليل جداً. قم بتعديلها أو حذفها للمتابعة.'
                )
              : t(
                  `${modules.length} module(s) ready`,
                  `${modules.length} وحدة جاهزة`
                )}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('Cancel', 'إلغاء')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canContinue}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('Continue to generation', 'المتابعة إلى الإنشاء')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleBoundaryEditor;
