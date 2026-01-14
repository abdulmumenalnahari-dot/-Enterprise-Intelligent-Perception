import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Eye, Shield, Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { baseColors, onboardingColors } from '../theme';

const copy = {
  en: {
    systemName: 'Enterprise Intelligent Perception',
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    slides: [
      {
        title: 'Institutional Visibility',
        description: 'Unified oversight for behavioral signals across environments.',
      },
      {
        title: 'Behavioral Analytics',
        description: 'Actionable insights with clear metrics and trends.',
      },
      {
        title: 'Secure Governance',
        description: 'Privacy-first controls with enterprise-grade compliance.',
      },
    ],
  },
  ar: {
    systemName: 'الإدراك المؤسسي الذكي',
    skip: 'تخطي',
    next: 'التالي',
    getStarted: 'ابدأ',
    slides: [
      {
        title: 'رؤية مؤسسية شاملة',
        description: 'إشراف موحد لإشارات السلوك عبر البيئات المختلفة.',
      },
      {
        title: 'تحليلات سلوكية',
        description: 'مؤشرات واضحة قابلة للتنفيذ مع اتجاهات دقيقة.',
      },
      {
        title: 'حوكمة آمنة',
        description: 'ضوابط خصوصية متقدمة بمعايير مؤسسية.',
      },
    ],
  },
};

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { language, setLanguage, theme, setTheme } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const colors = onboardingColors;
  const text = useMemo(() => copy[isRTL ? 'ar' : 'en'], [isRTL]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const handleNext = () => {
    if (currentSlide < text.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const icons = [Eye, Activity, Shield];
  const Icon = icons[currentSlide];
  const currentColor = colors.slideColors[currentSlide] ?? colors.slideColors[0];

  return (
    <div
      className="min-h-screen flex flex-col antialiased bg-background text-foreground"
      style={{
        fontFamily: isRTL ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        '--onboarding-accent': colors.accent,
        '--onboarding-border': isDark ? colors.headerBorderDark : colors.headerBorderLight,
        '--onboarding-icon': isDark ? colors.headerIconDark : colors.headerIconLight,
        '--onboarding-dot-dark': colors.dotDark,
        '--onboarding-dot-light': colors.dotLight
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
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
                  ? 'text-[color:var(--onboarding-accent)] border-b-2 border-[color:var(--onboarding-accent)] pb-1 transition-all'
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
                  ? 'text-[color:var(--onboarding-accent)] border-b-2 border-[color:var(--onboarding-accent)] pb-1 transition-all'
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
            className="flex items-center justify-center rounded-lg h-9 w-9 border border-[color:var(--onboarding-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-[color:var(--onboarding-icon)]" />
            ) : (
              <Sun className="h-4 w-4 text-[color:var(--onboarding-icon)]" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-2xl">
          <Card className="p-8 md:p-12 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-[color:var(--onboarding-border)]">
            <div className="space-y-8">
              <div className="flex justify-end">
                <Button variant="ghost" onClick={handleSkip}>
                  {text.skip}
                </Button>
              </div>

              <div className="flex justify-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentColor}20` }}
                >
                  <Icon className="w-12 h-12" style={{ color: currentColor }} />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">{text.slides[currentSlide].title}</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {text.slides[currentSlide].description}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {text.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="transition-all"
                    type="button"
                  >
                    <div
                      className={`rounded-full transition-all ${index === currentSlide ? 'w-8 h-2' : 'w-2 h-2'}`}
                      style={{
                        backgroundColor: index === currentSlide ? currentColor : isDark ? colors.dotDark : colors.dotLight,
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="min-w-[200px] bg-[color:var(--onboarding-accent)] text-[color:var(--onboarding-text)] hover:opacity-90"
                  style={{ '--onboarding-text': colors.text } as React.CSSProperties}
                >
                  {currentSlide === text.slides.length - 1 ? text.getStarted : text.next}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
