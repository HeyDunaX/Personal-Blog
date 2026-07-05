import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useDeviceMotionSafe } from './hooks/useDeviceMotionSafe';
import { useMouseParallax } from './hooks/useMouseParallax';
import { isSupabaseConfigured, getArticlesFromDb, insertArticleToDb, deleteArticleFromDb } from './utils/supabase';

const News = lazy(() => import('./components/News'));
const AdminModal = lazy(() => import('./components/AdminModal'));

const seedArticles = [];

const translateText = async (text, targetLang) => {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(x => x[0]).join('');
    }
    return text;
  } catch (error) {
    console.error(`Translation error to ${targetLang}:`, error);
    return text;
  }
};

const coverPool = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80'
];

function AppShell() {
  const { theme } = useTheme();
  const motionEnabled = useDeviceMotionSafe();
  const mouse = useMouseParallax(motionEnabled);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Load initial articles from localStorage, default to sorted seedArticles
  const [articles, setArticles] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('long_blog_articles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Filter out the old seed articles ('a1' to 'a8')
          const filtered = parsed.filter(a => !['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'].includes(a.id));
          return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
          console.error('Failed to parse saved articles:', e);
        }
      }
    }
    return [];
  });

  const [adminOpen, setAdminOpen] = useState(false);

  // Load articles from Supabase on mount (fallback to localStorage if not configured)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      getArticlesFromDb()
        .then((dbArticles) => {
          setArticles(dbArticles);
        })
        .catch((err) => {
          console.error('Failed to load articles from Supabase, using localStorage fallback:', err);
        });
    }
  }, []);

  // Persist articles in localStorage when state changes
  useEffect(() => {
    localStorage.setItem('long_blog_articles', JSON.stringify(articles));
  }, [articles]);

  const aboutRef = useRef(null);
  const newsRef = useRef(null);

  const pageStyle = useMemo(
    () => ({
      backgroundColor: theme.background,
      color: theme.text
    }),
    [theme.background, theme.text]
  );

  const smoothScrollTo = (ref) => {
    if (!ref.current) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(ref.current);
    } else {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const mockScrapeImport = async (url, customDate) => {
    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (result.status === 'success') {
        const { title, description, image, date } = result.data;

        // Determine date.
        // 1. Try date from Microlink.
        // 2. Try date from URL path.
        // 3. Try customDate (user-selected in UI).
        // 4. Default to today's date.
        let parsedDate = '';
        if (date) {
          try {
            parsedDate = new Date(date).toISOString().slice(0, 10);
          } catch {
            // Ignore date parsing error
          }
        }
        
        if (!parsedDate) {
          const dateMatch = url.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
          parsedDate = dateMatch 
            ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
            : customDate || new Date().toISOString().slice(0, 10);
        }

        const rawTitle = title || `Imported from ${new URL(url).hostname.replace('www.', '')}`;
        const rawAbstract = description || 'No abstract available.';

        // Perform translations in parallel
        const [titleEn, titleVi, abstractEn, abstractVi] = await Promise.all([
          translateText(rawTitle, 'en'),
          translateText(rawTitle, 'vi'),
          translateText(rawAbstract, 'en'),
          translateText(rawAbstract, 'vi')
        ]);

        const entry = {
          id: crypto.randomUUID(),
          title: {
            en: titleEn,
            vi: titleVi
          },
          abstract: {
            en: abstractEn,
            vi: abstractVi
          },
          date: parsedDate,
          url,
          coverImage: image?.url || (typeof image === 'string' ? image : coverPool[Math.floor(Math.random() * coverPool.length)])
        };

        if (isSupabaseConfigured()) {
          await insertArticleToDb(entry);
        }

        setArticles((prev) => {
          const updated = [entry, ...prev];
          return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
        });
      } else {
        throw new Error(result.message || 'Microlink API failed');
      }
    } catch (error) {
      console.error('Failed to scrape metadata:', error);
      
      // Fallback behavior if Microlink fails (like connection or parsing issues)
      const hostname = (() => {
        try {
          return new URL(url).hostname.replace('www.', '');
        } catch {
          return 'external-source';
        }
      })();

      const dateMatch = url.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
      const parsedDate = dateMatch 
        ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
        : customDate || new Date().toISOString().slice(0, 10);

      const entry = {
        id: crypto.randomUUID(),
        title: {
          en: `Imported: Insights from ${hostname}`,
          vi: `Đã nhập: Tin tức từ ${hostname}`
        },
        abstract: {
          en: 'Failed to retrieve article description automatically.',
          vi: 'Không thể tự động lấy mô tả bài viết.'
        },
        date: parsedDate,
        url,
        coverImage: coverPool[Math.floor(Math.random() * coverPool.length)]
      };

      if (isSupabaseConfigured()) {
        await insertArticleToDb(entry);
      }

      setArticles((prev) => {
        const updated = [entry, ...prev];
        return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
      });
    }
  };

  const handleDeleteArticle = async (id) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteArticleFromDb(id);
      } catch (dbErr) {
        console.error('Failed to delete from Supabase database:', dbErr);
        throw dbErr;
      }
    }
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden font-body" style={pageStyle}>
      <Navbar
        onAboutClick={() => smoothScrollTo(aboutRef)}
        onNewsClick={() => smoothScrollTo(newsRef)}
        onAdminOpen={() => setAdminOpen(true)}
      />

      <main className="relative z-[2]">
        <div>
          <Hero mouse={mouse} motionEnabled={motionEnabled} onReadMe={() => smoothScrollTo(aboutRef)} />
        </div>

        <div ref={aboutRef}>
          <AboutMe mouse={mouse} motionEnabled={motionEnabled} />
        </div>

        <div ref={newsRef}>
          <Suspense fallback={<div className="px-4 py-24 md:px-10" />}>
            <News articles={articles} onDelete={handleDeleteArticle} />
          </Suspense>
        </div>
      </main>

      <AnimatePresence>
        {adminOpen ? (
          <Suspense fallback={null}>
            <AdminModal
              open={adminOpen}
              onClose={() => setAdminOpen(false)}
              onImport={mockScrapeImport}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </ThemeProvider>
  );
}
