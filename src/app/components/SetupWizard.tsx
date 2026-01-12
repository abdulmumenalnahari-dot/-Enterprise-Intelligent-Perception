import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { baseColors, setupWizardColors } from '../theme';

type ProfileId = 'university' | 'service' | 'market' | 'airport' | 'public' | 'work';

const copy = {
  en: {
    support: 'Support',
    systemName: 'Enterprise Intelligent Perception',
    wizTitleHTML: 'Deployment Configuration Wizard - <span dir="rtl" lang="ar">الإدراك المؤسسي الذكي</span>',
    card1Title: 'University',
    card1Desc: 'Institutional setup for academic environments.',
    card2Title: 'Service Center',
    card2Desc: 'Optimized for customer support and service hubs.',
    card3Title: 'Supermarket',
    card3Desc: 'Retail environment configuration.',
    card4Title: 'Airport',
    card4Desc: 'High-traffic transportation hub setup.',
    card5Title: 'Public Market',
    card5Desc: 'Open market and community space setup.',
    card6Title: 'Workplace',
    card6Desc: 'Corporate office and professional setting.',
    cancel: 'Cancel',
    next: 'Next',
  },
  ar: {
    support: 'الدعم',
    systemName: 'الإدراك المؤسسي الذكي',
    wizTitleHTML: 'معالج إعداد النشر - <span dir="rtl" lang="ar">الإدراك المؤسسي الذكي</span>',
    card1Title: 'جامعة',
    card1Desc: 'إعداد مؤسسي مخصص للبيئات الأكاديمية.',
    card2Title: 'مركز خدمات',
    card2Desc: 'محسّن لمراكز الدعم وخدمات العملاء.',
    card3Title: 'سوبرماركت',
    card3Desc: 'تهيئة مناسبة لبيئات البيع بالتجزئة.',
    card4Title: 'مطار',
    card4Desc: 'إعداد لمراكز النقل عالية الحركة.',
    card5Title: 'سوق عام',
    card5Desc: 'إعداد للأسواق المفتوحة والمساحات المجتمعية.',
    card6Title: 'مكان العمل',
    card6Desc: 'إعداد للمكاتب والبيئات المهنية.',
    cancel: 'إلغاء',
    next: 'التالي',
  },
};

export const SetupWizard: React.FC<{ onComplete: (profileId: ProfileId) => void }> = ({ onComplete }) => {
  const { language, setLanguage, theme, setTheme, setIsAuthenticated, setIsSetupComplete } = useApp();
  const [selected, setSelected] = useState<ProfileId>('university');

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const colors = setupWizardColors;
  const text = useMemo(() => copy[isRTL ? 'ar' : 'en'], [isRTL]);
  const rootStyle: React.CSSProperties = {
    color: isDark ? baseColors.white : colors.textLight,
    background: isDark ? colors.backgroundDark : colors.backgroundLight,
    '--setup-accent': colors.accent,
    '--setup-title': colors.titleGold,
    '--setup-foreground': isDark ? baseColors.white : colors.textLight,
    '--setup-button-text': colors.actionNextText,
    '--setup-step-gradient': colors.stepActiveGradient,
    '--setup-step-text': colors.stepActiveText,
    '--setup-card-dark': colors.cardGradientDark,
    '--setup-card-light': colors.cardGradientLight,
    '--setup-selected-dark': colors.selectedCardDark,
    '--setup-selected-dark-shadow': colors.selectedCardDarkShadow,
    '--setup-selected-dark-border': colors.selectedCardDarkBorder,
    '--setup-selected-light': colors.selectedCardLight,
    '--setup-selected-light-shadow': colors.selectedCardLightShadow,
    '--setup-selected-light-border': colors.selectedCardLightBorder,
    '--setup-text-300': colors.lightText300,
    '--setup-text-400': colors.lightText400,
    '--setup-border-600': colors.lightBorder600,
    '--setup-border-700': colors.lightBorder700
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  const handleCancel = () => {
    setIsAuthenticated(false);
    setIsSetupComplete(false);
  };

  const cards = [
    {
      id: 'university' as const,
      title: text.card1Title,
      desc: text.card1Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwAeMNSfmrzLZsUuXct8d28ZeZrbEBUWs_2exyCrKP76gXVhWWqwokcLG0dcfcFtH5kuLQFtFIJ0s6651Anb9NrCFF4vFXULC0zPDpv0UJU7XSUPDB6Y-2YSii0PsfRd0V6G4Qj-MmjfKdi7KBa3xkHXYeafO-qzrPbm--Y6bt-90IaAguzmqj_LtFPNIC2fL8fEZlYnu7SrvxLaTx8HT3Dmxtg7Zzf99wf9uMrFSHBVz1j2vg5fHGsODO0qn53ejQZ8FUURyIB1k',
      selectedGlow: true,
    },
    {
      id: 'service' as const,
      title: text.card2Title,
      desc: text.card2Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPFsTFAVTOfp_8SDTbaTKHLSP8ipBkXmsafmGv9ZhTLCZpEZbT_vifWuPsK7Yn423nYiL5wd47Af6tN1YsYeOcJ3TdM5ZkrP4wRegztTrhiAlCliv_qNNzI0-QEMuf4Y7-1BFWlpKJmJdEjrtdBlyJfucZn4OqgHhib7q3-6NUqMW-POEruRJUutDFnxbmBYXn-lFnmO0AgTZQwT9lX7p1XJ4M6S2RqV3RCOON1xd7CxCjmyTjscsGekx3ixK_eqODhb8XVnBZWP0',
    },
    {
      id: 'market' as const,
      title: text.card3Title,
      desc: text.card3Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwNF4p3M4FdBboj3vd6YjDS6Ds3lT2O9HO1YMz06BRbMReEQcplbUhnVW0DUhFR-9riGMtR6WBG9xuhWYrXF7s0tkY_PF5bRc16PSP9lHPLFgyiLNYmfBTg76dNIKRQMTt9I_DLLZRacibDrkmh6DNdgrzDt_1id_rsM8yd5GqWH06eubAeGfbkF95nbic8Gnklr_J4Bm1DKydsJU9F-bdpTaaL1QLCFdSYxa6XgcinAFLEPij5cDCo7j7Amte71Knc21mu8FeMxs',
    },
    {
      id: 'airport' as const,
      title: text.card4Title,
      desc: text.card4Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQUgoxiQjjLLLj7VfV6o5g-wkrX-umqCsTs9i8q094k9_QweAUq5CtV2nU7Bv66IIcvQ5bXoDWeP5ApBeiCkePz9QT-pyQWwZcS041-uYXvxYVH2Mp7W_WOXXEwAeQc12I3nXBrG1FCSuT8eUgw8mFyRlVCKFKsGOZblwh1C7JGIAoFsPaOuuu52Tj-OaBVwu-5KN6PW88-GrEkqvw5qxyFWxSTeBHscwC1-oaHJGAxslDFGNDEpUXS2aE8G49b8FrLLCZVZuFkfE',
    },
    {
      id: 'public' as const,
      title: text.card5Title,
      desc: text.card5Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYWJSBQkZ1PPBxSns5balTlB9jBej5NDGrXqq_KxNEFBtlZdsPZB_yS_OrSZD8ltcwyWLJvAe1PVNdq7Cz-eDVAllJgWUtXtahwQnUi8640174qYVgYfkSCNuLp-Cq4nqBkGqTnjFVl9PvK_Wjj2BpAH8P31kUZew6rJe8bieMTsRMSoAytKF03YYM_IBwVcQugu_op1yXnJXJKefpC0NBoHh3XzswJbDsJiaVVhXm3RVmlUATWOj3n-4nGfSZv1tuCuc-lvFUWRs',
    },
    {
      id: 'work' as const,
      title: text.card6Title,
      desc: text.card6Desc,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmz6ERVwEGMHmujuCsWg6vCkcehskIt9GQU_Vy3m_oMAXoH40795-TZjmJePqlJra8iVJ1_nnWlVeKygxUYZO7GAH9n7BcHhrehSgIVpZj284YgL_BHogcb1vJm_Lrh0cOaY_LdL7ugJOYpKd8twk4oCufpyf6MMsRBzmfud2P14JalZRxWfICJwWeAYR_lUYwtiKfsiLg7cjvCZFQTMY7utXzbx3Rag2SrfH3NU8FcpDcrkxDH-1sT0uMmm9DdO52bjGIN7dZPxA',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans antialiased font-['Inter']" style={rootStyle}>
      <style>{`
        .wizard-step {
          position: relative;
          clip-path: polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%);
          padding-left: 2rem;
        }
        .wizard-step:first-child {
          clip-path: polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%);
          padding-left: 1rem;
          border-top-left-radius: 9999px;
          border-bottom-left-radius: 9999px;
        }
        .step-active {
          background: var(--setup-step-gradient);
          color: var(--setup-step-text) !important;
          font-weight: 700;
        }
        .card-base {
          background: var(--setup-card-dark);
        }
        html:not(.dark) body { color: ${colors.textLight}; }
        html:not(.dark) .card-base {
          background: var(--setup-card-light);
        }
        html:not(.dark) .card-selected {
          background: var(--setup-selected-light);
          box-shadow: var(--setup-selected-light-shadow);
          border: 1px solid var(--setup-selected-light-border);
        }
        html:not(.dark) .text-gray-300 { color: var(--setup-text-300) !important; }
        html:not(.dark) .text-gray-400 { color: var(--setup-text-400) !important; }
        html:not(.dark) .border-gray-600 { border-color: var(--setup-border-600) !important; }
        html:not(.dark) .border-gray-700 { border-color: var(--setup-border-700) !important; }
        html:not(.dark) .card-icon {
          mix-blend-mode: normal !important;
          filter: ${colors.logoShadow};
          opacity: 1 !important;
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 lg:px-10 py-5 flex items-center justify-between border-b border-border backdrop-blur-sm bg-background/80">
        <div className="flex items-center gap-6">
          <div className="size-8 flex items-center justify-center">
            <img src="/images/Image1.png" alt="Logo" className="w-8 h-8 object-contain transform scale-[2.25] origin-center" />
          </div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {text.systemName}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-semibold tracking-widest text-muted-foreground">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={
                language === 'en'
                  ? 'text-[color:var(--setup-accent)] border-b-2 border-[color:var(--setup-accent)] pb-1 transition-all'
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
                  ? 'text-[color:var(--setup-accent)] border-b-2 border-[color:var(--setup-accent)] pb-1 transition-all'
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
            className="flex items-center justify-center rounded-lg h-9 w-9 border border-[color:var(--setup-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ '--setup-border': isDark ? colors.headerBorderDark : colors.headerBorderLight } as React.CSSProperties}
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-[color:var(--setup-icon)]" style={{ '--setup-icon': isDark ? colors.headerIconDark : colors.headerIconLight } as React.CSSProperties} />
            ) : (
              <Sun className="h-4 w-4 text-[color:var(--setup-icon)]" style={{ '--setup-icon': isDark ? colors.headerIconDark : colors.headerIconLight } as React.CSSProperties} />
            )}
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pt-24">
        <header className="text-center space-y-2">
          <h1
            className="text-2xl md:text-3xl font-bold tracking-wide text-[color:var(--setup-title)] drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: text.wizTitleHTML }}
          />
        </header>

       

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
          {cards.map((card) => {
            const isSelected = selected === card.id;
            return (
              <article
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelected(card.id);
                }}
                className={`relative rounded-xl p-6 cursor-pointer transition-transform hover:scale-[1.01] card-base ${
                  isSelected ? 'card-selected' : 'border border-gray-700 hover:border-gray-500 card-unselected'
                }`}
                style={
                  isSelected
                    ? isDark
                      ? {
                          background: colors.selectedCardDark,
                          boxShadow: colors.selectedCardDarkShadow,
                          border: `1px solid ${colors.selectedCardDarkBorder}`,
                        }
                      : {
                          background: colors.selectedCardLight,
                          boxShadow: colors.selectedCardLightShadow,
                          border: `1px solid ${colors.selectedCardLightBorder}`,
                        }
                    : undefined
                }
              >
                <div className="h-full flex flex-col justify-start items-start text-left gap-4">
                  <div className="w-12 h-12 mb-4">
                    <img
                      alt={`${card.title} Icon`}
                      className={`card-icon w-full h-full object-contain ${
                        isDark
                          ? isSelected
                            ? 'filter drop-shadow-[0_0_5px_var(--setup-selected-shadow)] mix-blend-screen'
                            : 'opacity-80 mix-blend-screen'
                          : 'opacity-90'
                      }`}
                      style={
                        isSelected && isDark
                          ? ({ '--setup-selected-shadow': colors.selectedCardDarkShadow } as React.CSSProperties)
                          : undefined
                      }
                      src={card.img}
                    />
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      isSelected ? 'text-[color:var(--setup-foreground)]' : 'text-[color:var(--setup-title)]'
                    }`}
                  >
                    <span className="text-[color:var(--setup-title)]">{card.title}</span>
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="w-full flex justify-center gap-6 mt-8 mb-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-10 py-3 rounded-lg text-white font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none hover:bg-[color:var(--setup-cancel-hover)]"
            style={{
              backgroundColor: colors.actionCancel,
              '--setup-cancel-hover': colors.actionCancelHover,
              '--setup-offset': isDark ? colors.focusOffsetDark : colors.focusOffsetLight
            } as React.CSSProperties}
          >
            {text.cancel}
          </button>
          <button
            type="button"
            onClick={() => onComplete(selected)}
            className="px-12 py-3 rounded-lg text-[color:var(--setup-button-text)] font-bold shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none hover:brightness-110"
            style={{
              background: colors.stepActiveGradient,
              '--setup-offset': isDark ? colors.focusOffsetDark : colors.focusOffsetLight
            } as React.CSSProperties}
          >
            {text.next}
          </button>
        </footer>
      </main>
    </div>
  );
};
