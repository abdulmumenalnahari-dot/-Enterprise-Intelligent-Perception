import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Palette, Type, Accessibility, Save, RotateCcw, ShieldCheck, UserPlus, KeyRound, Mail } from 'lucide-react';
import { defaultCustomTheme, setupConfigColors, setupWizardColors } from '../theme';

type Role = 'admin' | 'operator' | 'viewer';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
};

export const Settings: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    colorPreset,
    setColorPreset,
    customTheme,
    setCustomTheme,
    appearanceSaved,
    saveAppearanceSettings,
    restoreAppearanceDefaults,
    fontSize,
    setFontSize,
    contrastMode,
    setContrastMode,
    stateColors,
    isSetupComplete,
    hasSeenOnboarding,
    selectedProfile,
    cameraCount,
    currentUserEmail,
    setCurrentUserEmail
  } = useApp();

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const [accountEmail, setAccountEmail] = useState(currentUserEmail ?? 'admin@aura-a.io');
  const [emailStatus, setEmailStatus] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  const [users, setUsers] = useState<UserRecord[]>([
    { id: 'U-001', name: 'Admin', email: 'admin@aura-a.io', role: 'admin', status: 'active' },
    { id: 'U-002', name: 'Operations', email: 'ops@aura-a.io', role: 'operator', status: 'active' },
    { id: 'U-003', name: 'Viewer', email: 'viewer@aura-a.io', role: 'viewer', status: 'suspended' }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('viewer');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('viewer');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [sendInvite, setSendInvite] = useState(true);
  const [userStatus, setUserStatus] = useState('');
  const [appearanceStatus, setAppearanceStatus] = useState('');
  const [showCustomControls, setShowCustomControls] = useState(appearanceSaved?.colorPreset === 'custom');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const safeTheme = {
    primary: customTheme?.primary ?? defaultCustomTheme.primary,
    accent: customTheme?.accent ?? defaultCustomTheme.accent,
    background: customTheme?.background ?? defaultCustomTheme.background,
    card: customTheme?.card ?? defaultCustomTheme.card
  };
  const savedAppearance = appearanceSaved ?? {
    colorPreset: 'default',
    customTheme: safeTheme
  };
  const isAppearanceDirty =
    savedAppearance.colorPreset !== colorPreset ||
    savedAppearance.customTheme.primary !== safeTheme.primary ||
    savedAppearance.customTheme.accent !== safeTheme.accent ||
    savedAppearance.customTheme.background !== safeTheme.background ||
    savedAppearance.customTheme.card !== safeTheme.card;

  const switchStyle = {
    '--settings-switch-off': isDark ? setupConfigColors.sliderInactive : setupConfigColors.switchOffLight,
    '--settings-switch-border': setupConfigColors.accentBorder,
    '--settings-switch-on': setupConfigColors.accent,
    '--settings-switch-thumb': setupConfigColors.sliderThumb,
    '--settings-neutral-bg': setupWizardColors.actionCancel,
    '--settings-neutral-hover': setupWizardColors.actionCancelHover,
    '--settings-neutral-text': setupWizardColors.actionCancelText
  } as React.CSSProperties;

  React.useEffect(() => {
    if (currentUserEmail) {
      setAccountEmail(currentUserEmail);
    }
  }, [currentUserEmail]);

  React.useEffect(() => {
    if (appearanceSaved?.colorPreset === 'custom' && colorPreset === 'custom') {
      setShowCustomControls(true);
    }
  }, [appearanceSaved?.colorPreset, colorPreset]);

  const fontSizeValue = {
    small: 14,
    medium: 16,
    large: 18,
    extraLarge: 20
  }[fontSize];

  const handleFontSizeChange = (value: number[]) => {
    const size = value[0];
    if (size <= 14) setFontSize('small');
    else if (size <= 16) setFontSize('medium');
    else if (size <= 18) setFontSize('large');
    else setFontSize('extraLarge');
  };

  const handleSaveEmail = () => {
    const nextEmail = accountEmail.trim().toLowerCase();
    if (!isValidEmail(nextEmail)) {
      setEmailStatus(isRTL ? 'بريد غير صالح' : 'Invalid email');
      return;
    }
    if (currentUserEmail && nextEmail !== currentUserEmail) {
      const payload = {
        language,
        theme,
        colorPreset: savedAppearance.colorPreset,
        customTheme: savedAppearance.customTheme,
        appearanceSaved: savedAppearance,
        fontSize,
        contrastMode,
        isSetupComplete,
        hasSeenOnboarding,
        selectedProfile,
        cameraCount
      };
      localStorage.setItem(`aura_user:${nextEmail}`, JSON.stringify(payload));
      setCurrentUserEmail(nextEmail);
    }
    setEmailStatus(isRTL ? 'تم تحديث البريد الإلكتروني' : 'Email updated');
  };

  const handleSavePassword = () => {
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      setPasswordStatus(isRTL ? 'تحقق من الحقول وكلمة المرور' : 'Please verify password fields');
      return;
    }
    setPasswordStatus(isRTL ? 'تم تحديث كلمة المرور' : 'Password updated');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const startEdit = (user: UserRecord) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const saveEdit = () => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingId
          ? { ...user, name: editName, email: editEmail, role: editRole }
          : user
      )
    );
    setEditingId(null);
  };

  const addUser = () => {
    if (!newUserName || !newUserEmail) {
      setUserStatus(isRTL ? 'يرجى إدخال الاسم والبريد' : 'Please provide name and email');
      return;
    }
    const newRecord: UserRecord = {
      id: `U-${(users.length + 1).toString().padStart(3, '0')}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'active'
    };
    setUsers((prev) => [newRecord, ...prev]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setUserStatus(isRTL ? 'تمت إضافة المستخدم' : 'User added');
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
          : user
      )
    );
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className="space-y-6" style={switchStyle}>
      <style>{`
        .settings-switch[data-slot="switch"] {
          border-color: var(--settings-switch-border);
        }
        .settings-switch[data-state="checked"] {
          background-color: var(--settings-switch-on);
        }
        .settings-switch[data-state="unchecked"] {
          background-color: var(--settings-switch-off);
        }
        .dark .settings-switch[data-state="unchecked"] {
          background-color: var(--settings-switch-off);
        }
        .settings-switch [data-slot="switch-thumb"] {
          background-color: var(--settings-switch-thumb);
        }
      `}</style>
      {/* Account & Security */}
      <Card className="bg-card/80 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{isRTL ? 'الحساب والأمان' : 'Account & Security'}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="w-4 h-4" />
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </div>
            <Input
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="bg-card/80 border-border text-foreground"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSaveEmail} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isRTL ? 'تحديث البريد' : 'Update Email'}
              </Button>
              {emailStatus && <span className="text-muted-foreground text-sm">{emailStatus}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <KeyRound className="w-4 h-4" />
              {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
            </div>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={isRTL ? 'كلمة المرور الحالية' : 'Current password'}
              className="bg-card/80 border-border text-foreground"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={isRTL ? 'كلمة مرور جديدة' : 'New password'}
              className="bg-card/80 border-border text-foreground"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={isRTL ? 'تأكيد كلمة المرور' : 'Confirm password'}
              className="bg-card/80 border-border text-foreground"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSavePassword} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isRTL ? 'تحديث كلمة المرور' : 'Update Password'}
              </Button>
              {passwordStatus && <span className="text-muted-foreground text-sm">{passwordStatus}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* User Management */}
      <Card className="bg-card/80 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{isRTL ? 'إدارة المستخدمين' : 'User Management'}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Input
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder={isRTL ? 'اسم المستخدم' : 'User name'}
            className="bg-card/80 border-border text-foreground"
          />
          <Input
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder={isRTL ? 'البريد الإلكتروني' : 'Email address'}
            className="bg-card/80 border-border text-foreground"
          />
          <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as Role)}>
            <SelectTrigger className="bg-card/80 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{isRTL ? 'مدير' : 'Admin'}</SelectItem>
              <SelectItem value="operator">{isRTL ? 'مشغل' : 'Operator'}</SelectItem>
              <SelectItem value="viewer">{isRTL ? 'مشاهد' : 'Viewer'}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            placeholder={isRTL ? 'كلمة مرور مؤقتة' : 'Temporary password'}
            className="bg-card/80 border-border text-foreground"
          />
          <div className="flex items-center gap-3">
            <Switch checked={sendInvite} onCheckedChange={setSendInvite} className="settings-switch" />
            <span className="text-muted-foreground text-sm">
              {isRTL ? 'إرسال دعوة بالبريد' : 'Send invite email'}
            </span>
          </div>
          <Button onClick={addUser} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isRTL ? 'إضافة مستخدم' : 'Add User'}
          </Button>
          {userStatus && <span className="text-muted-foreground text-sm">{userStatus}</span>}
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 bg-secondary/50 border border-border rounded-lg p-4">
              <div className="space-y-1">
                {editingId === user.id ? (
                  <div className="flex flex-col gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-card/80 border-border text-foreground" />
                    <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-card/80 border-border text-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="text-foreground font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-sm">{user.email}</div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                {editingId === user.id ? (
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as Role)}>
                    <SelectTrigger className="bg-card/80 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{isRTL ? 'مدير' : 'Admin'}</SelectItem>
                      <SelectItem value="operator">{isRTL ? 'مشغل' : 'Operator'}</SelectItem>
                      <SelectItem value="viewer">{isRTL ? 'مشاهد' : 'Viewer'}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {user.role}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={user.status === 'active' ? 'border-[color:var(--chart-4)] text-[color:var(--chart-4)]' : 'border-[color:var(--chart-5)] text-[color:var(--chart-5)]'}
                >
                  {user.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معلّق' : 'Suspended')}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {editingId === user.id ? (
                  <>
                    <Button variant="outline" onClick={saveEdit} className="border-border text-foreground hover:bg-secondary">
                      {isRTL ? 'حفظ' : 'Save'}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => startEdit(user)} className="border-border text-foreground hover:bg-secondary">
                      {isRTL ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="outline" onClick={() => toggleUserStatus(user.id)} className="border-border text-foreground hover:bg-secondary">
                      {user.status === 'active' ? (isRTL ? 'إيقاف' : 'Suspend') : (isRTL ? 'تفعيل' : 'Activate')}
                    </Button>
                    <Button variant="outline" onClick={() => removeUser(user.id)} className="border-destructive/60 text-destructive hover:bg-destructive/10">
                      {isRTL ? 'حذف' : 'Delete'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* General Settings */}
      <Card className="bg-card/80 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('general', language)}</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">{t('language', language)}</Label>
              <p className="text-muted-foreground text-sm mt-1">
                {language === 'ar' ? 'اختر لغة الواجهة' : 'Choose interface language'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-2 rounded-lg transition-all bg-[color:var(--settings-neutral-bg)] text-[color:var(--settings-neutral-text)] hover:bg-[color:var(--settings-neutral-hover)] ${
                  language === 'ar' ? 'ring-2 ring-[color:var(--settings-neutral-hover)]' : ''
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg transition-all bg-[color:var(--settings-neutral-bg)] text-[color:var(--settings-neutral-text)] hover:bg-[color:var(--settings-neutral-hover)] ${
                  language === 'en' ? 'ring-2 ring-[color:var(--settings-neutral-hover)]' : ''
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">{t('theme', language)}</Label>
              <p className="text-muted-foreground text-sm mt-1">
                {language === 'ar' ? 'تبديل بين الوضع الفاتح والداكن' : 'Toggle between light and dark mode'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('lightMode', language)}
              </span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                className="settings-switch"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('darkMode', language)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="bg-card/80 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('appearance', language)}</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-foreground mb-3 block">{t('colorPreset', language)}</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setColorPreset('default');
                  setShowCustomControls(false);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  colorPreset === 'default'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-green-500" />
                  <div className="w-6 h-6 rounded bg-blue-500" />
                  <div className="w-6 h-6 rounded bg-orange-500" />
                </div>
                <p className="text-foreground text-sm font-medium">{t('default', language)}</p>
              </button>

              <button
                onClick={() => {
                  setColorPreset('gold');
                  setShowCustomControls(false);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  colorPreset === 'gold'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-yellow-400" />
                  <div className="w-6 h-6 rounded bg-amber-500" />
                  <div className="w-6 h-6 rounded bg-orange-600" />
                </div>
                <p className="text-foreground text-sm font-medium">{t('gold', language)}</p>
              </button>

              <button
                onClick={() => {
                  setColorPreset('highContrast');
                  setShowCustomControls(false);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  colorPreset === 'highContrast'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-lime-400" />
                  <div className="w-6 h-6 rounded bg-cyan-400" />
                  <div className="w-6 h-6 rounded bg-yellow-300" />
                </div>
                <p className="text-foreground text-sm font-medium">{t('highContrast', language)}</p>
              </button>

              <button
                onClick={() => setShowCustomControls(true)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  colorPreset === 'custom'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-400 to-pink-600" />
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600" />
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-400 to-red-600" />
                </div>
                <p className="text-foreground text-sm font-medium">{t('custom', language)}</p>
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {showCustomControls && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">{language === 'ar' ? 'تخصيص الألوان' : 'Custom Colors'}</Label>
                <p className="text-muted-foreground text-sm mt-1">
                  {language === 'ar' ? 'تعديل الألوان في الوقت الفعلي' : 'Live update interface colors'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCustomControls(true)}
                className="border border-transparent bg-[color:var(--settings-neutral-bg)] text-[color:var(--settings-neutral-text)] hover:bg-[color:var(--settings-neutral-hover)]"
              >
                {language === 'ar' ? 'تفعيل' : 'Enable'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
                <div>
                  <Label className="text-foreground">{language === 'ar' ? 'اللون الأساسي' : 'Primary'}</Label>
                  <p className="text-muted-foreground text-xs mt-1">{safeTheme.primary}</p>
                </div>
                <input
                  type="color"
                  value={safeTheme.primary}
                  onChange={(e) => {
                    setShowCustomControls(true);
                    setColorPreset('custom');
                    setCustomTheme({ ...safeTheme, primary: e.target.value });
                  }}
                  aria-label={language === 'ar' ? 'اللون الأساسي' : 'Primary color'}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
                <div>
                  <Label className="text-foreground">{language === 'ar' ? 'لون التمييز' : 'Accent'}</Label>
                  <p className="text-muted-foreground text-xs mt-1">{safeTheme.accent}</p>
                </div>
                <input
                  type="color"
                  value={safeTheme.accent}
                  onChange={(e) => {
                    setShowCustomControls(true);
                    setColorPreset('custom');
                    setCustomTheme({ ...safeTheme, accent: e.target.value });
                  }}
                  aria-label={language === 'ar' ? 'لون التمييز' : 'Accent color'}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
                <div>
                  <Label className="text-foreground">{language === 'ar' ? 'لون الخلفية' : 'Background'}</Label>
                  <p className="text-muted-foreground text-xs mt-1">{safeTheme.background}</p>
                </div>
                <input
                  type="color"
                  value={safeTheme.background}
                  onChange={(e) => {
                    setShowCustomControls(true);
                    setColorPreset('custom');
                    setCustomTheme({ ...safeTheme, background: e.target.value });
                  }}
                  aria-label={language === 'ar' ? 'لون الخلفية' : 'Background color'}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
                <div>
                  <Label className="text-foreground">{language === 'ar' ? 'لون البطاقات' : 'Card'}</Label>
                  <p className="text-muted-foreground text-xs mt-1">{safeTheme.card}</p>
                </div>
                <input
                  type="color"
                  value={safeTheme.card}
                  onChange={(e) => {
                    setShowCustomControls(true);
                    setColorPreset('custom');
                    setCustomTheme({ ...safeTheme, card: e.target.value });
                  }}
                  aria-label={language === 'ar' ? 'لون البطاقات' : 'Card color'}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
              </div>
            </div>
          </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                saveAppearanceSettings();
                setAppearanceStatus(isRTL ? 'تم حفظ الثيم' : 'Theme saved');
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isAppearanceDirty}
            >
              {isRTL ? 'حفظ الثيم' : 'Save Theme'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                restoreAppearanceDefaults();
                setAppearanceStatus(isRTL ? 'تمت العودة للوضع الافتراضي' : 'Restored to default');
              }}
              className="border border-transparent bg-[color:var(--settings-neutral-bg)] text-[color:var(--settings-neutral-text)] hover:bg-[color:var(--settings-neutral-hover)]"
            >
              {isRTL ? 'الافتراضي' : 'Default'}
            </Button>
            {appearanceStatus && (
              <span className="text-muted-foreground text-sm">{appearanceStatus}</span>
            )}
          </div>

          <div>
            <Label className="text-foreground mb-3 block">{t('fontSize', language)}</Label>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm w-12">{fontSizeValue}px</span>
              <Slider
                value={[fontSizeValue]}
                min={14}
                max={20}
                step={1}
                onValueChange={handleFontSizeChange}
                className="flex-1"
              />
              <div className="flex gap-2">
                <span className={`text-xs ${fontSize === 'small' ? 'text-primary' : 'text-muted-foreground'}`}>A</span>
                <span className={`text-sm ${fontSize === 'medium' ? 'text-primary' : 'text-muted-foreground'}`}>A</span>
                <span className={`text-base ${fontSize === 'large' ? 'text-primary' : 'text-muted-foreground'}`}>A</span>
                <span className={`text-lg ${fontSize === 'extraLarge' ? 'text-primary' : 'text-muted-foreground'}`}>A</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility */}
      <Card className="bg-card/80 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[color:var(--chart-4)]/15 rounded-lg flex items-center justify-center">
            <Accessibility className="w-5 h-5 text-[color:var(--chart-4)]" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('accessibility', language)}</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">{language === 'ar' ? 'وضع التباين العالي' : 'High Contrast Mode'}</Label>
              <p className="text-muted-foreground text-sm mt-1">
                {language === 'ar' ? 'تحسين الرؤية للمستخدمين ضعاف البصر' : 'Improve visibility for users with low vision'}
              </p>
            </div>
            <Switch
              checked={contrastMode === 'high'}
              onCheckedChange={(checked) => setContrastMode(checked ? 'high' : 'normal')}
              className="settings-switch"
            />
          </div>

          <div className="h-px bg-border" />

          <div className="bg-secondary/60 border border-border rounded-lg p-4">
            <h4 className="text-foreground font-medium mb-2">
              {language === 'ar' ? 'معاينة الألوان الحالية' : 'Current Color Preview'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">{t('satisfaction', language)}</p>
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.satisfaction.high }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.satisfaction.medium }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.satisfaction.low }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">{t('attention', language)}</p>
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.attention.high }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.attention.medium }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.attention.low }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">{t('stress', language)}</p>
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.stress.low }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.stress.medium }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: stateColors.stress.high }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {t('save', language)}
        </Button>
        <Button className="bg-[color:var(--settings-neutral-bg)] text-[color:var(--settings-neutral-text)] hover:bg-[color:var(--settings-neutral-hover)]">
          <RotateCcw className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
        </Button>
      </div>
    </div>
  );
};
