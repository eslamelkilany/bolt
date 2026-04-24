import React, { useMemo, useState } from 'react';

// Per-module grouped question reviewer. Shows citations inline so admin
// can verify every correct answer traces back to source text. Supports
// editing stem/options/explanation/correct index, deleting a question,
// regenerating a module's questions, and publishing the assessment.
//
// Parent owns the source of truth for moduleResults — this component is
// a controlled wrapper that calls onChange on any mutation. Parent is
// responsible for persisting to localStorage/D1 on publish.

const sourceBadge = (source, needsReview) => {
  if (source === 'llm' && !needsReview) {
    return {
      label: 'LLM',
      className: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
  }
  return {
    label: 'Needs review',
    className: 'bg-amber-100 text-amber-800 border border-amber-200'
  };
};

const moduleSourceBadge = (source) =>
  source === 'llm'
    ? { label: 'Grounded by Claude', className: 'bg-emerald-100 text-emerald-800' }
    : { label: 'Rule-based fallback', className: 'bg-amber-100 text-amber-800' };

const QuestionReviewModal = ({
  courseTitle,
  moduleResults,
  language,
  isRTL,
  regenerating, // { [moduleId]: boolean }
  publishing,
  onChange, // (nextModuleResults) => void
  onRegenerateModule, // (moduleId) => void
  onPublish,
  onCancel
}) => {
  const t = (en, ar) => (language === 'en' ? en : ar);

  const counts = useMemo(() => {
    let total = 0;
    let llm = 0;
    let fallback = 0;
    for (const mr of moduleResults) {
      total += mr.questions.length;
      for (const q of mr.questions) {
        if (q.source === 'llm' && !q.needsReview) llm += 1;
        else fallback += 1;
      }
    }
    return { total, llm, fallback };
  }, [moduleResults]);

  const canPublish = counts.total > 0 && !publishing;

  const updateQuestion = (moduleId, qIdx, patch) => {
    onChange(
      moduleResults.map((mr) =>
        mr.moduleId !== moduleId
          ? mr
          : {
              ...mr,
              questions: mr.questions.map((q, i) => (i === qIdx ? { ...q, ...patch } : q))
            }
      )
    );
  };

  const deleteQuestion = (moduleId, qIdx) => {
    onChange(
      moduleResults.map((mr) =>
        mr.moduleId !== moduleId
          ? mr
          : {
              ...mr,
              questions: mr.questions.filter((_, i) => i !== qIdx)
            }
      )
    );
  };

  const updateOption = (moduleId, qIdx, oIdx, value) => {
    const mr = moduleResults.find((x) => x.moduleId === moduleId);
    const q = mr?.questions[qIdx];
    if (!q) return;
    const options = q.options.map((o, i) => (i === oIdx ? value : o));
    updateQuestion(moduleId, qIdx, { options });
  };

  const deleteOption = (moduleId, qIdx, oIdx) => {
    const mr = moduleResults.find((x) => x.moduleId === moduleId);
    const q = mr?.questions[qIdx];
    if (!q || q.options.length <= 2) return;
    const options = q.options.filter((_, i) => i !== oIdx);
    let correctIndex = q.correctIndex;
    if (oIdx === correctIndex) correctIndex = 0;
    else if (oIdx < correctIndex) correctIndex -= 1;
    updateQuestion(moduleId, qIdx, { options, correctIndex });
  };

  const addOption = (moduleId, qIdx) => {
    const mr = moduleResults.find((x) => x.moduleId === moduleId);
    const q = mr?.questions[qIdx];
    if (!q || q.options.length >= 6) return;
    updateQuestion(moduleId, qIdx, { options: [...q.options, ''] });
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 ${isRTL ? 'rtl' : 'ltr'}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('Review assessment questions', 'مراجعة أسئلة التقييم')}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {t('Review & publish assessment', 'مراجعة ونشر التقييم')}
            </h2>
            {courseTitle && (
              <p className="text-sm text-gray-600 mt-1 truncate">{courseTitle}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">
                {t(`${counts.total} total`, `${counts.total} إجمالي`)}
              </span>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                {t(`${counts.llm} grounded by LLM`, `${counts.llm} من الذكاء الاصطناعي`)}
              </span>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">
                {t(
                  `${counts.fallback} need review`,
                  `${counts.fallback} بحاجة للمراجعة`
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {moduleResults.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              {t('No module results yet.', 'لا توجد نتائج وحدات بعد.')}
            </div>
          )}

          {moduleResults.map((mr) => {
            const msBadge = moduleSourceBadge(mr.source);
            const isRegenerating = !!regenerating[mr.moduleId];
            return (
              <section
                key={mr.moduleId}
                className="border border-gray-200 rounded-lg"
              >
                <header className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {mr.moduleTitle || t('Untitled module', 'وحدة بدون عنوان')}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${msBadge.className}`}>
                        {t(msBadge.label, msBadge.label)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        {t(
                          `${mr.questions.length} questions`,
                          `${mr.questions.length} سؤال`
                        )}
                      </span>
                      {mr.reason && mr.source !== 'llm' && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono truncate max-w-xs">
                          {mr.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRegenerateModule(mr.moduleId)}
                    disabled={isRegenerating}
                    className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegenerating
                      ? t('Regenerating…', 'جاري الإنشاء…')
                      : t('Regenerate module', 'إعادة إنشاء الوحدة')}
                  </button>
                </header>

                <div className="divide-y divide-gray-100">
                  {mr.questions.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      {t(
                        'No questions generated for this module.',
                        'لم يتم إنشاء أسئلة لهذه الوحدة.'
                      )}
                    </div>
                  )}

                  {mr.questions.map((q, qIdx) => {
                    const qBadge = sourceBadge(q.source, q.needsReview);
                    return (
                      <div key={qIdx} className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold shrink-0">
                            {qIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <label className="block text-xs text-gray-600 mb-1">
                              {t('Question', 'السؤال')}
                            </label>
                            <textarea
                              value={q.stem}
                              onChange={(e) =>
                                updateQuestion(mr.moduleId, qIdx, { stem: e.target.value })
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-1 rounded ${qBadge.className}`}>
                              {qBadge.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteQuestion(mr.moduleId, qIdx)}
                              className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                            >
                              {t('Delete', 'حذف')}
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            {t('Options (select the correct one)', 'الخيارات (اختر الصحيح)')}
                          </label>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${mr.moduleId}-${qIdx}`}
                                  checked={oIdx === q.correctIndex}
                                  onChange={() =>
                                    updateQuestion(mr.moduleId, qIdx, { correctIndex: oIdx })
                                  }
                                  className="h-4 w-4"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    updateOption(mr.moduleId, qIdx, oIdx, e.target.value)
                                  }
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteOption(mr.moduleId, qIdx, oIdx)}
                                  disabled={q.options.length <= 2}
                                  className="text-xs px-2 py-1 text-gray-500 disabled:opacity-30"
                                  title={t('Remove option', 'حذف الخيار')}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addOption(mr.moduleId, qIdx)}
                            disabled={q.options.length >= 6}
                            className="mt-2 text-xs text-purple-700 hover:underline disabled:opacity-40"
                          >
                            + {t('Add option', 'إضافة خيار')}
                          </button>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            {t('Explanation', 'التفسير')}
                          </label>
                          <textarea
                            value={q.explanation || ''}
                            onChange={(e) =>
                              updateQuestion(mr.moduleId, qIdx, { explanation: e.target.value })
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        {q.citation && (
                          <div className="mt-3">
                            <label className="block text-xs text-gray-600 mb-1">
                              {t('Source citation (verbatim from module)', 'الاقتباس المصدر (من الوحدة)')}
                            </label>
                            <blockquote className="px-3 py-2 bg-emerald-50 border-l-4 border-emerald-400 rounded text-sm text-emerald-900 italic">
                              {q.citation}
                            </blockquote>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {counts.fallback > 0
              ? t(
                  `${counts.fallback} question(s) need review before publishing.`,
                  `${counts.fallback} سؤال بحاجة للمراجعة قبل النشر.`
                )
              : t('All questions grounded by LLM.', 'جميع الأسئلة مدعومة بالذكاء الاصطناعي.')}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={publishing}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('Back to modules', 'العودة للوحدات')}
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={!canPublish}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing
                ? t('Publishing…', 'جاري النشر…')
                : t('Publish assessment', 'نشر التقييم')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionReviewModal;
