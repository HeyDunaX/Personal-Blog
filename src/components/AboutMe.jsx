import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutMe({ mouse, motionEnabled }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const containerRef = useRef(null);
  
  // Track scroll relative to element container for parallax scroll marquee
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const marqueeX = useTransform(scrollYProgress, [0, 1], [400, -900]);

  // Avatar parallax slide-in from left (moves right to center, opposite of marquee)
  const avatarX = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? -180 : 0, 0]);
  const avatarOpacity = useTransform(scrollYProgress, [0.1, 0.4], [isDesktop ? 0 : 1, 1]);

  return (
    <section ref={containerRef} id="about" className="relative overflow-hidden px-4 py-24 md:px-10">
      <div
        className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full blur-[120px]"
        style={{
          backgroundColor: theme.glowWarm
        }}
      />

      <div className="pointer-events-none absolute left-0 top-16 w-full overflow-hidden">
        <motion.p
          className="whitespace-nowrap font-heading text-3xl md:text-5xl"
          style={{
            color: theme.marquee,
            x: marqueeX
          }}
        >
          {'LONG NGUYEN '.repeat(15)}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[360px_1fr] lg:gap-10"
      >
        {/* Left Column: Portrait slides in from the left and fades in as you scroll */}
        <motion.div
          style={{
            x: avatarX,
            opacity: avatarOpacity,
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 86%'
          }}
          className="mx-auto z-10"
        >
          <div
            style={{
              transform: motionEnabled
                ? `perspective(1000px) rotateX(${-mouse.ny * 2.5}deg) rotateY(${mouse.nx * 2.5}deg)`
                : undefined
            }}
          >
            <img
              src="/Long-Raw-Photoroom.png"
              alt="Long Nguyen portrait"
              className="h-[350px] w-[240px] md:h-[350px] md:w-[240px] lg:h-[440px] lg:w-[300px] object-contain"
            />
          </div>
        </motion.div>

        <div className="text-center md:text-left">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl" style={{ color: theme.text }}>
            {t({ en: 'ABOUT ME', vi: 'VỀ TÔI' })}
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed md:text-base lg:text-lg mx-auto md:mx-0" style={{ color: theme.text }}>
            {t({
              en: "Hi, I'm Nguyen Song Thien Long, an undergraduate AI researcher passionate about Natural Language Processing, Information Retrieval, Large Language Models, and Retrieval-Augmented Generation (RAG). I enjoy transforming research ideas into practical systems and building reliable AI for Vietnamese and other low-resource languages.",
              vi: 'Xin chào, tôi là Nguyễn Song Thiên Long, một nhà nghiên cứu AI hệ đại học có niềm đam mê với Xử lý Ngôn ngữ Tự nhiên, Truy xuất Thông tin, Mô hình Ngôn ngữ Lớn và Tạo lập Tăng cường Truy xuất (RAG). Tôi thích chuyển đổi ý tưởng nghiên cứu thành hệ thống thực tế và xây dựng AI đáng tin cậy cho tiếng Việt cùng các ngôn ngữ ít tài nguyên khác.'
            })}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
