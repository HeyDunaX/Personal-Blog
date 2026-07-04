import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function DeleteConfirmModal({ open, onClose, onDelete }) {
  const { t } = useLanguage();
  const { themeName, theme } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (password !== 'long@ura') {
      setError(t({ en: 'Incorrect password', vi: 'Mật khẩu không chính xác' }));
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onDelete();
      setPassword('');
      onClose();
    } catch (err) {
      setError(t({ en: 'Failed to delete article', vi: 'Lỗi khi xóa bài viết' }));
    } finally {
      setLoading(false);
    }
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
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.25)' : 'rgba(20,33,61,0.2)',
              backgroundColor: themeName === 'dark' ? 'rgba(11,17,32,0.96)' : 'rgba(248,250,253,0.96)'
            }}
          >
            <h3 className="font-heading text-2xl text-red-500 font-extrabold">
              {t({ en: 'Confirm Deletion', vi: 'Xác Nhận Xóa' })}
            </h3>
            <p className="mt-2 text-sm" style={{ color: theme.secondary }}>
              {t({
                en: 'Please enter the admin password to confirm deleting this article.',
                vi: 'Vui lòng nhập mật khẩu quản trị để xác nhận xóa bài viết này.'
              })}
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.secondary }}>
                  {t({ en: 'Admin Password', vi: 'Mật khẩu quản trị' })}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  placeholder="••••••••"
                  style={{
                    borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.35)' : 'rgba(20,33,61,0.3)',
                    backgroundColor: themeName === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme.text
                  }}
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={handleClose} className="chip">
                  {t({ en: 'Cancel', vi: 'Hủy' })}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                    border: '1px solid #DC2626',
                    color: '#F4F7FC'
                  }}
                >
                  {loading ? t({ en: 'Deleting...', vi: 'Đang xóa...' }) : t({ en: 'Delete', vi: 'Xóa' })}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
