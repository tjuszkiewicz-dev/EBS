
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Smartphone } from 'lucide-react';
import { User, Role } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface LoginScreenProps {
  users: User[];
  onLogin: (userId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [step, setStep] = useState<'CREDENTIALS' | '2FA'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [userId, setUserId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation delay
    setTimeout(() => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            if (user.status === 'INACTIVE') {
                setError('To konto zostało dezaktywowane. Skontaktuj się z HR.');
                setIsLoading(false);
                return;
            }
            
            // Check for 2FA
            if (user.isTwoFactorEnabled) {
                setUserId(user.id);
                setStep('2FA');
                setIsLoading(false);
            } else {
                onLogin(user.id);
            }
        } else {
            setError('Nieprawidłowy email lub hasło.');
            setIsLoading(false);
        }
    }, 800);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      setTimeout(() => {
          if (twoFactorCode === '123456') {
              if (userId) onLogin(userId);
          } else {
              setError('Błędny kod weryfikacyjny.');
              setIsLoading(false);
          }
      }, 600);
  };

  const demoLogin = (role: Role) => {
      const demoUser = users.find(u => u.role === role && u.status === 'ACTIVE');
      if (demoUser) {
          setEmail(demoUser.email);
          setPassword('password123');
      }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-800 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/90 z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
          
          <div className="relative z-20 text-center p-12 max-w-lg">
              <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <ShieldCheck size={56} className="text-white" />
                  </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">STRATTON PRIME</h1>
              <p className="text-emerald-400 font-medium text-xl mb-8 uppercase tracking-widest border-b border-slate-600 pb-4 inline-block">Eliton Benefits System</p>
              <p className="text-slate-400 text-lg leading-relaxed font-light">
                  Zaawansowana platforma zarządzania benefitami pracowniczymi, automatyzacji procesów HR oraz optymalizacji podatkowej.
              </p>
              
              <div className="mt-16 flex justify-center gap-6 text-sm text-slate-500 font-mono">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      System Operational
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-sm">
                      <Lock size={12} />
                      Secure Connection
                  </div>
              </div>
          </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-500">
              
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200">
                  {/* STEP 1: CREDENTIALS */}
                  {step === 'CREDENTIALS' && (
                      <div className="animate-in fade-in">
                          <div className="mb-8">
                              <h2 className="text-3xl font-bold text-slate-900 mb-2">Zaloguj się</h2>
                              <p className="text-slate-500">Wprowadź dane uwierzytelniające, aby uzyskać dostęp.</p>
                          </div>

                          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                              <Input 
                                  label="Email Służbowy"
                                  icon={<Mail size={18}/>}
                                  type="email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="jan.kowalski@firma.pl"
                              />

                              <div>
                                  <div className="flex justify-end mb-1">
                                      <a href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Zapomniałeś hasła?</a>
                                  </div>
                                  <Input
                                      icon={<Lock size={18}/>}
                                      type="password"
                                      required
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      placeholder="••••••••"
                                  />
                              </div>

                              {error && (
                                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-bottom-2">
                                      <AlertCircle size={18} className="shrink-0" />
                                      {error}
                                  </div>
                              )}

                              <Button 
                                  type="submit" 
                                  isLoading={isLoading}
                                  className="w-full"
                                  size="lg"
                                  icon={!isLoading ? <ArrowRight size={20}/> : undefined}
                              >
                                  {isLoading ? 'Autoryzacja...' : 'Zaloguj się'}
                              </Button>
                          </form>

                          {/* Demo Shortcuts */}
                          <div className="mt-10 pt-6 border-t border-slate-100">
                              <p className="text-center text-xs text-slate-400 mb-4 uppercase tracking-wider font-bold">Szybkie logowanie (Demo)</p>
                              <div className="grid grid-cols-2 gap-3">
                                  <button onClick={() => demoLogin(Role.SUPERADMIN)} className="p-2.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition">Admin (2FA)</button>
                                  <button onClick={() => demoLogin(Role.HR)} className="p-2.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition">HR Manager</button>
                                  <button onClick={() => demoLogin(Role.EMPLOYEE)} className="p-2.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition">Pracownik</button>
                                  <button onClick={() => demoLogin(Role.ADVISOR)} className="p-2.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition">Sprzedaż</button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* STEP 2: 2FA */}
                  {step === '2FA' && (
                      <div className="animate-in fade-in text-center">
                          <div className="mb-6 flex justify-center">
                              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                                  <Smartphone size={40} />
                              </div>
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Weryfikacja 2FA</h2>
                          <p className="text-slate-500 text-sm mb-8">
                              Twoje konto jest zabezpieczone. Wpisz 6-cyfrowy kod z aplikacji Authenticator.
                          </p>

                          <form onSubmit={handle2FASubmit} className="space-y-6">
                              <div className="relative max-w-[200px] mx-auto">
                                  <input 
                                      type="text" 
                                      maxLength={6}
                                      value={twoFactorCode}
                                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                      className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border-b-2 border-slate-300 focus:border-indigo-600 focus:outline-none bg-transparent transition-colors"
                                      placeholder="000000"
                                      autoFocus
                                  />
                              </div>

                              {error && (
                                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 animate-in fade-in">
                                      {error}
                                  </div>
                              )}

                              <Button 
                                  type="submit" 
                                  disabled={twoFactorCode.length !== 6}
                                  isLoading={isLoading}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                                  size="lg"
                              >
                                  {isLoading ? 'Weryfikacja...' : 'Potwierdź'}
                              </Button>
                          </form>
                          
                          <div className="mt-6 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg inline-block border border-slate-100">
                              Demo Code: <strong className="text-slate-600">123456</strong>
                          </div>
                          
                          <div className="mt-6">
                              <button 
                                  onClick={() => { setStep('CREDENTIALS'); setTwoFactorCode(''); setError(''); }}
                                  className="text-xs text-indigo-600 font-bold hover:underline"
                              >
                                  Wróć do logowania
                              </button>
                          </div>
                      </div>
                  )}
              </div>
              
              <p className="text-center text-slate-400 text-xs mt-8">
                  &copy; {new Date().getFullYear()} Stratton Prime S.A. Wszystkie prawa zastrzeżone.
              </p>
          </div>
      </div>
    </div>
  );
};
