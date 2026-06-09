import React, { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, Mail, Lock, Phone, ArrowRight, ShieldAlert, KeyRound, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  setCurrentTab: (tab: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentTab }) => {
  const { login, loginWithOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();
  
  // Tabs: 'password' or 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Standard Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Form State
  const [mobile, setMobile] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (isOtpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpSent, countdown]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const success = await login(identifier, password);
      if (success) {
        setCurrentTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(t('invalid_credentials'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('invalid_credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setErrorMsg(t('invalid_mobile'));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithOtp(mobile);
      setIsOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(t('otp_dispatch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg(t('invalid_otp_len'));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const success = await verifyOtp(otpCode);
      if (success) {
        setCurrentTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(t('invalid_otp_val'));
      }
    } catch (err: any) {
      setErrorMsg(t('otp_verify_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Simulate Google OAuth
      const success = await login('member@odiyoorubank.in', 'password');
      if (success) {
        setCurrentTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMsg(t('google_fail'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-sky-100/30 px-4">
      
      {/* Container Card */}
      <div className="bg-white border border-slate-200/80 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-scale-up">
        
        {/* Left Side: Modern Fintech visual panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary to-primary-dark p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
              <img
                src="/logo-bg.png"
                alt="Odiyooru Souharda Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span className="text-xl font-black font-sans tracking-tight text-white uppercase block leading-none font-heading">
                Odiyooru
              </span>
            </div>

            <div className="space-y-3 pt-6">
              <h3 className="text-2xl font-extrabold leading-tight">{t('secure_banking')}</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {t('secure_banking_desc')}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-10 relative z-10">
            <div className="flex items-center space-x-3 text-xs bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
              <span>{t('iso_cert')}</span>
            </div>
            
            <p className="text-[10px] text-white/50 text-center font-mono">
              {t('govt_regd_no')}
            </p>
          </div>
        </div>

        {/* Right Side: Form inputs */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-white">
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('welcome_back')}</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{t('access_portal')}</h2>
              
              {/* Method toggles */}
              <div className="flex space-x-3 bg-slate-100 p-1 rounded-xl mt-4">
                <button
                  onClick={() => {
                    setLoginMethod('password');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('password_login')}
                </button>
                <button
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t('mobile_otp')}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-2.5 text-xs animate-slide-down">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* A. Password login form */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">{t('member_id_label')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. OS-2026-9041 or member@odiyoorubank.in"
                      className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-400 text-slate-800"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block px-1">Demo Email: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px]">member@odiyoorubank.in</code></span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500">{t('password_label')}</label>
                    <button type="button" className="text-[10px] text-primary font-bold hover:underline">{t('forgot_password')}</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-400 text-slate-800"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block px-1">Demo Password: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px]">password</code></span>
                </div>

                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded accent-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-slate-500 font-semibold cursor-pointer">{t('remember_me')}</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-slate-350 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? t('authenticating') : t('sign_in_btn')}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* B. OTP login form */}
            {loginMethod === 'otp' && (
              <div className="space-y-4">
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">{t('registered_mobile')}</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-400 text-slate-800"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-slate-350 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      {isLoading ? t('sending_otp') : t('send_otp_btn')}
                      {!isLoading && <KeyRound className="h-4 w-4" />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs space-y-1">
                      <p className="text-slate-500">OTP Code transmitted to <span className="font-bold text-slate-800">+91 {mobile}</span></p>
                      <p className="text-[10px] text-primary font-semibold">Demo Bypass Code: <span className="font-bold">123456</span> or <span className="font-bold">111111</span></p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">{t('otp_code_label')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 6-digit OTP code"
                          className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-400 text-slate-800 text-center font-mono tracking-widest text-lg"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs px-1">
                      {countdown > 0 ? (
                        <span className="text-slate-450">Resend OTP in <span className="font-bold text-slate-650">{countdown}s</span></span>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsOtpSent(false);
                            setOtpCode('');
                          }}
                          className="text-primary font-bold hover:underline"
                        >
                          Request New Code
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-accent hover:bg-accent-dark disabled:bg-slate-350 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      {isLoading ? t('verifying_otp') : t('verify_otp_btn')}
                      {!isLoading && <ShieldCheck className="h-4.5 w-4.5" />}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social Google Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-150"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('or_continue_with')}</span>
              <div className="flex-grow border-t border-slate-150"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Globe className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>{t('google_login_btn')}</span>
            </button>

          </div>

          <div className="pt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-100 mt-8">
            <span>{t('new_to_society')}</span>
          </div>

        </div>

      </div>
    </section>
  );
};
