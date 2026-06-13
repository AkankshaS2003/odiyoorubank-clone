import React from 'react';
import { Contact } from '../components/Contact';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Contact />
      </div>
    </div>
  );
};
