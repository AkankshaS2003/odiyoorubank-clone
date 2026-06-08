import React, { useState } from 'react';
import { FileText, ArrowDownToLine, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../App';

interface BankForm {
  id: string;
  title: string;
  code: string;
  size: string;
  desc: string;
}

export const Downloads: React.FC = () => {
  const { t } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const forms: BankForm[] = [
    {
      id: 'form-member',
      title: t('form1_title'),
      code: 'ICCS-FORM-01A',
      size: '240 KB',
      desc: t('form1_desc')
    },
    {
      id: 'form-deposit',
      title: t('form2_title'),
      code: 'ICCS-FORM-02B',
      size: '185 KB',
      desc: t('form2_desc')
    },
    {
      id: 'form-kyc',
      title: t('form3_title'),
      code: 'ICCS-FORM-09K',
      size: '142 KB',
      desc: t('form3_desc')
    },
    {
      id: 'form-gold',
      title: t('form4_title'),
      code: 'ICCS-FORM-12G',
      size: '310 KB',
      desc: t('form4_desc')
    }
  ];

  const handleDownload = (id: string, name: string) => {
    setDownloadingId(id);
    setDownloadedId(null);
    
    // Simulate compilation loading delay
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadedId(id);
      
      // Clear success banner after 4 seconds
      setTimeout(() => {
        setDownloadedId(null);
      }, 4000);

      // Trigger standard file draft download simulation
      const blob = new Blob([`Simulated ICCS Bank PDF Form Data for ${name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.toLowerCase().replace(/\s+/g, '_')}_template.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('form_center')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('download_docs')}
          </h2>
          <p className="text-slate-600">
            {t('download_desc')}
          </p>
        </div>

        {/* Downloads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {forms.map((form) => (
            <div 
              key={form.id}
              className="bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:border-primary/15"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase bg-slate-200/50 px-2 py-0.5 rounded">
                    {form.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 mb-1.5 leading-snug">{form.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{form.desc}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-auto flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Size: {form.size}</span>
                
                {downloadingId === form.id ? (
                  <button className="px-4 py-2.5 bg-slate-200 text-slate-500 font-bold rounded-xl flex items-center space-x-1.5 cursor-not-allowed">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{t('compiling')}</span>
                  </button>
                ) : downloadedId === form.id ? (
                  <button className="px-4 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl flex items-center space-x-1.5 cursor-default">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t('downloaded')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownload(form.id, form.title)}
                    className="px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    <span>{t('download_btn')}</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
