import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Landmark, Clock, Filter } from 'lucide-react';
import api from '../services/api';

interface Branch {
  name: string;
  state: 'Dakshina Kannada' | 'Udupi' | 'Bengaluru' | 'Kasaragod';
  address: string;
  phone: string;
  hoursKey: string;
  isHead: boolean;
}

export const BranchLocator: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('All');

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches?publishedOnly=true');
        const sorted = res.data.sort((a: any, b: any) => {
          if (a.type === 'Head Office' && b.type !== 'Head Office') return -1;
          if (b.type === 'Head Office' && a.type !== 'Head Office') return 1;
          return a.name.localeCompare(b.name);
        });
        
        const mappedBranches = sorted.map((b: any) => {
          const address = b.address.toLowerCase();
          let state = 'Dakshina Kannada';
          if (address.includes('udupi')) state = 'Udupi';
          else if (address.includes('bengaluru')) state = 'Bengaluru';
          else if (address.includes('kasaragod')) state = 'Kasaragod';

          return {
            name: b.name,
            state: state as Branch['state'],
            address: b.address,
            phone: b.phone,
            hoursKey: 'hours_val',
            isHead: b.type === 'Head Office'
          };
        });
        setBranches(mappedBranches);
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };
    fetchBranches();
  }, []);

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
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{"Branches"}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {"Cooperative Network Branch Locator"}
          </h2>
          <p className="text-slate-600">
            {"Find the nearest society office or deposit collection hub in your city."}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-150 p-5 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder={"Search branch name, address, pin code..."}
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
              <option value="All">{"All States"}</option>
              <option value="Dakshina Kannada">Dakshina Kannada</option>
              <option value="Udupi">Udupi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Kasaragod">Kasaragod</option>
            </select>
          </div>

        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-white border border-slate-150 rounded-3xl">
              <p className="text-slate-400 font-medium text-sm">{"No cooperative branches found matching your filters."}</p>
            </div>
          ) : (
            filtered.map((b, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                {b.isHead && (
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {"Central HQ"}
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
                    <span className="text-[11px] leading-relaxed">Monday - Saturday: 09:30 AM - 04:30 PM (Closed on Sundays, 2nd & 4th Saturdays)</span>
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
