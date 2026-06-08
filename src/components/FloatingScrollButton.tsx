import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingScrollButton: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNearTop = scrollY < 300;

  const handleClick = () => {
    if (isNearTop) {
      // Scroll smoothly to bottom of the page
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      // Scroll smoothly back to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        className="h-12 w-12 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-xl shadow-primary/20 border border-white/10 cursor-pointer focus:outline-none"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0px 10px 25px rgba(0, 91, 172, 0.35)"
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        title={isNearTop ? "Scroll to Bottom" : "Scroll to Top"}
      >
        <motion.div
          key={isNearTop ? "down" : "up"}
          initial={{ rotate: isNearTop ? -180 : 180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isNearTop ? (
            <ArrowDown className="h-5 w-5 stroke-[2.5]" />
          ) : (
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};
