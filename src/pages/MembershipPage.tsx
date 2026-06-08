import React from 'react';
import { Membership } from '../components/Membership';

interface MembershipPageProps {
  setCurrentTab: (tab: string) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <Membership setCurrentTab={setCurrentTab} />
    </div>
  );
};
