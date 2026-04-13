import React, { useEffect, useRef } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

export default function CountUp({ to, prefix = '', suffix = '', duration = 1.2, className = '' }) {
  const val     = useMotionValue(0);
  const display = useTransform(val, v => `${prefix}${Math.round(v).toLocaleString('en-IN')}${suffix}`);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        animate(val, to, { duration, ease: 'easeOut' });
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
