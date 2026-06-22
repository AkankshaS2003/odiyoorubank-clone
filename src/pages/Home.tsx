import React from 'react';
import { Hero } from '../components/Hero';
import { HomeAboutUsSection } from '../components/HomeAboutUsSection';
import { Products } from '../components/Products';
import { HowToJoin } from '../components/HowToJoin';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Membership } from '../components/Membership';

import { News } from '../components/News';
import { Contact } from '../components/Contact';
import { CommunityImpact } from '../components/CommunityImpact';
import { FAQ } from '../components/FAQ';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentTab }) => {
  return (
    <div className="space-y-0">
      
      {/* 1. Hero banner with live statistic counters */}
      <Hero setCurrentTab={setCurrentTab} />

      {/* New About Us section with logo, paragraph, and Know More button */}
      <HomeAboutUsSection setCurrentTab={setCurrentTab} />

      {/* 2. Banking Products tabs (FD, RD, Gold Loans cards) */}
      <div id="products-section">
        <Products setCurrentTab={setCurrentTab} />
      </div>

      {/* Replaced DigitalBanking with HowToJoin in a different position */}

      {/* 4. Core corporate pillars (Trusted cooperative, swift processing) */}
      <WhyChooseUs />

      {/* 5. Co-ownership shareholder membership rewards */}
      <Membership setCurrentTab={setCurrentTab} />

      {/* 5b. How to Join Process */}
      <HowToJoin />



      {/* 7. Society Announcements journal and awareness drives */}
      <News />

      {/* 8. Downloadable banking PDF templates */}
      <CommunityImpact />

      {/* 9. Accordion FAQs */}
      <FAQ />

      {/* 10. Contact form & operational coordinates */}
      <div id="contact-section">
        <Contact />
      </div>

    </div>
  );
};
