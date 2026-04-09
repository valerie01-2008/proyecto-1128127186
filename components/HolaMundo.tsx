'use client';

import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function HolaMundo({ title, subtitle, description }: HolaMundoProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="text-center max-w-4xl">
        {/* Título con animación */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-6xl md:text-8xl font-bold text-white mb-6 font-display"
        >
          <AnimatedText text={title} delay={0.5} />
        </motion.h1>

        {/* Subtítulo con fade-in retardado */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="text-2xl md:text-3xl text-cyan-400 mb-8 font-secondary"
        >
          {subtitle}
        </motion.h2>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2, ease: 'easeOut' }}
          className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>

        {/* Línea separadora animada */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 2.5, ease: 'easeOut' }}
          className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full origin-center"
        />
      </div>
    </div>
  );
}