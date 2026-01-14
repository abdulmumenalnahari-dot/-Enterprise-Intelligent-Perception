import React, { useEffect, useMemo, useState } from 'react';
import { Video, Plus, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { baseColors, setupConfigColors } from '../theme';
import { isNonEmpty } from '../utils/validation';

type EnvironmentId = 'university' | 'service' | 'market' | 'airport' | 'public' | 'work';

const copy = {
  en: {
    systemName: 'Enterprise Intelligent Perception',
    setupWizard: 'Setup Wizard',
    step: 'Step',
    of: 'of',
    chooseEnvironment: 'Choose Environment',
    chooseEnvironmentDesc: 'Select the environment type to optimize monitoring settings',
    addCameras: 'Add Cameras',
    addCamerasDesc: 'Add and configure camera feeds for monitoring',
    addCamera: 'Add Camera',
    cameraName: 'Camera Name',
    location: 'Location',
    setSensitivity: 'Set Sensitivity',
    setSensitivityDesc: 'Adjust the sensitivity level for alert detection',
    privacyCompliance: 'Privacy & Compliance',
    privacyComplianceDesc: 'Configure privacy and data retention settings',
    faceBlur: 'Face Blur',
    faceBlurDesc: 'Automatically blur faces for privacy.',
    saveVideo: 'Save Video',
    saveVideoDesc: 'Store recordings for audits and reviews.',
    retentionDays: 'Retention Days',
    notificationSettings: 'Notification Settings',
    notificationSettingsDesc: 'Configure how you want to receive alerts',
    soundAlerts: 'Sound Alerts',
    channels: 'Channels',
    email: 'Email',
    sms: 'SMS',
    inApp: 'In-app',
    setupComplete: 'Setup Complete',
    setupCompleteDesc: 'Your system is ready to start monitoring.',
    profile: 'Profile',
    cameras: 'Cameras',
    privacy: 'Privacy',
    alerts: 'Alerts',
    on: 'On',
    off: 'Off',
    back: 'Back',
    continue: 'Continue',
    startMonitoring: 'Start Monitoring',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    sensitivityLow: 'Less sensitive alerts, fewer interruptions.',
    sensitivityMedium: 'Balanced sensitivity for daily operations.',
    sensitivityHigh: 'High sensitivity for strict monitoring.',
    online: 'Online',
    offline: 'Offline',
    environments: {
      university: 'University',
      service: 'Service Center',
      market: 'Supermarket',
      airport: 'Airport',
      public: 'Public Market',
      work: 'Workplace',
    },
  },
  ar: {
    systemName: 'الإدراك المؤسسي الذكي',
    setupWizard: 'معالج الإعداد',
    step: 'الخطوة',
    of: 'من',
    chooseEnvironment: 'اختر البيئة',
    chooseEnvironmentDesc: 'اختر نوع البيئة لتحسين إعدادات المراقبة',
    addCameras: 'إضافة كاميرات',
    addCamerasDesc: 'أضف واضبط مصادر الكاميرات للمراقبة',
    addCamera: 'إضافة كاميرا',
    cameraName: 'اسم الكاميرا',
    location: 'الموقع',
    setSensitivity: 'ضبط الحساسية',
    setSensitivityDesc: 'تحكم في حساسية التنبيهات',
    privacyCompliance: 'الخصوصية والامتثال',
    privacyComplianceDesc: 'اضبط إعدادات الخصوصية ومدة الاحتفاظ بالبيانات',
    faceBlur: 'تمويه الوجوه',
    faceBlurDesc: 'تمويه الوجوه تلقائياً لحماية الخصوصية.',
    saveVideo: 'حفظ الفيديو',
    saveVideoDesc: 'تخزين التسجيلات للمراجعات والتدقيق.',
    retentionDays: 'أيام الاحتفاظ',
    notificationSettings: 'إعدادات الإشعارات',
    notificationSettingsDesc: 'حدد طريقة استلام التنبيهات',
    soundAlerts: 'تنبيهات صوتية',
    channels: 'القنوات',
    email: 'البريد الإلكتروني',
    sms: 'رسائل SMS',
    inApp: 'داخل التطبيق',
    setupComplete: 'اكتمل الإعداد',
    setupCompleteDesc: 'النظام جاهز لبدء المراقبة.',
    profile: 'الملف',
    cameras: 'الكاميرات',
    privacy: 'الخصوصية',
    alerts: 'التنبيهات',
    on: 'تشغيل',
    off: 'إيقاف',
    back: 'رجوع',
    continue: 'متابعة',
    startMonitoring: 'بدء المراقبة',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالٍ',
    sensitivityLow: 'تنبيهات أقل مع تقليل المقاطعات.',
    sensitivityMedium: 'حساسية متوازنة للعمليات اليومية.',
    sensitivityHigh: 'حساسية عالية للمراقبة الدقيقة.',
    online: 'متصل',
    offline: 'غير متصل',
    environments: {
      university: 'جامعة',
      service: 'مركز خدمات',
      market: 'سوبرماركت',
      airport: 'مطار',
      public: 'سوق عام',
      work: 'مكان العمل',
    },
  },
};


export function SetupConfigurationWizard({
  profileId,
  onBack,
  onComplete,
}: {
  profileId: string | null;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { language, setLanguage, theme, setTheme, setSelectedProfile, setCameraCount } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [environment, setEnvironment] = useState<EnvironmentId | ''>('');
  const [cameras, setCameras] = useState<Array<{ name: string; location: string; status: 'online' | 'offline'; sensitivity: number }>>([]);
  const [faceBlur, setFaceBlur] = useState(true);
  const [saveVideo, setSaveVideo] = useState(false);
  const [retentionDays, setRetentionDays] = useState([30]);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [showCameraErrors, setShowCameraErrors] = useState(false);

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const colors = setupConfigColors;
  const text = useMemo(() => copy[isRTL ? 'ar' : 'en'], [isRTL]);
  const rootStyle: React.CSSProperties = {
    color: isDark ? baseColors.white : colors.text,
    background: 'var(--background)',
    fontFamily: isRTL ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
    '--setup-accent': colors.accent,
    '--setup-accent-soft': colors.accentSoft,
    '--setup-accent-soft-alt': colors.accentSoftAlt,
    '--setup-accent-border': colors.accentBorder,
    '--setup-surface': isDark ? colors.surfaceDark : colors.surfaceLight,
    '--setup-input-bg': isDark ? colors.inputDark : colors.inputLight,
    '--setup-border': isDark ? colors.borderDark : colors.borderLight,
    '--setup-placeholder': isDark ? colors.placeholderDark : colors.placeholderLight,
    '--setup-switch-off': isDark ? colors.sliderInactive : colors.switchOffLight,
    '--setup-switch-thumb': colors.sliderThumb,
    '--setup-slider-shadow': colors.sliderShadow,
    '--setup-button-shadow': colors.buttonShadow,
    '--setup-header-border': isDark ? colors.headerBorderDark : colors.headerBorderLight,
    '--setup-header-icon': isDark ? colors.headerIconDark : colors.headerIconLight,
    '--setup-muted-label': isDark ? colors.mutedLabelDark : colors.mutedLabelLight,
    '--setup-foreground': isDark ? baseColors.white : colors.text,
    '--setup-button-text': colors.text,
    '--setup-back-bg': colors.backButtonBg,
    '--setup-back-hover': colors.backButtonHover,
    '--setup-back-text': colors.backButtonText,
    '--setup-summary-bg': isDark ? colors.summaryTileDark : colors.summaryTileLight
  } as React.CSSProperties;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  useEffect(() => {
    if (!environment && profileId) {
      const normalized = profileId as EnvironmentId;
      setEnvironment(normalized);
      setSelectedProfile(normalized);
    }
  }, [environment, profileId, setSelectedProfile]);

  useEffect(() => {
    setCameraCount(cameras.length);
  }, [cameras.length, setCameraCount]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const addCamera = () => {
    setCameras((prev) => [
      ...prev,
      { name: '', location: '', status: 'online', sensitivity: 50 },
    ]);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const hasInvalid = cameras.some((camera) => !isNonEmpty(camera.name) || !isNonEmpty(camera.location));
      if (hasInvalid) {
        setShowCameraErrors(true);
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased" style={rootStyle} dir={isRTL ? 'rtl' : 'ltr'}>
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
            className="flex items-center justify-center rounded-lg h-9 w-9 border border-[color:var(--setup-header-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-[color:var(--setup-header-icon)]" />
            ) : (
              <Sun className="h-4 w-4 text-[color:var(--setup-header-icon)]" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-4xl">
          <style>{`
            .setup-progress[data-slot="progress"] {
              background-color: rgba(120, 120, 120, 0.32);
            }
            .dark .setup-progress[data-slot="progress"] {
              background-color: rgba(255, 255, 255, 0.22);
            }
            .setup-progress [data-slot="progress-indicator"] {
              background-color: var(--setup-accent);
            }
            .gold-switch[data-slot="switch"] {
              border-color: var(--setup-accent-border);
            }
            .gold-switch[data-state="checked"] {
              background-color: var(--setup-accent);
            }
            .gold-switch[data-state="unchecked"] {
              background-color: var(--setup-switch-off);
            }
            .dark .gold-switch[data-state="unchecked"] {
              background-color: var(--setup-switch-off);
            }
            .gold-switch [data-slot="switch-thumb"] {
              background-color: var(--setup-switch-thumb);
            }
            html:not(.dark) .gold-switch [data-slot="switch-thumb"] {
              background-color: #0a1415;
            }
            .dark .gold-switch [data-slot="switch-thumb"] {
              background-color: #ffffff;
            }
            .gold-slider [data-slot="slider-track"] {
              background-color: rgba(229, 231, 235, 0.85);
            }
            .dark .gold-slider [data-slot="slider-track"] {
              background-color: rgba(255, 255, 255, 0.18);
            }
            .gold-slider [data-slot="slider-range"] {
              background-color: var(--setup-accent);
            }
            .gold-slider [data-slot="slider-thumb"] {
              border-color: var(--setup-accent);
              box-shadow: var(--setup-slider-shadow);
              background-color: #0a1415;
            }
            .dark .gold-slider [data-slot="slider-thumb"] {
              background-color: #ffffff;
            }
            .gold-checkbox[data-state="unchecked"] {
              background-color: rgba(10, 20, 21, 0.25);
              border-color: var(--setup-accent);
              box-shadow: inset 0 0 0 1px rgba(10, 20, 21, 0.25);
            }
            html:not(.dark) .gold-checkbox[data-state="unchecked"] {
              border-color: #0a1415;
            }
            .gold-checkbox[data-state="checked"] {
              background-color: var(--setup-accent);
              border-color: var(--setup-accent);
            }
          `}</style>
          <div className="mb-6 space-y-4">
            <h1 className="text-2xl font-bold text-[color:var(--setup-accent)]">{text.setupWizard}</h1>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {text.step} {currentStep} {text.of} {totalSteps}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="setup-progress" />
            </div>
          </div>

          <Card className="p-6 md:p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[color:var(--setup-foreground)]">{text.addCameras}</h2>
                  <p className="text-muted-foreground">{text.addCamerasDesc}</p>
                </div>
                <div className="space-y-4">
                  {cameras.map((camera, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-4 p-4 bg-[color:var(--setup-surface)] border border-[color:var(--setup-border)] rounded-lg"
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <Input
                          value={camera.name}
                          onChange={(e) => {
                            const newCameras = [...cameras];
                            newCameras[index].name = e.target.value;
                            setCameras(newCameras);
                            if (showCameraErrors) setShowCameraErrors(false);
                          }}
                        placeholder={language === 'ar' ? 'مثال: كاميرا المدخل' : 'e.g. Entry Camera'}
                          className="flex-1 min-w-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-[color:var(--setup-accent)] focus:border-[color:var(--setup-accent)]"
                          aria-invalid={showCameraErrors && !isNonEmpty(camera.name)}
                        />
                        <Input
                          value={camera.location}
                          onChange={(e) => {
                            const newCameras = [...cameras];
                            newCameras[index].location = e.target.value;
                            setCameras(newCameras);
                            if (showCameraErrors) setShowCameraErrors(false);
                          }}
                        placeholder={language === 'ar' ? 'مثال: الطابق الأول' : 'e.g. Floor 1'}
                          className="flex-1 min-w-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-[color:var(--setup-accent)] focus:border-[color:var(--setup-accent)]"
                          aria-invalid={showCameraErrors && !isNonEmpty(camera.location)}
                        />
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-sm">{camera.status === 'online' ? text.online : text.offline}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{text.setSensitivity}</span>
                          <span>{camera.sensitivity}%</span>
                        </div>
                        <Slider
                          value={[camera.sensitivity]}
                          onValueChange={(value) => {
                            const newCameras = [...cameras];
                            newCameras[index].sensitivity = value[0];
                            setCameras(newCameras);
                          }}
                          max={100}
                          step={1}
                          className="gold-slider"
                        />
                      </div>
                      {showCameraErrors && (!isNonEmpty(camera.name) || !isNonEmpty(camera.location)) && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {language === 'ar' ? 'يرجى إدخال اسم وموقع لكل كاميرا' : 'Please enter a name and location for each camera.'}
                        </p>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addCamera}
                    className="w-full gap-2 bg-[color:var(--setup-accent)] text-[color:var(--setup-button-text)] hover:opacity-90 shadow-[0_0_12px_var(--setup-button-shadow)]"
                  >
                    <Plus className="w-4 h-4" />
                    {text.addCamera}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[color:var(--setup-foreground)]">{text.privacyCompliance}</h2>
                  <p className="text-muted-foreground">{text.privacyComplianceDesc}</p>
                </div>
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between p-4 bg-[color:var(--setup-surface)] border border-[color:var(--setup-border)] rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base">{text.faceBlur}</Label>
                      <p className="text-sm text-muted-foreground">{text.faceBlurDesc}</p>
                    </div>
                    <Switch checked={faceBlur} onCheckedChange={setFaceBlur} className="gold-switch" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[color:var(--setup-surface)] border border-[color:var(--setup-border)] rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base">{text.saveVideo}</Label>
                      <p className="text-sm text-muted-foreground">{text.saveVideoDesc}</p>
                    </div>
                    <Switch checked={saveVideo} onCheckedChange={setSaveVideo} className="gold-switch" />
                  </div>
                  {saveVideo && (
                    <div className="space-y-4 p-4 bg-[color:var(--setup-surface)] border border-[color:var(--setup-border)] rounded-lg">
                      <Label className="text-base">
                        {text.retentionDays}: {retentionDays[0]}
                      </Label>
                      <Slider
                        value={retentionDays}
                        onValueChange={setRetentionDays}
                        max={90}
                        min={1}
                        step={1}
                        className="gold-slider"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[color:var(--setup-foreground)]">{text.notificationSettings}</h2>
                  <p className="text-muted-foreground">{text.notificationSettingsDesc}</p>
                </div>
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between p-4 bg-[color:var(--setup-surface)] border border-[color:var(--setup-border)] rounded-lg">
                    <Label className="text-base">{text.soundAlerts}</Label>
                    <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} className="gold-switch" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base">{text.channels}</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6">
                        <Checkbox
                          checked={emailAlerts}
                          onCheckedChange={(checked) => setEmailAlerts(checked as boolean)}
                          id="email"
                          className="gold-checkbox"
                        />
                        <Label htmlFor="email" className="cursor-pointer">
                          {text.email}
                        </Label>
                      </div>
                      <div className="flex items-center gap-6">
                        <Checkbox
                          checked={smsAlerts}
                          onCheckedChange={(checked) => setSmsAlerts(checked as boolean)}
                          id="sms"
                          className="gold-checkbox"
                        />
                        <Label htmlFor="sms" className="cursor-pointer">
                          {text.sms}
                        </Label>
                      </div>
                      <div className="flex items-center gap-6">
                        <Checkbox
                          checked={true}
                          disabled
                          id="inapp"
                          className="gold-checkbox"
                        />
                        <Label htmlFor="inapp" className="cursor-pointer text-black/50 dark:text-white/50">
                          {text.inApp} (Always enabled)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8 text-center py-8">
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">{text.setupComplete}</h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    {text.setupCompleteDesc}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-lg bg-[color:var(--setup-summary-bg)] border border-[color:var(--setup-accent-border)]">
                    <div className="text-2xl font-bold">{environment ? '1' : '0'}</div>
                    <div className="text-sm text-muted-foreground">{text.profile}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[color:var(--setup-summary-bg)] border border-[color:var(--setup-accent-border)]">
                    <div className="text-2xl font-bold">{cameras.length}</div>
                    <div className="text-sm text-muted-foreground">{text.cameras}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[color:var(--setup-summary-bg)] border border-[color:var(--setup-accent-border)]">
                    <div className="text-2xl font-bold">{faceBlur ? text.on : text.off}</div>
                    <div className="text-sm text-muted-foreground">{text.privacy}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[color:var(--setup-summary-bg)] border border-[color:var(--setup-accent-border)]">
                    <div className="text-2xl font-bold">{soundAlerts ? text.on : text.off}</div>
                    <div className="text-sm text-muted-foreground">{text.alerts}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/10 dark:border-white/10">
              <Button
                onClick={handleBack}
                className="bg-[color:var(--setup-back-bg)] text-[color:var(--setup-back-text)] hover:bg-[color:var(--setup-back-hover)]"
              >
                {text.back}
              </Button>
              <Button
                onClick={handleNext}
                className="bg-[color:var(--setup-accent)] text-[color:var(--setup-button-text)] hover:opacity-90 shadow-[0_0_15px_var(--setup-button-shadow)]"
              >
                {currentStep === totalSteps ? text.startMonitoring : text.continue}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
