'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AnimatedTextProps {
  text: string;
  delay?: number;
}

export default function AnimatedText({ text, delay = 0 }: AnimatedTextProps) {
  const letters = useMemo(() => text.split(''), [text]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="inline-block"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}