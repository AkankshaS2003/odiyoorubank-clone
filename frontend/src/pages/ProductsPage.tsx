import React from 'react';
import { Products } from '../components/Products';
import { DetailedRates } from '../components/DetailedRates';

export const ProductsPage: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Products setCurrentTab={setCurrentTab} />
      <DetailedRates />
    </div>
  );
};
