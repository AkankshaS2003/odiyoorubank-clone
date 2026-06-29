import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

interface LoginProps {
  setCurrentTab: (tab: string) => void;
  goBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentTab, goBack }) => {
  const { login, registerUser, forgotPassword, resetPassword, googleLogin } = useAuth();
  
  // 'login' | 'register' | 'register-otp' | 'forgot' | 'reset'
  const [view, setView] = useState<'login' | 'register' | 'register-otp' | 'forgot' | 'reset'>('login');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check for reset password token in URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/resetpassword/')) {
      const token = path.split('/')[2];
      if (token) {
        setResetToken(token);
        setView('reset');
      }
    }
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.post('/auth/register/send-otp', { email });
      if (res.data.success) {
        setOtpTimer(60);
        setSuccessMsg('Verification OTP resent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to resend verification OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        if (!email || !password) throw new Error('Please fill all fields');
        const role = await login(email, password);
        if (role) {
          if (role === 'admin' || role === 'manager' || role === 'employee') {
            setCurrentTab('home');
          } else {
            setCurrentTab('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg('Invalid Credentials');
        }
      } 
      else if (view === 'register') {
        if (!name || !email || !phone || !password) {
          throw new Error('Please fill all fields');
        }
        if (phone.length !== 10) {
          throw new Error('Phone number must be exactly 10 digits');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const res = await api.post('/auth/register/send-otp', { email });
        if (res.data.success) {
          setOtpSent(true);
          setOtpTimer(60);
          setSuccessMsg('Verification OTP sent to your email.');
          setView('register-otp');
        }
      }
      else if (view === 'register-otp') {
        if (!otp) {
          throw new Error('Please enter the 6-digit OTP');
        }
        
        const verifyRes = await api.post('/auth/register/verify-otp', { email, otp });
        if (verifyRes.data.success) {
          setOtpVerified(true);
          
          const role = await registerUser({
            fullName: name,
            email,
            phone,
            password
          });
          
          if (role) {
            if (role === 'admin' || role === 'manager' || role === 'employee') {
              setCurrentTab('home');
            } else {
              setCurrentTab('home');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setErrorMsg('Registration failed. Email might already exist.');
          }
        }
      }
      else if (view === 'forgot') {
        if (!email) throw new Error('Please enter your email');
        const success = await forgotPassword(email);
        if (success) {
          setSuccessMsg('If your email exists in our system, you will receive a reset link shortly.');
        }
      }
      else if (view === 'reset') {
        if (!password || !confirmPassword) throw new Error('Please fill all fields');
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const role = await resetPassword(resetToken, password);
        if (role) {
          // Clear URL and go to dashboard
          window.history.replaceState({}, document.title, '/');
          if (role === 'admin' || role === 'manager' || role === 'employee') {
            setCurrentTab('home');
          } else {
            setCurrentTab('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg('Invalid or expired reset token');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // The token is no longer passed here; AuthContext handles the Firebase popup
      const role = await googleLogin('');
      if (role) {
        if (role === 'admin' || role === 'manager' || role === 'employee') {
          setCurrentTab('home');
        } else {
          setCurrentTab('home');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Google login failed or was cancelled');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (goBack) goBack();
    else setCurrentTab('home');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-[#0A315C]/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />
      
      {/* Centered Modal Card */}
      <div className="relative bg-[#0A315C] border border-white/20 w-full max-w-[340px] rounded-[24px] shadow-2xl p-6 flex flex-col items-center animate-scale-up overflow-hidden z-10">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[150px] bg-gradient-to-b from-[#ED7F1E]/20 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Name */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <img
            src="/logo-bg.png"
            alt="Bank Logo"
            className="h-16 w-16 object-contain mb-3 drop-shadow-md"
          />
          <h2 className="text-xl font-black text-white uppercase tracking-wider text-center leading-tight">
            Odiyooru Souharda<br />
            <span className="text-sm tracking-widest text-[#ED7F1E]">Cooperative Society</span>
          </h2>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-white/20"></div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
              {view === 'login' && "Secure Login"}
              {(view === 'register' || view === 'register-otp') && "Member Registration"}
              {view === 'forgot' && "Password Recovery"}
              {view === 'reset' && "Set New Password"}
            </span>
            <div className="h-px w-8 bg-white/20"></div>
          </div>
        </div>

        {errorMsg && (
          <div className="w-full mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl flex items-start space-x-2 text-xs relative z-10 backdrop-blur-md">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl flex items-start space-x-2 text-xs relative z-10 backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3 relative z-10">
          
          {view === 'register' && (
            <>
              <div>
                <input
                  type="text"
                  required
                  placeholder={"Full Name"}
                  className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder={"Mobile Number"}
                  className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPhone(val);
                  }}
                  onBlur={() => {
                    if (phone.length > 0 && !/^[6-9]/.test(phone[0])) {
                      setErrorMsg("Please enter a valid phone number ");
                    } else if (phone.length > 0 && phone.length !== 10) {
                      setErrorMsg("Phone number must be exactly 10 digits");
                    } else {
                      setErrorMsg(null);
                    }
                  }}
                />
              </div>
            </>
          )}

          {view === 'register-otp' && (
            <div className="space-y-4 pb-2">
              <p className="text-sm text-white/80 text-center mb-2">
                Enter 6 digit OTP sent to your registered email
              </p>
              <div className="flex justify-center items-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none text-white transition-all shadow-sm"
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        const newOtp = otp.split('');
                        newOtp[i] = val;
                        setOtp(newOtp.join('').slice(0, 6));
                        if (e.target.nextSibling) {
                          (e.target.nextSibling as HTMLInputElement).focus();
                        }
                      } else {
                        const newOtp = otp.split('');
                        newOtp[i] = '';
                        setOtp(newOtp.join(''));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && e.currentTarget.previousSibling) {
                        (e.currentTarget.previousSibling as HTMLInputElement).focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
                      if (pastedData) {
                        setOtp(pastedData);
                        const nextIndex = Math.min(pastedData.length, 5);
                        const parent = e.currentTarget.parentNode;
                        if (parent && parent.childNodes[nextIndex]) {
                          (parent.childNodes[nextIndex] as HTMLInputElement).focus();
                        }
                      }
                    }}
                  />
                ))}
              </div>
              <div className="text-center mt-2">
                {otpTimer > 0 ? (
                  <p className="text-[12px] text-white/60">
                    ⏱️ Resend OTP in 00:{otpTimer < 10 ? '0' + otpTimer : otpTimer}
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleResendOtp}
                    className="text-[12px] text-[#ED7F1E] hover:underline font-bold disabled:opacity-50"
                  >
                    Resend Verification OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <div className="space-y-2">
              <input
                type="email"
                required
                placeholder={"Email Address"}
                className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'reset') && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={view === 'reset' ? "New Password" : "Password"}
                className="w-full pl-4 pr-12 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 inset-y-0 flex items-center justify-center text-white/40 hover:text-white transition-colors px-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          )}

          {view === 'reset' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={"Confirm Password"}
                className="w-full pl-4 pr-12 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {view === 'login' && (
            <div className="flex items-center justify-between pt-1 px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#ED7F1E] focus:ring-[#ED7F1E] focus:ring-offset-[#0A315C]" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">{"Remember me"}</span>
              </label>
              <button 
                type="button" 
                onClick={() => { setView('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-sm text-[#ED7F1E] font-semibold hover:text-white transition-colors hover:underline underline-offset-4"
              >
                {"Forgot Password?"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#ED7F1E] to-[#d66a10] hover:from-[#d66a10] hover:to-[#c45e09] disabled:from-white/20 disabled:to-white/20 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ED7F1E]/20 transition-all flex items-center justify-center border border-white/10"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              view === 'login' ? "Log in Securely" : 
              view === 'register' ? "Register Account" : 
              view === 'register-otp' ? "Verify & Register" : 
              view === 'forgot' ? "Send Reset Link" : "Update Password"
            )}
          </button>
        </form>

        {(view === 'login' || view === 'register' || view === 'register-otp') && (
          <div className="w-full flex items-center justify-center mt-6 mb-8 relative z-10">
            <span className="text-[14px] text-white/60">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setPassword('');
                  setConfirmPassword('');
                  setOtp('');
                }} 
                className="ml-2 text-[#ED7F1E] font-bold hover:text-white transition-colors hover:underline underline-offset-4"
              >
                {view === 'login' ? "Sign up" : "Log in"}
              </button>
            </span>
          </div>
        )}

        {view === 'forgot' && (
          <div className="w-full flex items-center justify-center mt-6 relative z-10">
            <button 
              onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="text-[14px] text-white/60 hover:text-white transition-colors font-semibold flex items-center"
            >
              ← {"Back to Log in"}
            </button>
          </div>
        )}

        {/* Social Logins */}
        {(view === 'login' || view === 'register') && (
          <div className="w-full mt-4 flex justify-center relative z-10">
            <button
              type="button"
              onClick={handleGoogleSuccess}
              disabled={isLoading}
              className="w-full max-w-[280px] py-2.5 bg-white text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
              <span>{"Continue with Google"}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
