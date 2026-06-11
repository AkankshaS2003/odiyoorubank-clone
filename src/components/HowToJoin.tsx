import React from 'react';
import { Coins, ShieldCheck, MessageSquare, MoreHorizontal } from 'lucide-react';

export const HowToJoin: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Heading */}
          <div className="md:col-span-4 space-y-6 lg:pr-4 pt-4 md:pt-12">
            <h2 className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl font-black text-[#1e293b] leading-[1.15]">
              How to Join <br className="hidden md:block" /> the Society <br className="hidden md:block" /> as a Member
            </h2>
            <p className="text-slate-500 text-[15px] sm:text-base leading-relaxed">
              For obtaining application for membership of Odiyooru Souharda Cooperative Society Ltd.
            </p>
          </div>

          {/* Center Column: Mobile Mockup */}
          <div className="md:col-span-4 flex justify-center py-10 relative">
            <div className="relative w-[240px] h-[480px] bg-slate-800 rounded-[45px] p-2.5 shadow-2xl border-[5px] border-slate-200 shrink-0 mt-4">
              {/* Screen */}
              <div className="w-full h-full bg-[#0d3f75] rounded-[34px] overflow-hidden relative shadow-inner">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl z-20"></div>
                
                {/* Logo placed big and on top */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 bg-white p-2 w-24 h-24 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-center">
                  <img src="/logo-bg.png" alt="OSCSL Logo" className="w-full h-full object-contain" />
                </div>

                {/* Abstract UI lines on screen */}
                <div className="absolute bottom-16 left-6 right-6 space-y-4 z-10 opacity-30">
                  <div className="h-2.5 bg-white rounded-full w-full"></div>
                  <div className="h-2.5 bg-white rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-white rounded-full w-4/6"></div>
                  <div className="h-2.5 bg-white rounded-full w-full"></div>
                  <div className="h-2.5 bg-white rounded-full w-3/4"></div>
                </div>
              </div>

              {/* Floating icons outside the phone */}
              
              {/* Left Top Coin/Link */}
              <div className="absolute top-1/2 -translate-y-10 -left-6 w-12 h-12 bg-amber-500 rounded-full shadow-lg flex items-center justify-center z-30">
                <Coins className="text-white w-5 h-5" />
              </div>

              {/* Left Bottom Shield */}
              <div className="absolute bottom-16 -left-8 w-16 h-16 bg-[#3b82f6] rounded-2xl shadow-xl flex items-center justify-center z-30 transform -rotate-6">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>

              {/* Right Top Chat Bubble */}
              <div className="absolute top-1/2 -translate-y-16 -right-6 w-14 h-10 bg-amber-500 rounded-xl rounded-bl-sm shadow-lg flex items-center justify-center z-30">
                <MoreHorizontal className="text-white w-5 h-5" />
              </div>
              
              {/* Right Bottom Mini Chat */}
              <div className="absolute bottom-1/3 -right-6 w-12 h-8 bg-white rounded-lg rounded-bl-sm shadow-md border border-slate-100 flex items-center justify-center z-30">
                <MoreHorizontal className="text-emerald-500 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Stepper */}
          <div className="md:col-span-4 pl-2 sm:pl-8 lg:pl-12 py-2">
            <div className="relative space-y-8 lg:space-y-10">
              {/* Vertical line */}
              <div className="absolute top-6 bottom-6 left-[23px] sm:left-[27px] w-[2px] bg-slate-200 z-0"></div>

              {/* Step 1 */}
              <div className="relative flex items-start group cursor-pointer">
                <div className="absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-slate-200 bg-white flex items-center justify-center text-slate-400 font-bold text-[15px] z-10 shrink-0 transition-colors duration-300 group-hover:bg-[#0A315C] group-hover:text-white group-hover:border-[#0A315C] group-hover:shadow-[0_0_15px_rgba(10,49,92,0.4)]">
                  01
                </div>
                <div className="bg-slate-50/80 p-5 rounded-2xl ml-16 sm:ml-20 w-full border border-slate-100 transition-all duration-300 group-hover:shadow-md group-hover:bg-white">
                  <h3 className="font-bold text-slate-800 text-[17px] mb-2">Get the Application Form</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">
                    Visit any branch of the Society to get the application form. Have it recommended by an existing member.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start group cursor-pointer">
                <div className="absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-slate-200 bg-white flex items-center justify-center text-slate-400 font-bold text-[15px] z-10 shrink-0 transition-colors duration-300 group-hover:bg-[#0A315C] group-hover:text-white group-hover:border-[#0A315C] group-hover:shadow-[0_0_15px_rgba(10,49,92,0.4)]">
                  02
                </div>
                <div className="bg-slate-50/80 p-5 rounded-2xl ml-16 sm:ml-20 w-full border border-slate-100 transition-all duration-300 group-hover:shadow-md group-hover:bg-white">
                  <h3 className="font-bold text-slate-800 text-[17px] mb-2">Prepare Your Documents</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">
                    Fill out the form and gather your KYC documents, like your Aadhaar Card, along with a share application for at least ₹100.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start group cursor-pointer">
                <div className="absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-slate-200 bg-white flex items-center justify-center text-slate-400 font-bold text-[15px] z-10 shrink-0 transition-colors duration-300 group-hover:bg-[#0A315C] group-hover:text-white group-hover:border-[#0A315C] group-hover:shadow-[0_0_15px_rgba(10,49,92,0.4)]">
                  03
                </div>
                <div className="bg-slate-50/80 p-5 rounded-2xl ml-16 sm:ml-20 w-full border border-slate-100 transition-all duration-300 group-hover:shadow-md group-hover:bg-white">
                  <h3 className="font-bold text-slate-800 text-[17px] mb-2">Submit Your Application</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">
                    Turn in your completed form and documents at a branch. If eligible, you will receive one share and can apply.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
