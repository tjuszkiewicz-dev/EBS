
import React, { useState, useRef, useEffect } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Smartphone, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { User, Role } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { INITIAL_USERS } from '../services/mockData';

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
  const [logoError, setLogoError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const demoUsers = [
    { label: 'Admin (2FA)',  role: Role.SUPERADMIN, email: 'admin@eliton-benefits.com' },
    { label: 'HR Manager',  role: Role.HR,          email: 'hr@techsolutions.pl' },
    { label: 'Pracownik',   role: Role.EMPLOYEE,    email: 'jan.kowalski@techsolutions.pl' },
    { label: 'Sprzedaż',    role: Role.ADVISOR,     email: 'adam.d@eliton-benefits.com' },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation delay
    setTimeout(() => {
        // Auth source: INITIAL_USERS (always fresh) + any dynamically added users from state
        const dynamicUsers = users.filter(u => !INITIAL_USERS.some(iu => iu.id === u.id));
        const allAuthUsers = [...INITIAL_USERS, ...dynamicUsers];

        const authUser = allAuthUsers.find(u =>
            u.email.toLowerCase() === email.toLowerCase() ||
            (u.username && u.username.toLowerCase() === email.toLowerCase())
        );
        
        if (authUser) {
            const expectedPassword = authUser.password ?? '123';
            if (password !== expectedPassword) {
                setError('Nieprawidłowy użytkownik lub hasło.');
                setIsLoading(false);
                return;
            }
            if (authUser.status === 'INACTIVE') {
                setError('To konto zostało dezaktywowane. Skontaktuj się z HR.');
                setIsLoading(false);
                return;
            }
            
            // Check for 2FA
            if (authUser.isTwoFactorEnabled) {
                setUserId(authUser.id);
                setStep('2FA');
                setIsLoading(false);
            } else {
                setIsLoading(false);
                onLogin(authUser.id);
            }
        } else {
            setError('Nieprawidłowy użytkownik lub hasło.');
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
          setEmail(demoUser.username || demoUser.email);
          setPassword('');
          setShowDropdown(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/65 z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1764114908655-9a26d32750a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
          
          <div className="relative z-20 text-center p-12 max-w-lg">
              <div className="mb-6 flex justify-center">
                  <div className="w-72 h-72 flex items-center justify-center overflow-hidden">
                      {logoError ? (
                          <ShieldCheck size={112} className="text-white" />
                      ) : (
                          <img src="/bbs.png" alt="BBS" className="w-full h-full object-contain p-3" onError={() => setLogoError(true)} />
                      )}
                  </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">BALTIC BENEFIT</h1>
              <p className="text-blue-400 font-medium text-xl mb-8 uppercase tracking-widest border-b border-slate-600 pb-4 inline-block">System</p>
              <p className="text-slate-400 text-lg leading-relaxed font-light">
                  Zaawansowana platforma zarządzania benefitami pracowniczymi oraz automatyzacji procesów HR.
              </p>
              
              <div className="mt-16 flex justify-center gap-6 text-sm text-slate-500 font-mono">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
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
                              {/* Email field with demo dropdown */}
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Użytkownik</label>
                                <div className="relative" ref={dropdownRef}>
                                  <div className="relative group flex items-center">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                                      <Mail size={18} />
                                    </div>
                                    <input
                                      type="text"
                                      required
                                      autoComplete="off"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      placeholder="login lub email"
                                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowDropdown(v => !v)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 transition-colors"
                                      title="Szybkie logowanie demo"
                                    >
                                      <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                  </div>

                                  {showDropdown && (
                                    <div className="absolute z-50 top-full mt-1.5 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Szybkie logowanie (Demo)</p>
                                      {demoUsers.map(u => (
                                        <button
                                          key={u.role}
                                          type="button"
                                          onClick={() => demoLogin(u.role)}
                                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                          <span className="font-medium">{u.label}</span>
                                          <span className="text-xs text-slate-400 font-mono truncate ml-2">{u.email}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                  <div className="flex justify-end mb-1">
                                      <a href="#" className="text-xs font-medium text-blue-700 hover:text-blue-800">Zapomniałeś hasła?</a>
                                  </div>
                                  <Input
                                      icon={<Lock size={18}/>}
                                      type={showPassword ? 'text' : 'password'}
                                      required
                                      autoComplete="new-password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      placeholder="••••••••"
                                      rightElement={
                                          <button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-400 hover:text-blue-700 transition-colors">
                                              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                          </button>
                                      }
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
                  &copy; {new Date().getFullYear()} Baltic Benefit System. Wszystkie prawa zastrzeżone.
              </p>
          </div>
      </div>
    </div>
  );
};
