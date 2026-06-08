import React, { useState } from 'react';
import { Search, MapPin, Phone, Landmark, Clock, Filter } from 'lucide-react';
import { useLanguage } from '../App';

interface Branch {
  name: string;
  state: 'Delhi' | 'Uttar Pradesh' | 'Maharashtra' | 'Karnataka';
  address: string;
  phone: string;
  hoursKey: string;
  isHead: boolean;
}

export const BranchLocator: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('All');

  const branches: Branch[] = [
    {
      name: 'Central Rohini Headquarters',
      state: 'Delhi',
      address: 'Plot No. 24, Institutional Area, Sector 7, Rohini, New Delhi - 110085',
      phone: '+91 11 4983 2000',
      hoursKey: 'hours_val',
      isHead: true
    },
    {
      name: 'Gomti Nagar Branch',
      state: 'Uttar Pradesh',
      address: '102, Cyber Tower, Near Patrakar Puram, Gomti Nagar, Lucknow - 226010',
      phone: '+91 522 400 9041',
      hoursKey: 'hours_val',
      isHead: false
    },
    {
      name: 'Shivaji Nagar Branch',
      state: 'Maharashtra',
      address: 'Shop No. 4-6, Ground Floor, Pune Commercial Hub, F.C. Road, Shivaji Nagar, Pune - 411005',
      phone: '+91 20 2567 4832',
      hoursKey: 'hours_val',
      isHead: false
    },
    {
      name: 'Indiranagar Branch',
      state: 'Karnataka',
      address: '89/1, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
      phone: '+91 80 4124 9382',
      hoursKey: 'hours_val',
      isHead: false
    },
    {
      name: 'Ghatkopar Branch',
      state: 'Maharashtra',
      address: 'Wing B, Ghatkopar Commercial Center, LBS Marg, Ghatkopar West, Mumbai - 400086',
      phone: '+91 22 2509 3824',
      hoursKey: 'hours_val',
      isHead: false
    }
  ];

  const filtered = branches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.address.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === 'All' || b.state === stateFilter;
    return matchesSearch && matchesState;
  });

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('branches_title')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('locator_subtitle')}
          </h2>
          <p className="text-slate-600">
            {t('locator_desc')}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-150 p-5 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="w-full pl-10.5 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <select
              className="w-full md:w-48 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm text-slate-700 font-medium"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="All">{t('all_states')}</option>
              <option value="Delhi">Delhi</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-white border border-slate-150 rounded-3xl">
              <p className="text-slate-400 font-medium text-sm">{t('no_branches')}</p>
            </div>
          ) : (
            filtered.map((b, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                {b.isHead && (
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t('central_hq_badge')}
                  </span>
                )}

                <div className="flex items-start space-x-4 mb-4">
                  <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block">
                      {b.state}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">{b.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{t(b.hoursKey)}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};
