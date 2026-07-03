import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useDeviceMotionSafe } from './hooks/useDeviceMotionSafe';
import { useMouseParallax } from './hooks/useMouseParallax';

const News = lazy(() => import('./components/News'));
const AdminModal = lazy(() => import('./components/AdminModal'));

const seedArticles = [
  {
    id: 'a1',
    title: 'From College Thesis to Q1 Publication',
    abstract: 'Research by lecturers and students from Ho Chi Minh City University of Technology opens up new ways to improve the reliability of large language models in multiple-choice question tasks.',
    date: '2026-06-20',
    url: 'https://example.com/rag-vietnamese',
    coverImage: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'a2',
    title: 'HCMUT student co-authors over 20 international AI publications',
    abstract: 'From Nguyen Song Thien Long (2005), a junior in Computer Science at HCMUT, research began not with grand ideas but with small tasks: reading literature, processing data, and revising papers.',
    date: '2026-06-12',
    url: 'https://example.com/low-resource-nlp',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a3',
    title: "Listening to a youth member's answer to the question: What if my life is never meant to shine?",
    abstract: 'While social media is still wrestling with the question, What if my life is never meant to shine?, outstanding Youth Union members have found their own answers through their journey of community service.',
    date: '2026-06-05',
    url: 'https://example.com/hybrid-ranking',
    coverImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a4',
    title: "Expanding foreign language playgrounds for youth",
    abstract: 'At the Forum Youth Voices - Youth Union Actions, many participants emphasized that instead of just learning theory, young people should be immersed in environments where they can use foreign languages regularly through clubs and international exchange programs.',
    date: '2026-05-28',
    url: 'https://example.com/prompt-eval',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a5',
    title: 'Placing deep trust and high expectations',
    abstract: 'Looking forward to the national festival, young people across the country have expressed their deep trust and high expectations. They hope each ballot will select virtuous, talented, and public-oriented representatives who can promptly deliver breakthrough policies.',
    date: '2026-05-20',
    url: 'https://example.com/academic-search',
    coverImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a6',
    title: "The journey of a Gen Z from the 'coconut land' to the vast ocean of AI",
    abstract: "Nguyen Song Thien Long, an outstanding recipient of the Student of 5 Merits title, has carved out an impressive journey from a village school to the world of computer science and artificial intelligence.",
    date: '2026-05-10',
    url: 'https://example.com/transformer-adaptation',
    coverImage: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a7',
    title: 'HCMUT student researches AI for cultural and language preservation',
    abstract: 'Nguyen Song Thien Long, a third-year Computer Science student at Ho Chi Minh City University of Technology, is the author of over 20 scientific works published at prestigious conferences and journals.',
    date: '2026-05-03',
    url: 'https://example.com/cultural-language-ai',
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'a8',
    title: 'Ready to empower international scientific publications',
    abstract: 'Leading universities and scientists are ready to accompany and provide comprehensive support to help students progress faster and stay on the right track toward international scientific publication.',
    date: '2026-04-28',
    url: 'https://example.com/international-publication-support',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'
  }
];

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

  // Load initial articles from localStorage, default to sorted seedArticles
  const [articles, setArticles] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('long_blog_articles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
          console.error('Failed to parse saved articles:', e);
        }
      }
    }
    return [...seedArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const [adminOpen, setAdminOpen] = useState(false);

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
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const mockScrapeImport = async (url, customDate) => {
    await new Promise((resolve) => setTimeout(resolve, 850));

    const hostname = (() => {
      try {
        return new URL(url).hostname.replace('www.', '');
      } catch {
        return 'external-source';
      }
    })();

    // Attempt to extract date from URL, fallback to user date or today
    const dateMatch = url.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    const parsedDate = dateMatch 
      ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
      : customDate || new Date().toISOString().slice(0, 10);

    const entry = {
      id: crypto.randomUUID(),
      title: `Imported: Insights from ${hostname}`,
      abstract:
        'Auto-generated abstract from mocked scraping pipeline. This simulates title and summary extraction from an external article URL.',
      date: parsedDate,
      url,
      coverImage: coverPool[Math.floor(Math.random() * coverPool.length)]
    };

    setArticles((prev) => {
      const updated = [entry, ...prev];
      // Sort articles: newest to oldest
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
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
            <News articles={articles} />
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
