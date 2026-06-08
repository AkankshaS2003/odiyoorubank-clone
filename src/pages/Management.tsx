import React from 'react';
import { ArrowLeft, Users, Shield, Award, Quote } from 'lucide-react';

interface ManagementProps {
  setCurrentTab: (tab: string) => void;
}

interface Director {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export const Management: React.FC<ManagementProps> = ({ setCurrentTab }) => {
  const handleBackToHome = () => {
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const directors: Director[] = [
    {
      name: 'Sri. Suresh Rai A',
      role: 'President',
      image: '/gallery/president.jpg',
      bio: 'Sri. Suresh Rai serves as the President of the organization and provides strategic leadership in guiding its vision, growth, and overall development. With extensive experience in administration, business management, and organizational planning, he plays a key role in strengthening governance, promoting innovation, and ensuring sustainable progress. As President, he is responsible for fostering stakeholder relationships, supporting policy decisions, and leading initiatives that contribute to the organization\'s long-term success and community impact. His leadership reflects a commitment to excellence, integrity, and effective decision-making.',
    },
    {
      name: 'Sri. Lingappa Gowda P',
      role: 'Vice President',
      image: '/gallery/vicepresident.jpg',
      bio: 'Sri. Lingappa Gowda P serves as the Vice President, offering valuable support in executive administration and strategic implementation. With deep expertise in collaborative governance and community engagement, he helps coordinate board policies and facilitates active communication among team members and stakeholders. His dedicated guidance assists in driving growth and ensuring the smooth operation of organizational programs.',
    },
    {
      name: 'Sri Dayananda Shetty',
      role: 'CEO',
      image: '/gallery/CEO.jpg',
      bio: 'Sri Dayananda Shetty, as the Chief Executive Officer, leads the executive management team and oversees all operational, financial, and administrative functions of the society. With a strong background in financial systems and cooperative operations, he ensures the execution of strategic plans while maintaining high operational efficiency and regulatory compliance. His vision focuses on customer-centric growth and technological integration.',
    },
    {
      name: 'Sri. Uggappa Shetty',
      role: 'Director',
      image: '/gallery/Director1.jpg',
      bio: 'Sri. Uggappa Shetty brings valuable governance experience and strategic insight to the Board of Directors. He actively supports administrative reviews and contributes to key policy formulations that steer the society toward sustainable community development and financial success.',
    },
    {
      name: 'Sri Jayaprakash N.',
      role: 'Director',
      image: '/gallery/Director2.jpg',
      bio: 'Sri Jayaprakash N. utilizes his professional background to guide organizational governance and risk assessment. He is committed to promoting cooperative principles, ensuring financial stability, and supporting initiatives that enhance member services and community empowerment.',
    },
    {
      name: 'Sri Somappa Naik K.',
      role: 'Director',
      image: '/gallery/Director3.jpg',
      bio: 'Sri Somappa Naik K. offers strong leadership in community outreach and local welfare initiatives. His role on the board helps align the society\'s goals with the social development needs of the community, driving inclusive growth and local trust.',
    },
    {
      name: 'Sri Monappa Poojari',
      role: 'Director',
      image: '/gallery/Director4.jpg',
      bio: 'Sri Monappa Poojari contributes significant operational expertise and oversight to the board. His focus remains on optimizing service delivery channels and implementing programs that foster active participation and financial empowerment among members.',
    },
    {
      name: 'Sri Ganapathi Bhat S.',
      role: 'Director',
      image: '/gallery/Director5.jpg',
      bio: 'Sri Ganapathi Bhat S. provides valuable advisory support on regulatory compliance and operational strategies. He works to ensure transparent governance practices, helping build strong stakeholder relations and maintaining high standards of financial ethics.',
    },
    {
      name: 'Smt. Sharadamani Rai',
      role: 'Director',
      image: '/gallery/Director6.jpg',
      bio: 'Smt. Sharadamani Rai brings a dedicated focus on women\'s empowerment, social responsibility, and inclusive growth to the board. She plays an active role in driving community development programs and ensuring equitable opportunities for all members.',
    },
    {
      name: 'Sri. Lokanath Shetty',
      role: 'Director',
      image: '/gallery/Director7.jpg',
      bio: 'Sri. Lokanath Shetty combines extensive business experience with a passion for cooperative development. He guides the board in identifying new growth avenues and optimizing capital deployment to achieve long-term institutional progress.',
    },
    {
      name: 'Sri. Tharanath Shetty',
      role: 'Director',
      image: '/gallery/Director8.jpg',
      bio: 'Sri. Tharanath Shetty utilizes his deep expertise in management and community leadership to strengthen the society\'s operational framework. He is dedicated to high-quality service standards and robust stakeholder engagement.',
    },
    {
      name: 'Sri. Ganesh Attavara',
      role: 'Director',
      image: '/gallery/Director9.jpg',
      bio: 'Sri. Ganesh Attavara focuses on driving innovation and modernization within the society. His strategic guidance supports digital adaptation, process efficiency, and the development of member-focused financial solutions.',
    },
    {
      name: 'Sri. Venugopala Marla',
      role: 'Director',
      image: '/gallery/Director10.jpg',
      bio: 'Sri. Venugopala Marla brings a wealth of financial knowledge and strategic management skills to the board. He contributes significantly to fiscal planning, risk management, and the enhancement of operational transparency.',
    },
    {
      name: 'Smt. Saritha Ashok',
      role: 'Director',
      image: '/gallery/Director11.jpg',
      bio: 'Smt. Saritha Ashok is an advocate for socio-economic development and collaborative leadership. She actively participates in shaping welfare schemes and member-centric programs that strengthen the cooperative movement.',
    },
    {
      name: 'Sri. Ashok Kumar U S',
      role: 'Director',
      image: '/gallery/Director12.jpg',
      bio: 'Sri. Ashok Kumar U S provides extensive administrative insights and strategic direction to the society. His dedication lies in building a resilient governance structure and fostering long-term value for all cooperative members.',
    },
  ];
  return (
    <section className="bg-slate-50 min-h-screen pb-20">
      {/* 1. Widescreen Hero Section with a Random Image Background & Back to Home Button & Centered Title */}
      <div className="relative h-[240px] sm:h-[320px] w-full overflow-hidden flex items-center justify-center p-6 sm:p-8">
        {/* Background image */}
        <img
          src="/about_hero1.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.3] scale-105"
        />

        {/* Blue color overlay matching the user's reference theme */}
        <div className="absolute inset-0 bg-[#0A315C]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A315C]/90 via-[#0A315C]/50 to-transparent"></div>

        {/* Top Left: Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none backdrop-blur-xs transform active:scale-95 cursor-pointer"
          title="Back to Home"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-white" />
          <span>Back to Home</span>
        </button>

        {/* Horizontal & Vertical Center: Hero Title Overlay & Breadcrumb */}
        <div className="relative z-10 text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-heading uppercase drop-shadow-md">
            Management Team
          </h1>
          <p className="text-slate-350 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Home • Management
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* 2. Highlight Card for Intro Paragraph */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl max-w-4xl mx-auto text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ED7F1E] to-[#0A315C]"></div>

          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#0A315C]/10 rounded-full text-[#0A315C]">
              <Users className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A315C] mb-4">
            Board of Directors
          </h2>

          <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-semibold italic">
            "We, Odiyoor Sree Vividhodesha Souharda Sahakari Sanga has an efficient and experienced team of Board of Directors, to assist and guide the entire society."
          </p>
        </div>        {/* 3. Grid of Directors Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-8">
          {directors.map((director, index) => {
            const isExecutive = director.role === 'President' || director.role === 'Vice President' || director.role === 'CEO';
            return (
              <div
                key={index}
                className="flip-card w-full h-[420px] sm:h-[450px] group cursor-pointer"
              >
                <div className="flip-card-inner">
                  {/* Front Side */}
                  <div className="flip-card-front bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md flex flex-col h-full">
                    {/* Image Section with hover zooms and overlays */}
                    <div className="relative pt-[115%] w-full overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={director.image.trim()}
                        alt={director.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-95"
                        loading="lazy"
                      />
                      {/* Decorative badge overlay for primary executives */}
                      {isExecutive && (
                        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-[#ED7F1E] to-[#e66c00] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md flex items-center space-x-1">
                          {director.role === 'CEO' ? <Shield className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                          <span>{director.role}</span>
                        </div>
                      )}

                      {/* Elegant bottom gradient shade on picture */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-30 group-hover:opacity-15 transition-opacity duration-500"></div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between text-center relative bg-white">
                      {/* Top line accent only visible on hover */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-[#0A315C] transition-all duration-500 group-hover:w-3/4 rounded-full"></div>

                      <div className="space-y-1.5 mt-2">
                        <h4 className="text-base font-bold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#0A315C]">
                          {director.name}
                        </h4>
                        <p className={`text-xs font-extrabold uppercase tracking-widest ${isExecutive ? 'text-[#ED7F1E]' : 'text-slate-500'}`}>
                          {director.role}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Odiyooru Souharda
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="flip-card-back bg-gradient-to-br from-[#0A315C] to-[#051C36] text-white rounded-3xl overflow-hidden shadow-xl p-6 border border-[#0A315C]/80 flex flex-col justify-between h-full relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-[#ED7F1E]/10 rounded-full blur-xl pointer-events-none"></div>

                    {/* Back Header */}
                    <div className="space-y-1 relative z-10 shrink-0">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isExecutive ? 'bg-[#ED7F1E]/20 text-[#ED7F1E]' : 'bg-white/10 text-slate-350'}`}>
                          {director.role}
                        </span>
                        <Quote className="h-6 w-6 text-[#ED7F1E]/30 shrink-0" />
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight mt-3">
                        {director.name}
                      </h4>
                    </div>

                    {/* Biography / Information Section */}
                    <div className="flex-grow my-4 overflow-y-auto pr-1 relative z-10 custom-scrollbar flex items-start">
                      <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed font-normal text-left italic">
                        "{director.bio}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
