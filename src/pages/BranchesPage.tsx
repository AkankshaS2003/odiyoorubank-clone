import React from 'react';
import { MapPin, Phone, Mail, Building, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const branches = [
  { name: 'Odiyoor (Head Office)', address: 'Odiyoor Shree Vividhoddesha Sowhardha Sahakari Ltd, Odiyoor', type: 'Head Office', phone: '+91 0000000000' },
  { name: 'Pumpwell, Mangaluru', address: 'Regional Office, Pumpwell, Mangaluru', type: 'Regional Office', phone: '+91 0000000000' },
  { name: 'Bejai', address: 'Bejai Branch, Mangaluru', type: 'Branch', phone: '+91 0000000000' },
  { name: 'B.C. Road', address: 'B.C. Road Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Puttur', address: 'Puttur Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Vittla', address: 'Vittla Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Kanyana', address: 'Kanyana Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Surathkal', address: 'Surathkal Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Thokkottu', address: 'Thokkottu Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Sullia', address: 'Sullia Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Kadaba', address: 'Kadaba Branch', type: 'Branch', phone: '+91 0000000000' },
  { name: 'Uppinangady', address: 'Uppinangady Branch', type: 'Branch', phone: '+91 0000000000' }
];

export const BranchesPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      {/* Hero Section */}
      <div className="bg-[#0A315C] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Our Network</h1>
        <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Odiyooru Souharda Cooperative Society operates multiple branches across the Dakshina Kannada region to serve you better.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {branches.map((branch, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all"
            >
              <div className="h-2 bg-[#ED7F1E] w-full"></div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full flex items-center justify-center ${branch.type === 'Head Office' ? 'bg-[#0A315C] text-white' : 'bg-[#ED7F1E]/10 text-[#ED7F1E]'}`}>
                    {branch.type === 'Head Office' ? <Building className="h-6 w-6" /> : <Map className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{branch.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${branch.type === 'Head Office' ? 'bg-[#0A315C]/10 text-[#0A315C]' : 'bg-[#ED7F1E]/10 text-[#ED7F1E]'}`}>
                      {branch.type}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex items-start space-x-3 text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#0A315C]" />
                    <span className="text-xs font-medium leading-relaxed">{branch.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Phone className="h-4 w-4 shrink-0 text-[#0A315C]" />
                    <span className="text-xs font-bold">{branch.phone}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
