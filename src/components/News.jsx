import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DeleteConfirmModal from './DeleteConfirmModal';

function FeaturedCard({ article, onOpen, themeName, t, onDelete }) {
  const displayTitle = typeof article.title === 'object' ? t(article.title) : article.title;
  const displayAbstract = typeof article.abstract === 'object' ? t(article.abstract) : article.abstract;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      onClick={() => onOpen(article.url)}
      className="group relative cursor-pointer overflow-hidden rounded-[4px]"
    >
      <div className="relative h-[280px] sm:h-[340px] md:h-[490px]">
        <img src={article.coverImage} alt={displayTitle} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              themeName === 'dark'
                ? 'linear-gradient(180deg, rgba(11,17,32,0.05) 30%, rgba(11,17,32,0.86) 100%)'
                : 'linear-gradient(180deg, rgba(248,250,253,0.05) 30%, rgba(20,33,61,0.76) 100%)'
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
          <h3 className="max-w-2xl font-heading text-[1.35rem] sm:text-[1.8rem] md:text-[2.45rem] font-extrabold leading-[1.1] sm:leading-[1.03] text-white">
            {displayTitle}
          </h3>
          <p className="mt-2 sm:mt-3 max-w-3xl text-[0.82rem] sm:text-[0.95rem] md:text-[1.15rem] leading-relaxed text-slate-200 line-clamp-3 sm:line-clamp-none">
            {displayAbstract}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(article.id);
          }}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/90 text-white shadow-lg hover:bg-red-700 hover:scale-105 active:scale-95 transition"
          title={t({ en: 'Delete Article', vi: 'Xóa bài viết' })}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16M10 11v6" />
          </svg>
        </button>
      </div>
    </motion.article>
  );
}

function SubFeaturedCard({ article, onOpen, themeName, t, onDelete }) {
  const cardBackground = themeName === 'dark' ? '#0f1a34' : '#ecf2fb';
  const displayTitle = typeof article.title === 'object' ? t(article.title) : article.title;
  const displayAbstract = typeof article.abstract === 'object' ? t(article.abstract) : article.abstract;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      onClick={() => onOpen(article.url)}
      className="group cursor-pointer overflow-hidden rounded-[3px] flex flex-col h-full relative"
      style={{ backgroundColor: cardBackground }}
    >
      <div className="h-[120px] sm:h-[130px] md:h-[150px] overflow-hidden flex-shrink-0 relative">
        <img src={article.coverImage} alt={displayTitle} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(article.id);
          }}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/90 text-white shadow-md hover:bg-red-700 hover:scale-105 active:scale-95 transition"
          title={t({ en: 'Delete Article', vi: 'Xóa bài viết' })}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16M10 11v6" />
          </svg>
        </button>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <h4 className="text-[0.9rem] font-extrabold leading-snug md:text-[0.97rem]" style={{ color: themeName === 'dark' ? '#F4F7FC' : '#14213D' }}>
          {displayTitle}
        </h4>
        <p className="mt-2 text-[0.72rem] leading-relaxed md:text-[0.73rem] flex-grow" style={{ color: themeName === 'dark' ? '#D6DDF0' : '#2D446B' }}>
          {displayAbstract}
        </p>
      </div>
    </motion.article>
  );
}

export default function News({ articles, onDelete }) {
  const { t } = useLanguage();
  const { theme, themeName } = useTheme();
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const open = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  const [featured, ...rest] = articles;
  const subFeatured = rest.slice(0, 3);
  const sideList = rest.slice(3);

  const sideTextColor = themeName === 'dark' ? '#E8EEF8' : '#14213D';

  return (
    <section id="news" className="relative overflow-hidden px-4 py-20 md:px-10 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            themeName === 'dark'
              ? 'linear-gradient(90deg, rgba(17,29,59,0.22) 0%, rgba(11,17,32,0) 35%, rgba(16,35,86,0.18) 100%)'
              : 'linear-gradient(90deg, rgba(209,163,136,0.08) 0%, rgba(248,250,253,0) 45%, rgba(123,199,255,0.1) 100%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="font-heading text-[3.3rem] leading-none md:text-[4.2rem]" style={{ color: theme.text }}>
          {t({ en: 'NEWS', vi: 'TIN TỨC' })}
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-[65fr_35fr]">
          <div className="space-y-4 md:space-y-5">
            {featured ? (
              <FeaturedCard
                article={featured}
                onOpen={open}
                themeName={themeName}
                t={t}
                onDelete={(id) => setDeleteTargetId(id)}
              />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3 md:gap-4">
              {subFeatured.map((article) => (
                <SubFeaturedCard
                  key={article.id}
                  article={article}
                  onOpen={open}
                  themeName={themeName}
                  t={t}
                  onDelete={(id) => setDeleteTargetId(id)}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-0 lg:pt-1">
            {sideList.map((article, index) => {
              const displayTitle = typeof article.title === 'object' ? t(article.title) : article.title;
              const displayAbstract = typeof article.abstract === 'object' ? t(article.abstract) : article.abstract;

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                  className="w-full border-t py-4 text-left md:py-[1.15rem] relative group"
                  style={{
                    borderColor: index === 0 ? 'transparent' : themeName === 'dark' ? 'rgba(168, 179, 207, 0.36)' : 'rgba(20, 33, 61, 0.24)'
                  }}
                >
                  <div className="pr-10 cursor-pointer transition-opacity hover:opacity-85" onClick={() => open(article.url)}>
                    <p className="text-[1.26rem] font-extrabold leading-[1.22] tracking-[-0.005em] md:text-[1.92rem] md:leading-[1.18]" style={{ color: sideTextColor }}>
                      {displayTitle}
                    </p>
                    <p className="mt-2.5 text-[0.95rem] leading-relaxed md:text-[1.01rem]" style={{ color: theme.secondary }}>
                      {(displayAbstract || '').length > 255 ? `${displayAbstract.slice(0, 255)}...` : displayAbstract}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(article.id);
                    }}
                    className="absolute right-0 top-[1.15rem] z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/90 text-white shadow-sm hover:bg-red-700 hover:scale-105 active:scale-95 transition opacity-0 group-hover:opacity-100"
                    title={t({ en: 'Delete Article', vi: 'Xóa bài viết' })}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16M10 11v6" />
                    </svg>
                  </button>
                </motion.div>
              );
            })}
          </aside>
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onDelete={async () => {
          if (deleteTargetId !== null) {
            await onDelete(deleteTargetId);
          }
        }}
      />
    </section>
  );
}
