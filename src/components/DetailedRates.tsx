import React from 'react';

export const DetailedRates: React.FC = () => {
  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Deposit Schemes Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#0A315C] mb-8 border-b-2 border-slate-100 pb-4">
            Deposit Schemes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3"></span>
                  <strong>Savings bank accounts (S.B A/C)</strong>: 5% p.a
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2"></span>
                  <div>
                    <strong>Recurring Deposit</strong>
                    <ul className="ml-6 mt-2 space-y-1 text-slate-600">
                      <li>• 1 Year - 8.50% p.a.</li>
                      <li>• 2 Years - 8.75% p.a.</li>
                      <li>• 3 Years - 8.75% p.a.</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3"></span>
                  <strong>Sri Ramakrishna Nithya Nidhi Deposit (Pigmy)</strong>: 3% to 3.5% p.a
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3"></span>
                Fixed Deposit (FD)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="min-w-full text-left bg-white text-slate-700 text-sm sm:text-base">
                  <thead className="bg-[#0A315C] text-white">
                    <tr>
                      <th className="py-3 px-6 font-semibold border-b border-slate-300">Term</th>
                      <th className="py-3 px-6 font-semibold border-b border-slate-300 border-l border-slate-400">Annual Rate of Interest*</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-6 border-r border-slate-200">31 to 90 days</td>
                      <td className="py-3 px-6">5.50%</td>
                    </tr>
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="py-3 px-6 border-r border-slate-200">91 days to 180 days</td>
                      <td className="py-3 px-6">6.50%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-6 border-r border-slate-200">181 days to less than 1 year</td>
                      <td className="py-3 px-6">7.00%</td>
                    </tr>
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="py-3 px-6 border-r border-slate-200">1 year and above less than 2 years</td>
                      <td className="py-3 px-6">8.50%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-6 border-r border-slate-200">2 years and above upto 3 years</td>
                      <td className="py-3 px-6">8.75%</td>
                    </tr>
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="py-3 px-6 border-r border-slate-200">42 Months and above upto 60 months <br/><span className="text-xs text-slate-500">(Applicable only for Fixed Deposit, Not applicable for Cash Certificate)</span></td>
                      <td className="py-3 px-6">9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-slate-600 space-y-2">
                <p><strong>* For Senior Citizens</strong> above 60 years of age <strong>0.50%</strong> additional interest on their Fixed Deposit, Cash Certificate and Recurring Deposits.</p>
                <p><strong>* For Indian Army Officers</strong> <strong>0.50%</strong> additional interest on their Fixed Deposit, Cash Certificate and Recurring Deposits.</p>
                <p><strong>* Indian Army Officers and if they are Senior Citizens</strong> above 60 years of age, <strong>1%</strong> additional interest on their Fixed Deposit, Cash Certificate and Recurring Deposits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Facilities Section */}
        <div>
          <h2 className="text-3xl font-bold text-[#0A315C] mb-8 border-b-2 border-slate-100 pb-4">
            Loan Facilities
          </h2>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <ul className="space-y-6 text-slate-700">
              
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div className="w-full">
                  <strong>Jewel Loan</strong> <span className="text-slate-500 text-sm">(Upto Rs.50,00,000/- to an individual)</span>
                  <ul className="ml-6 mt-2 space-y-1 text-slate-600 list-disc">
                    <li>1 Year Loan : 11.50% p.a.</li>
                    <li>3 Months Loan : 12.00% p.a.</li>
                    <li>45 days period : 12.50% p.a.</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Loan on Govt. Securities (NSC/LIC Policy)</strong> : 10.50% p.a.
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div className="w-full">
                  <strong>Loan on new vehicles</strong>
                  <ul className="ml-6 mt-2 space-y-2 text-slate-600 list-disc">
                    <li>New Machinery (Generator, Tractor, Compressor, Tiller, Mixer, JCB etc) : 10.00%</li>
                    <li>Loan on New Vehicles (Four wheelers/Light vehicles and Bus, Lorry other heavy vehicles) : 10.00% p.a</li>
                    <li>Three wheelers : 10.50% p.a</li>
                    <li>Two wheelers : 13.50% p.a</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div className="w-full">
                  <strong>Mortgage Loan</strong>
                  <ul className="ml-6 mt-2 space-y-1 text-slate-600 list-disc">
                    <li>Mortgage Loan : 12.00% p.a.</li>
                    <li>Housing Loan : 10.00% p.a.</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Security Loan</strong> : 14.00% p.a.
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Security loan 2nd hand vehicle</strong> <span className="text-slate-500 text-sm">(Three Wheelers, Four Wheelers, Light Vehicles & Bus, Lorry other heavy vehicles)</span> : 14.50%
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Security loan 2nd hand Machineries</strong> <span className="text-slate-500 text-sm">(Generator, Tractor, Compressor, Tiller, Mixer, JCB etc.)</span> : 12.50%
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Surety Loan</strong> <span className="text-slate-500 text-sm">(Salary undertaking scheme)</span> : 12.50% p.a.
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Surety Loan</strong> : 14.50% p.a
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#0A315C] rounded-full mr-3 mt-2 shrink-0"></span>
                <div>
                  <strong>Overdraft</strong> : 12.50% p.a
                </div>
              </li>

            </ul>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <p className="font-bold text-slate-800 text-sm italic">
                (Rate of interest on deposits and loans subject to change from time to time)
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
