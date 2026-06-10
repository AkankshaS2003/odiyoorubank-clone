import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';

interface LoginProps {
  setCurrentTab: (tab: string) => void;
  goBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentTab, goBack }) => {
  const { login, registerUser, forgotPassword, resetPassword, googleLogin } = useAuth();
  const { t } = useLanguage();
  
  // 'login' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        if (!email || !password) throw new Error('Please fill all fields');
        const success = await login(email, password);
        if (success) {
          setCurrentTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg('Invalid Credentials');
        }
      } 
      else if (view === 'register') {
        if (!name || !email || !phone || !password || !confirmPassword) {
          throw new Error('Please fill all fields');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const success = await registerUser({
          fullName: name,
          email,
          phone,
          password
        });
        
        if (success) {
          setCurrentTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrorMsg('Registration failed. Email might already exist.');
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

        const success = await resetPassword(resetToken, password);
        if (success) {
          // Clear URL and go to dashboard
          window.history.replaceState({}, document.title, '/');
          setCurrentTab('dashboard');
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const success = await googleLogin(credentialResponse.credential);
        if (success) {
          setCurrentTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Google login failed');
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
      <div className="relative bg-[#0A315C] border border-white/20 w-full max-w-[420px] rounded-[32px] shadow-2xl p-10 flex flex-col items-center animate-scale-up overflow-hidden z-10">
        
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
              {view === 'login' && 'Secure Login'}
              {view === 'register' && 'Member Registration'}
              {view === 'forgot' && 'Password Recovery'}
              {view === 'reset' && 'Set New Password'}
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

        <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10">
          
          {view === 'register' && (
            <>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full px-5 py-3.5 text-[15px] bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  className="w-full px-5 py-3.5 text-[15px] bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full px-5 py-3.5 text-[15px] bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
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
                placeholder={view === 'reset' ? 'New Password' : 'Password'}
                className="w-full pl-5 pr-12 py-3.5 text-[15px] bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          )}

          {(view === 'register' || view === 'reset') && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm Password"
                className="w-full pl-5 pr-12 py-3.5 text-[15px] bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ED7F1E] focus:border-[#ED7F1E] focus:bg-white/10 outline-none placeholder-white/40 text-white transition-all shadow-sm backdrop-blur-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {view === 'login' && (
            <div className="flex items-center justify-between pt-1 px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#ED7F1E] focus:ring-[#ED7F1E] focus:ring-offset-[#0A315C]" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => { setView('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-sm text-[#ED7F1E] font-semibold hover:text-white transition-colors hover:underline underline-offset-4"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#ED7F1E] to-[#d66a10] hover:from-[#d66a10] hover:to-[#c45e09] disabled:from-white/20 disabled:to-white/20 disabled:text-white/40 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-[#ED7F1E]/20 transition-all flex items-center justify-center border border-white/10"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              view === 'login' ? 'Log in Securely' : 
              view === 'register' ? 'Register Account' : 
              view === 'forgot' ? 'Send Reset Link' : 'Update Password'
            )}
          </button>
        </form>

        {(view === 'login' || view === 'register') && (
          <div className="w-full flex items-center justify-center mt-6 mb-8 relative z-10">
            <span className="text-[14px] text-white/60">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login');
                  setErrorMsg(null);
                  setPassword('');
                  setConfirmPassword('');
                }} 
                className="ml-2 text-[#ED7F1E] font-bold hover:text-white transition-colors hover:underline underline-offset-4"
              >
                {view === 'login' ? 'Sign up' : 'Log in'}
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
              ← Back to Log in
            </button>
          </div>
        )}

        {/* Social Logins */}
        {(view === 'login' || view === 'register') && (
          <div className="w-full mt-4 flex justify-center relative z-10">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Login Failed')}
              useOneTap
              shape="pill"
              theme="filled_black"
              size="large"
            />
          </div>
        )}

      </div>
    </div>
  );
};
