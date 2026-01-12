import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Eye, EyeOff, Fingerprint, KeyRound, LogIn, Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { baseColors, loginColors } from '../theme';

const copy = {
  en: {
    support: 'Support',
    systemName: 'Enterprise Intelligent Perception',
    title: 'Enterprise Intelligent Perception',
    subA: '',
    subB: '',
    lblEmail: 'Enterprise ID or Corporate Email',
    emailPH: 'e.g. example@email.com',
    lblPass: 'Security Key/Password',
    forgot: 'Forgot Access Key?',
    mfa: 'Hardware-based 2FA or biometric verification may be required for this clearance level.',
    signIn: 'Secure Sign In',
    orBio: 'or biometric',
    bio: 'Institutional Biometric ID',
    sec: 'Security Protocols',
    privacy: 'Privacy Policy',
    status: 'System Status: Operational',
    footer: 'ADVANCED UNIVERSAL RECOGNITION ARCHITECTURE',
    systemVersion: 'v4.8.2-Gold',
    brandA: 'AURA',
    brandAAlt: 'A',
    emailRequired: 'Please enter a valid email address.',
  },
  ar: {
    support: 'الدعم',
    systemName: 'الإدراك المؤسسي الذكي',
    title: 'الإدراك المؤسسي الذكي',
    subA: '',
    subB: '',
    lblEmail: 'رقم المؤسسة أو البريد المؤسسي',
    emailPH: 'مثال: example@email.com',
    lblPass: 'مفتاح الأمان / كلمة المرور',
    forgot: 'نسيت مفتاح الدخول؟',
    mfa: 'قد يلزم التحقق الثنائي عبر عتاد أو التحقق البيومتري لهذا المستوى من الصلاحيات.',
    signIn: 'تسجيل دخول آمن',
    orBio: 'أو عبر البصمة',
    bio: 'الهوية البيومترية للمؤسسة',
    sec: 'بروتوكولات الأمان',
    privacy: 'سياسة الخصوصية',
    status: 'حالة النظام: يعمل',
    footer: 'معمارية التعرف الشاملة المتقدمة',
    systemVersion: 'v4.8.2-Gold',
    brandA: 'AURA',
    brandAAlt: 'A',
    emailRequired: 'يرجى إدخال بريد إلكتروني صحيح.',
  },
};

export const LoginScreen: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const { language, setLanguage, theme, setTheme } = useApp();
  const [enterpriseId, setEnterpriseId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const isRTL = language === 'ar';
  const text = useMemo(() => copy[isRTL ? 'ar' : 'en'], [isRTL]);
  const isDark = theme === 'dark';
  const colors = loginColors;
  const rootStyle: React.CSSProperties = {
    color: isDark ? baseColors.white : colors.text,
    backgroundColor: isDark ? colors.backgroundDark : colors.background,
    fontFamily: isRTL ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
    '--login-text': isDark ? baseColors.white : colors.text,
    '--login-button-text': colors.text,
    '--login-bg-layer': isDark ? colors.backgroundLayerDark : colors.background,
    '--login-grid-dot': colors.gridDot,
    '--login-primary-glow': colors.primaryGlow,
    '--login-gold-glow': colors.goldGlow,
    '--login-accent': colors.accent,
    '--login-accent-soft': colors.mfaBg,
    '--login-accent-border': colors.mfaBorder,
    '--login-accent-shadow': colors.accentShadow,
    '--login-input-bg': isDark ? colors.inputDark : colors.inputLight,
    '--login-border': isDark ? colors.borderDark : colors.borderLight,
    '--login-placeholder': isDark ? colors.placeholderDark : colors.placeholderLight,
    '--login-icon': isDark ? colors.iconDark : colors.iconLight
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const attemptLogin = () => {
    const email = enterpriseId.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setEmailError(text.emailRequired);
      return;
    }
    setEmailError('');
    onLogin(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptLogin();
  };

  return (
    <div className="min-h-screen flex flex-col antialiased" style={rootStyle}>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[color:var(--login-bg-layer)]">
        <div
          className="absolute inset-0 opacity-25 dark:opacity-40"
          style={{
            backgroundImage:
              `radial-gradient(circle at 2px 2px, ${colors.gridDot} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px] bg-[color:var(--login-primary-glow)]" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full blur-[150px] bg-[color:var(--login-gold-glow)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 lg:px-10 py-5 flex items-center justify-between border-b border-border backdrop-blur-sm bg-background/80">
        <div className="flex items-center gap-6">
          <div className="size-8 flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}images/Image1.png`} alt="Logo" className="w-8 h-8 object-contain transform scale-[2.25] origin-center" />
          </div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {text.systemName}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={
                language === 'en'
                  ? 'text-[color:var(--login-accent)] border-b-2 border-[color:var(--login-accent)] pb-1 transition-all'
                  : 'hover:text-foreground transition-all pb-1'
              }
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={
                language === 'ar'
                  ? 'text-[color:var(--login-accent)] border-b-2 border-[color:var(--login-accent)] pb-1 transition-all'
                  : 'hover:text-foreground transition-all pb-1'
              }
            >
              AR
            </button>
          </div>

          <button
            type="button"
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-lg h-9 w-9 border border-[color:var(--login-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-[color:var(--login-icon)]" />
            ) : (
              <Sun className="h-4 w-4 text-[color:var(--login-icon)]" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
        <div className="mb-8 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight pb-3 text-[color:var(--login-text)]">
            {text.title}
          </h1>
          {(text.subA || text.subB) && (
            <p className="text-muted-foreground text-base md:text-lg font-light">
              <span>{text.subA} </span>
              <span className="text-[color:var(--login-accent)] font-medium">{text.subB}</span>
            </p>
          )}
        </div>

        <div className="w-full max-w-[480px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-[color:var(--login-border)] p-8 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium px-1 text-[color:var(--login-text)]">
                {text.lblEmail}
              </label>
              <div className="relative group">
                <input
                  value={enterpriseId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEnterpriseId(value);
                    if (emailError && isValidEmail(value.trim())) {
                      setEmailError('');
                    }
                  }}
                  className="w-full h-14 rounded-lg px-4 text-[color:var(--login-text)] placeholder:text-[color:var(--login-placeholder)] focus:outline-none focus:ring-1 focus:ring-[color:var(--login-accent)] focus:border-[color:var(--login-accent)] transition-all bg-[color:var(--login-input-bg)] border border-[color:var(--login-border)]"
                  placeholder={text.emailPH}
                  type="text"
                />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 text-[color:var(--login-icon)] group-focus-within:text-[color:var(--login-accent)] transition-colors ${
                    isRTL ? 'left-4' : 'right-4'
                  }`}
                >
                  <BadgeCheck className="h-4 w-4" />
                </div>
              </div>
              {emailError && (
                <p className="text-xs text-red-600 dark:text-red-400 px-1">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-[color:var(--login-text)]">
                  {text.lblPass}
                </label>
                <button
                  type="button"
                  className="text-xs text-[color:var(--login-link)] hover:text-[color:var(--login-accent)] transition-colors"
                  style={{ '--login-link': colors.linkAccent } as React.CSSProperties}
                >
                  {text.forgot}
                </button>
              </div>
              <div className="relative group">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 rounded-lg px-4 text-[color:var(--login-text)] placeholder:text-[color:var(--login-placeholder)] focus:outline-none focus:ring-1 focus:ring-[color:var(--login-accent)] focus:border-[color:var(--login-accent)] transition-all bg-[color:var(--login-input-bg)] border border-[color:var(--login-border)]"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 ${
                    isRTL ? 'left-3 flex-row-reverse' : 'right-3'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[color:var(--login-icon)] hover:text-[color:var(--login-accent)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <span className="text-[color:var(--login-icon)] group-focus-within:text-[color:var(--login-accent)] transition-colors">
                    <KeyRound className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-6 p-3 bg-[color:var(--login-accent-soft)] border border-[color:var(--login-accent-border)] rounded-lg">
              <BadgeCheck className="h-4 w-4 mt-0.5 text-[color:var(--login-accent)]" />
              <p className="text-xs text-muted-foreground leading-tight">{text.mfa}</p>
            </div>

            <button
              className="w-full h-14 text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_var(--login-accent-shadow)] bg-[color:var(--login-accent)] text-[color:var(--login-button-text)] hover:opacity-90"
              type="submit"
            >
              <span>{text.signIn}</span>
              <LogIn className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-[color:var(--login-border)]" />
              <span className="text-[10px] text-[color:var(--login-placeholder)] uppercase tracking-[0.2em]">
                {text.orBio}
              </span>
              <div className="h-px flex-1 bg-[color:var(--login-border)]" />
            </div>

            <button
              type="button"
              onClick={attemptLogin}
              className="w-full h-12 border border-[color:var(--login-border)] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-[color:var(--login-text)]"
            >
              <Fingerprint className="h-4 w-4 text-[color:var(--login-fingerprint)]" style={{ '--login-fingerprint': colors.fingerprint } as React.CSSProperties} />
              <span>{text.bio}</span>
            </button>
          </form>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] font-medium tracking-[0.2em] text-[color:var(--login-placeholder)] uppercase">
          <button type="button" className="hover:text-[color:var(--login-accent)] transition-colors">
            {text.sec}
          </button>
          <button type="button" className="hover:text-[color:var(--login-accent)] transition-colors">
            {text.privacy}
          </button>
          <div className="flex items-center gap-1">
            <span className="size-2 bg-green-500 rounded-full inline-block" />
            <span>{text.status}</span>
          </div>
          <span className="cursor-default">{text.systemVersion}</span>
        </div>
      </main>

      <footer className="w-full py-6 flex justify-center opacity-20 pointer-events-none">
        <div className="text-xs tracking-[0.5em] font-light">{text.footer}</div>
      </footer>
    </div>
  );
};
