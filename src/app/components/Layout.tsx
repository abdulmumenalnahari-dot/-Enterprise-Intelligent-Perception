import React, { ReactNode, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { layoutColors } from '../theme';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Bell,
  ArrowUp
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    setIsAuthenticated,
    setCurrentUserEmail
  } = useApp();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const colors = layoutColors;
  const layoutStyle: React.CSSProperties = {
    '--layout-accent': colors.accent,
    '--layout-border': isDark ? colors.scrollButtonBorderDark : colors.scrollButtonBorderLight,
    '--layout-icon': isDark ? colors.scrollButtonTextDark : colors.scrollButtonTextLight,
    '--layout-item-bg': isDark ? colors.sidebarItemBgDark : colors.sidebarItemBgLight,
    '--layout-active-bg': isDark ? colors.sidebarActiveBgDark : colors.sidebarActiveBgLight,
    '--layout-active-border': isDark ? colors.sidebarActiveBorderDark : colors.sidebarActiveBorderLight,
    '--layout-hover-bg': isDark ? colors.sidebarHoverBgDark : colors.sidebarHoverBgLight
  } as React.CSSProperties;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, labelKey: 'liveDashboard' as const },
    { id: 'cameraWall', icon: Camera, labelKey: 'cameraWall' as const },
    { id: 'analytics', icon: BarChart3, labelKey: 'analytics' as const },
    { id: 'alerts', icon: Bell, labelKey: 'alerts' as const },
    { id: 'reports', icon: FileText, labelKey: 'reports' as const },
    { id: 'profiles', icon: User, labelKey: 'profiles' as const },
    { id: 'settings', icon: Settings, labelKey: 'settings' as const }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex" style={layoutStyle}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 w-64 bg-card/80 backdrop-blur-xl border-border flex flex-col pt-24 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        }`}
      >

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-6 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[color:var(--layout-active-bg)] text-primary border border-[color:var(--layout-active-border)] shadow-lg shadow-primary/10'
                    : 'bg-[color:var(--layout-item-bg)] text-muted-foreground hover:text-foreground hover:bg-[color:var(--layout-hover-bg)]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{t(item.labelKey, language)}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-6 px-4 py-3 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t('logout', language)}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isRTL ? 'mr-64' : 'ml-64'}`}>
        {/* Top Bar */}
        <header
          className="fixed top-0 left-0 right-0 z-50 w-full px-6 lg:px-10 py-5 flex items-center justify-between border-b border-border backdrop-blur-sm bg-background/80"
        >
          <div className="flex items-center gap-6">
            <div className="size-8 flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL}images/Image1.png`} alt="Logo" className="w-8 h-8 object-contain transform scale-[2.25] origin-center" />
            </div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t('systemName', language)}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              <button
                onClick={() => setLanguage('en')}
                className={
                  language === 'en'
                    ? 'text-[color:var(--layout-accent)] border-b-2 border-[color:var(--layout-accent)] pb-1 transition-all'
                    : 'hover:text-foreground transition-all pb-1'
                }
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={
                  language === 'ar'
                    ? 'text-[color:var(--layout-accent)] border-b-2 border-[color:var(--layout-accent)] pb-1 transition-all'
                    : 'hover:text-foreground transition-all pb-1'
                }
              >
                AR
              </button>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-lg h-9 w-9 border border-[color:var(--layout-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-[color:var(--layout-icon)]" />
            ) : (
              <Sun className="w-4 h-4 text-[color:var(--layout-icon)]" />
            )}
          </button>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-auto px-6 lg:px-10 pt-24"
          onScroll={(e) => {
            const top = (e.currentTarget as HTMLDivElement).scrollTop;
            setShowScrollTop(top > 260);
          }}
        >
          {children}
        </main>

        {showScrollTop && (
          <button
            type="button"
            onClick={() => {
              const container = document.querySelector('main');
              if (container) {
                (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full border border-[color:var(--layout-border)] bg-[color:var(--layout-scroll-bg)] text-[color:var(--layout-scroll-text)] hover:bg-[color:var(--layout-scroll-bg)] transition-colors"
            style={{
              '--layout-scroll-bg': isDark ? colors.scrollButtonBgDark : colors.scrollButtonBgLight,
              '--layout-scroll-text': isDark ? colors.scrollButtonTextDark : colors.scrollButtonTextLight
            } as React.CSSProperties}
            aria-label={language === 'ar' ? 'العودة للأعلى' : 'Back to top'}
            title={language === 'ar' ? 'العودة للأعلى' : 'Back to top'}
          >
            <ArrowUp className="w-5 h-5 mx-auto" />
          </button>
        )}
      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="logout-confirm-dialog">
          <style>{`
            .logout-confirm-dialog > button {
              background-color: var(--destructive) !important;
              color: var(--destructive-foreground) !important;
            }
            .logout-confirm-dialog > button:hover {
              background-color: color-mix(in srgb, var(--destructive) 90%, transparent) !important;
            }
          `}</style>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'هل أنت متأكد أنك تريد تسجيل الخروج؟' : 'Are you sure you want to log out?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="bg-secondary text-foreground hover:bg-secondary/80"
            >
              {language === 'ar' ? 'لا' : 'No'}
            </Button>
            <Button
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUserEmail(null);
                try {
                  localStorage.removeItem('aura_session');
                  localStorage.setItem('aura_session_state', 'logged-out');
                } catch {
                  // ignore storage errors
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {language === 'ar' ? 'نعم' : 'Yes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
