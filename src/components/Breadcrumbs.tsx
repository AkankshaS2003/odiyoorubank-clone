import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentTab, setCurrentTab }) => {
  if (currentTab === 'home') return null;

  // Since we have a flat navigation structure (tabs), the breadcrumb will usually just be Home > Current Tab
  const text = currentTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
      <ol className="flex items-center space-x-2 text-sm text-gray-500 max-w-7xl mx-auto">
        <li>
          <button 
            onClick={() => setCurrentTab('home')} 
            className="hover:text-blue-600 flex items-center transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </button>
        </li>
        
        <motion.li 
          className="flex items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-medium" aria-current="page">
            {text}
          </span>
        </motion.li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
