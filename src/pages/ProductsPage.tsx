import React from 'react';
import { Products } from '../components/Products';
import { DetailedRates } from '../components/DetailedRates';

export const ProductsPage: React.FC = () => {
  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <Products />
      <DetailedRates />
    </div>
  );
};
