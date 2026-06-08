import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../App';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.message) return;
    
    // Simulate submission delay
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', mobile: '', message: '' });
    }, 5000);
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-2">{t('connect_us')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            {t('here_to_help')}
          </h2>
          <p className="text-slate-600">
            {t('here_to_help_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details Left Column */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="bg-slate-50 border border-slate-150 p-8 rounded-3xl space-y-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{t('hq_office')}</h3>
              
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start space-x-3.5">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">{t('central_address')}</h4>
                    <p className="leading-relaxed">
                      {t('hq_address_val')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">{t('direct_helpdesk')}</h4>
                    <p className="font-semibold text-slate-900 hover:text-primary cursor-pointer">
                      <a href="tel:0824-2439114">0824-2439114</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">{t('electronic_mail')}</h4>
                    <p className="font-semibold text-slate-900 hover:text-primary cursor-pointer break-all">
                      <a href="mailto:odiyoorsricooperative@gmail.com">odiyoorsricooperative@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">{t('operational_hours')}</h4>
                    <p className="leading-relaxed text-xs">
                      {t('hours_val')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Mock/Embed */}
            <div className="h-64 rounded-3xl overflow-hidden border border-slate-150 shadow-sm relative bg-slate-100">
              <iframe
                title="Shri Gurudevadatta Samsthanam, Odiyoor"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3891.6123932628598!2d75.0286395!3d12.738690400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba49f7b0c9cf9fb%3A0x610ef22caa7f68c4!2sShri%20Gurudevadatta%20Samsthanam%2C%20Odiyoor!5e0!3m2!1sen!2sin!4v1780055860703!5m2!1sen!2sin"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>

          </div>

          {/* Contact Input Form Right Column */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-150 p-8 md:p-10 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('send_inquiry')}</h3>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center space-y-3 animate-scale-up">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-950">{t('inquiry_dispatched')}</h4>
                <p className="text-xs text-slate-650 max-w-sm mx-auto leading-relaxed">
                  {t('inquiry_success_desc')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-primary hover:underline"
                >
                  {t('submit_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">{t('your_name')}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-4.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">{t('mobile_number')}</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="e.g. 98765 43210"
                      className="w-full px-4.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      value={formData.mobile}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">{t('email_address')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. rajesh@email.com"
                    className="w-full px-4.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">{t('msg_details')}</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder={t('msg_placeholder')}
                    className="w-full px-4.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>{t('transmit_msg')}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
