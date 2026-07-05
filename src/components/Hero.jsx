import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ParticleCanvas from './ParticleCanvas';

export default function Hero({ mouse, motionEnabled, onReadMe }) {
  const { t } = useLanguage();
  const { theme, themeName } = useTheme();

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rotateY = motionEnabled ? mouse.nx * 3 : 0;
  const rotateX = motionEnabled ? -mouse.ny * 2.5 : 0;
  const rotateZ = 0;
  const tx = motionEnabled ? mouse.nx * 5 : 0;
  const ty = motionEnabled ? mouse.ny * 4 : 0;
  const avatarLift = -4;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 md:px-10 flex flex-col justify-center" id="hero">
      <ParticleCanvas enabled={true} mouse={mouse} themeName={themeName} />

      <div
        className="pointer-events-none absolute -left-12 top-28 h-64 w-64 rounded-full blur-[120px]"
        style={{ backgroundColor: theme.glowWarm }}
      />
      <div
        className="pointer-events-none absolute right-8 top-40 h-72 w-72 rounded-full blur-[140px]"
        style={{ backgroundColor: theme.glowCharacter }}
      />

      {/* DESKTOP LAYOUT (md screen and above) */}
      <div className="relative z-10 mx-auto hidden w-full max-w-7xl items-center justify-between md:flex md:min-h-[75vh]">
        {/* Background text: absolute positioned near the top, above avatar's head */}
        <div className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 w-full select-none text-center z-0">
          <h1 
            className="font-heading font-black tracking-tighter uppercase leading-none" 
            style={{ 
              fontSize: '13vw', 
              color: theme.heroTitle, 
              opacity: themeName === 'dark' ? 0.95 : 0.85 
            }}
          >
            HI, I&apos;M LONG
          </h1>
        </div>

        {/* Left column: Paragraph info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-20 w-[26%] md:w-[28%] max-w-[340px] mt-24 self-center"
        >
          <p className="text-xs leading-relaxed lg:text-sm xl:text-base tracking-wide" style={{ color: theme.secondary }}>
            {t({
              en: 'Turning language into intelligent systems. I research Information Retrieval, Large Language Models, and multilingual NLP to make AI more reliable, efficient, and accessible.',
              vi: 'Biến đổi ngôn ngữ thành các hệ thống thông minh. Tôi nghiên cứu về Truy xuất thông tin, Mô hình ngôn ngữ lớn và NLP đa ngôn ngữ nhằm giúp AI đáng tin cậy, hiệu quả và dễ tiếp cận hơn.'
            })}
          </p>
        </motion.div>

        {/* Center column: Outer container handles entry animation, aligned to the bottom */}
        <motion.div
          className="relative mx-auto w-[300px] h-[460px] lg:w-[400px] lg:h-[620px] xl:w-[490px] xl:h-[760px] 2xl:w-[570px] 2xl:h-[880px] z-10 self-end mt-auto -mb-16 lg:-mb-[6.5rem] xl:-mb-28 2xl:-mb-32"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Inner container handles mouse-move 3D tilt */}
          <div
            className="w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 86%',
              transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${tx}px, ${ty}px, 0)`
            }}
          >
            {/* Blue radial glow right behind avatar */}
            <div
              className="pointer-events-none absolute inset-x-8 bottom-8 h-36 rounded-full blur-[90px]"
              style={{
                backgroundColor: theme.glowCharacter,
                opacity: themeName === 'dark' ? 0.72 : 0.5,
                transform: `translate3d(${-tx * 0.3}px, ${-ty * 0.2}px, 0)`
              }}
            />
            <img
              src="/Long-Raw-Photoroom.png"
              alt="Long Nguyen"
              className="relative z-10 h-full w-full object-contain object-bottom"
              style={{
                transform: `translate3d(${tx * 0.22}px, ${avatarLift}px, 0)`,
                filter: themeName === 'dark' ? 'drop-shadow(0 20px 36px rgba(1,45,137,0.45))' : 'drop-shadow(0 16px 28px rgba(20,33,61,0.18))',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)'
              }}
            />
          </div>
        </motion.div>

        {/* Right column: Tilted capsule button */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-20 w-[26%] md:w-[28%] max-w-[340px] flex justify-end mt-24 self-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: -7 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            onClick={onReadMe}
            className="rounded-[32px] px-6 py-3 text-xs md:px-7 md:py-3.5 lg:px-9 lg:py-4.5 lg:text-sm xl:px-10 xl:py-5 xl:text-base font-bold tracking-widest text-white shadow-2xl transition-all duration-300"
            style={{
              transform: 'rotate(-10deg)',
              background: 'linear-gradient(135deg, #2A3C5A 0%, #131D35 100%)',
              border: '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(66, 133, 244, 0.4), 0 12px 30px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4)';
            }}
          >
            {t({ en: 'READ ME', vi: 'ĐỌC TIẾP' })}
          </motion.button>
        </motion.div>
      </div>

      {/* MOBILE LAYOUT (sm and below) */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center md:hidden">
        {/* Title at top */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <h1 className="font-heading text-5xl font-black tracking-tight uppercase" style={{ color: theme.heroTitle }}>
            HI, I&apos;M LONG
          </h1>
        </motion.div>

        {/* Center Avatar with glow */}
        <motion.div
          className="relative h-[410px] w-[260px] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div
            className="pointer-events-none absolute inset-x-4 bottom-4 h-24 rounded-full blur-[80px]"
            style={{
              backgroundColor: theme.glowCharacter,
              opacity: themeName === 'dark' ? 0.72 : 0.5,
            }}
          />
          <img
            src="/Long-Raw-Photoroom.png"
            alt="Long Nguyen"
            className="relative z-10 h-full w-full object-contain object-bottom"
            style={{
              filter: themeName === 'dark' ? 'drop-shadow(0 20px 36px rgba(1,45,137,0.45))' : 'drop-shadow(0 16px 28px rgba(20,33,61,0.18))',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)'
            }}
          />
        </motion.div>

        {/* Description text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 px-4"
        >
          <p className="text-sm md:text-base leading-relaxed max-w-md mx-auto" style={{ color: theme.secondary }}>
            {t({
              en: 'Turning language into intelligent systems. I research Information Retrieval, Large Language Models, and multilingual NLP to make AI more reliable, efficient, and accessible.',
              vi: 'Biến đổi ngôn ngữ thành các hệ thống thông minh. Tôi nghiên cứu về Truy xuất thông tin, Mô hình ngôn ngữ lớn và NLP đa ngôn ngữ nhằm giúp AI đáng tin cậy, hiệu quả và dễ tiếp cận hơn.'
            })}
          </p>
        </motion.div>

        {/* READ ME button (less tilted or straight on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReadMe}
            className="rounded-[32px] px-8 py-4 text-sm font-bold tracking-widest text-white shadow-xl"
            style={{
              transform: 'rotate(-4deg)',
              background: 'linear-gradient(135deg, #2A3C5A 0%, #131D35 100%)',
              border: '2px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            {t({ en: 'READ ME', vi: 'ĐỌC TIẾP' })}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
