import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface VisualAnalyticsProps {
  income: number;
  emi: number;
  expenses: number;
  savings: number;
  score: number;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ income, emi, expenses, savings, score }) => {
  const barData = [
    { name: 'Income', amount: income, fill: '#10b981' },
    { name: 'Existing EMI', amount: emi, fill: '#ef4444' },
    { name: 'Expenses', amount: expenses, fill: '#f59e0b' },
    { name: 'Savings', amount: savings, fill: '#3b82f6' },
  ];

  const pieData = [
    { name: 'Eligible Score', value: score },
    { name: 'Gap', value: 100 - score },
  ];
  const pieColors = ['#10b981', '#e2e8f0'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      {/* Bar Chart: Debt vs Income */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h4 className="text-lg font-bold text-slate-800 mb-6">Financial Overview</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Eligibility Ratio */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col">
        <h4 className="text-lg font-bold text-slate-800 mb-2">Eligibility Health Score</h4>
        <p className="text-sm text-slate-500 mb-4">A visual representation of your approval likelihood.</p>
        
        <div className="flex-grow flex items-center justify-center relative">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{score}%</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
