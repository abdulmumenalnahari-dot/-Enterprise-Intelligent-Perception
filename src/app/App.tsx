import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SetupWizard } from './components/SetupWizard';
import { SetupConfigurationWizard } from './components/SetupConfigurationWizard';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CameraWall } from './components/CameraWall';
import { Analytics } from './components/Analytics';
import { Alerts } from './components/Alerts';
import { Reports } from './components/Reports';
import { Profiles } from './components/Profiles';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';

type AppState = 'splash' | 'login' | 'onboarding' | 'setup' | 'configure' | 'app';
type Page = 'dashboard' | 'cameraWall' | 'analytics' | 'alerts' | 'reports' | 'profiles' | 'settings';

function AppContent() {
  const {
    isAuthenticated,
    isSetupComplete,
    setIsAuthenticated,
    setIsSetupComplete,
    selectedProfile,
    setSelectedProfile,
    setCameraCount,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    setCurrentUserEmail,
    currentUserEmail
  } = useApp();
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    try {
      const stored = localStorage.getItem('aura_last_page');
      if (stored) return stored as Page;
    } catch {
      // ignore storage errors
    }
    return 'dashboard';
  });
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    if (!hasShownSplash) {
      setAppState('splash');
      return;
    }

    // Determine app state based on authentication and setup
    if (!isAuthenticated) {
      setAppState('login');
      setSelectedProfile(null);
      setCameraCount(0);
    } else if (!hasSeenOnboarding) {
      setAppState('onboarding');
    } else if (!isSetupComplete) {
      setAppState(selectedProfile ? 'configure' : 'setup');
    } else {
      setAppState('app');
    }
  }, [hasShownSplash, hasSeenOnboarding, isAuthenticated, isSetupComplete, selectedProfile]);

  useEffect(() => {
    if (!currentUserEmail) return;
    try {
      const stored = localStorage.getItem(`aura_last_page:${currentUserEmail}`);
      if (stored) {
        setCurrentPage(stored as Page);
      }
    } catch {
      // ignore storage errors
    }
  }, [currentUserEmail]);

  const handleSplashComplete = () => {
    setHasShownSplash(true);
  };

  const handleLogin = (email: string) => {
    const normalized = email.trim().toLowerCase();
    setCurrentUserEmail(normalized);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('aura_session', JSON.stringify({ email: normalized }));
      localStorage.setItem('aura_session_state', 'logged-in');
    } catch {
      // ignore storage errors
    }
  };

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  const handleNavigate = (page: string) => {
    const nextPage = page as Page;
    setCurrentPage(nextPage);
    if (!currentUserEmail) return;
    try {
      localStorage.setItem(`aura_last_page:${currentUserEmail}`, nextPage);
      localStorage.setItem('aura_last_page', nextPage);
    } catch {
      // ignore storage errors
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'cameraWall':
        return <CameraWall />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      case 'profiles':
        return <Profiles />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (appState === 'setup') {
    return <SetupWizard onComplete={(profileId) => setSelectedProfile(profileId)} />;
  }

  if (appState === 'configure') {
    return (
      <SetupConfigurationWizard
        profileId={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onComplete={handleSetupComplete}
      />
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}
