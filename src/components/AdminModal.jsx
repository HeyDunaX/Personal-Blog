import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminModal({ open, onClose, onImport }) {
  const { t } = useLanguage();
  const { themeName, theme } = useTheme();
  const [url, setUrl] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    await onImport(url.trim(), date);
    setLoading(false);
    setUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-xl rounded-2xl border p-6"
            style={{
              borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.25)' : 'rgba(20,33,61,0.2)',
              backgroundColor: themeName === 'dark' ? 'rgba(11,17,32,0.96)' : 'rgba(248,250,253,0.96)'
            }}
          >
            <h3 className="font-heading text-3xl" style={{ color: theme.text }}>
              {t({ en: 'Admin News Import', vi: 'Nhập Tin Quản Trị' })}
            </h3>
            <p className="mt-2 text-sm" style={{ color: theme.secondary }}>
              {t({
                en: 'Paste an external article URL to mock-scrape cover image, title and abstract.',
                vi: 'Dán URL bài báo bên ngoài để mô phỏng trích xuất ảnh bìa, tiêu đề và tóm tắt.'
              })}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.secondary }}>
                  {t({ en: 'Article URL', vi: 'Đường dẫn bài báo' })}
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  placeholder="https://example.com/article"
                  style={{
                    borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.35)' : 'rgba(20,33,61,0.3)',
                    backgroundColor: themeName === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme.text
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.secondary }}>
                  {t({ en: 'Publish Date', vi: 'Ngày xuất bản' })}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.35)' : 'rgba(20,33,61,0.3)',
                    backgroundColor: themeName === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme.text
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={onClose} className="chip">
                  {t({ en: 'Cancel', vi: 'Hủy' })}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(180deg, #344A6A 0%, #2A3C5A 50%, #131D35 100%)',
                    border: '1px solid #2A3C5A',
                    color: '#F4F7FC'
                  }}
                >
                  {loading ? t({ en: 'Importing...', vi: 'Đang nhập...' }) : t({ en: 'Import', vi: 'Nhập' })}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
