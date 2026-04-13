import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenefitsSection from './components/BenefitsSection';
import SocialProofSection from './components/SocialProofSection';
import CTASection from './components/CTASection';

const ORDER = ['hero', 'features', 'benefits', 'reviews', 'cta'];
const SECTIONS = {
  hero: HeroSection,
  features: FeaturesSection,
  benefits: BenefitsSection,
  reviews: SocialProofSection,
  cta: CTASection,
};

export default function LandingPage() {
  const [active, setActive] = useState('hero');
  const [dir, setDir] = useState(1);

  const handleChange = (id) => {
    if (id === active) return;
    setDir(ORDER.indexOf(id) > ORDER.indexOf(active) ? 1 : -1);
    setActive(id);
  };

  const ActiveSection = SECTIONS[active];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-950 font-sans antialiased">
      {/* Navbar — always visible, never scrolls */}
      <Navbar activeSection={active} onSectionChange={handleChange} />

      {/* Content — fills remaining height, each section scrolls internally if needed */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            variants={{
              enter: (d) => ({ x: d > 0 ? '3%' : '-3%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d) => ({ x: d > 0 ? '-3%' : '3%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 overflow-y-auto"
          >
            <ActiveSection />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}