import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar({ onAboutClick, onNewsClick, onAdminOpen }) {
  const { lang, toggleLang, t } = useLanguage();
  const { themeName, toggleTheme, theme } = useTheme();

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 top-0 z-50 w-full"
    >
      <nav
        className="relative mx-auto mt-4 flex w-[92%] max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl md:px-6"
        style={{
          borderColor: themeName === 'dark' ? 'rgba(168,179,207,0.24)' : 'rgba(20,33,61,0.18)',
          background: themeName === 'dark' ? 'rgba(11,17,32,0.45)' : 'rgba(248,250,253,0.7)'
        }}
      >
        <div className="font-heading text-lg tracking-widest z-10" style={{ color: theme.heroTitle }}>
          LONG
        </div>

        {/* Absolute centered navigation links on sm+, inline flex on mobile */}
        <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-2 sm:gap-6 md:gap-10 z-10">
          <button className="nav-link font-heading text-xs tracking-[0.2em] font-semibold" style={{ color: theme.secondary }} onClick={onAboutClick}>
            ABOUT
          </button>
          <button className="nav-link font-heading text-xs tracking-[0.2em] font-semibold" style={{ color: theme.secondary }} onClick={onNewsClick}>
            NEWS
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 z-10">
          <button className="nav-link font-heading text-[10px] tracking-wider font-semibold mr-1 opacity-70 hover:opacity-100 hidden md:block" style={{ color: theme.secondary }} onClick={onAdminOpen}>
            {t({ en: 'ADMIN', vi: 'QUẢN TRỊ' })}
          </button>
          <button className="chip" onClick={toggleTheme}>
            {themeName === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
          <button className="chip" onClick={toggleLang}>
            {lang.toUpperCase()}
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
