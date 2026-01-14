import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Alert as AlertType } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, Clock, Camera, User, Shield, Activity, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const Alerts: React.FC = () => {
  const { language, stateColors } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [todayOnly, setTodayOnly] = useState(false);

  type AlertMeta = AlertType & {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    acknowledgedAt?: Date;
  };

  const [alerts, setAlerts] = useState<AlertMeta[]>(() => generateAlerts());

  const handleAcknowledge = (id: string) => {
    const now = new Date();
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true, acknowledgedAt: now } : alert
      )
    );
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active' && alert.acknowledged) return false;
    if (filter === 'acknowledged' && !alert.acknowledged) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    const dateRef = filter === 'acknowledged' ? (alert.acknowledgedAt ?? alert.timestamp) : alert.timestamp;
    if (todayOnly && !isToday(dateRef)) return false;
    return true;
  });

  const alertCounts = useMemo(() => ({
    active: alerts.filter((a) => !a.acknowledged).length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    acknowledged: alerts.filter((a) => a.acknowledged).length
  }), [alerts]);

  const applyQuickFilter = (nextFilter: 'all' | 'active' | 'acknowledged', severity: typeof severityFilter, onlyToday: boolean) => {
    setFilter(nextFilter);
    setSeverityFilter(severity);
    setTodayOnly(onlyToday);
  };

  const displayAlerts = useMemo(
    () =>
      filteredAlerts
        .slice()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .map(alert => ({
          ...alert,
          title: language === 'ar' ? alert.titleAr : alert.titleEn,
          description: language === 'ar' ? alert.descriptionAr : alert.descriptionEn
        })),
    [filteredAlerts, language]
  );

  const groupedAlerts = useMemo(() => {
    const groups: Record<string, AlertType[]> = {};
    displayAlerts.forEach(alert => {
      const key = formatDayHeader(alert.timestamp, language);
      if (!groups[key]) groups[key] = [];
      groups[key].push(alert);
    });
    return groups;
  }, [displayAlerts, language]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Shield className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Activity className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return stateColors.risk.critical;
      case 'high':
        return stateColors.risk.high;
      case 'medium':
        return stateColors.risk.medium;
      default:
        return stateColors.risk.low;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return Shield;
      case 'behavior':
        return User;
      case 'system':
        return Camera;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="bg-card/80 border-border p-4 cursor-pointer hover:border-primary/40 transition-all"
          onClick={() => applyQuickFilter('active', 'all', false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('activeAlerts', language)}</p>
              <p className="text-2xl font-bold text-foreground">
                {alertCounts.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-destructive/15 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card
          className="bg-card/80 border-border p-4 cursor-pointer hover:border-primary/40 transition-all"
          onClick={() => applyQuickFilter('all', 'critical', false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{language === 'ar' ? 'حرج' : 'Critical'}</p>
              <p className="text-2xl font-bold text-destructive">
                {alertCounts.critical}
              </p>
            </div>
            <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card
          className="bg-card/80 border-border p-4 cursor-pointer hover:border-primary/40 transition-all"
          onClick={() => applyQuickFilter('all', 'high', false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{language === 'ar' ? 'عالي' : 'High'}</p>
              <p className="text-2xl font-bold text-[color:var(--chart-5)]">
                {alertCounts.high}
              </p>
            </div>
            <div className="w-12 h-12 bg-[color:var(--chart-5)]/15 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[color:var(--chart-5)]" />
            </div>
          </div>
        </Card>

        <Card
          className="bg-card/80 border-border p-4 cursor-pointer hover:border-primary/40 transition-all"
          onClick={() => applyQuickFilter('acknowledged', 'all', false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{language === 'ar' ? 'تمت المعالجة' : 'Acknowledged'}</p>
              <p className="text-2xl font-bold text-[color:var(--chart-4)]">
                {alertCounts.acknowledged}
              </p>
            </div>
            <div className="w-12 h-12 bg-[color:var(--chart-4)]/15 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[color:var(--chart-4)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 bg-card border border-border rounded-lg p-1 shadow-sm">
          <button
            onClick={() => {
              setFilter('all');
              setTodayOnly(false);
            }}
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary dark:bg-[#243638] dark:text-[#f6f8f8]'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => {
              setFilter('active');
              setTodayOnly(false);
            }}
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              filter === 'active'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary dark:bg-[#243638] dark:text-[#f6f8f8]'
            }`}
          >
            {language === 'ar' ? 'نشط' : 'Active'}
          </button>
          <button
            onClick={() => {
              setFilter('acknowledged');
              setTodayOnly(false);
            }}
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              filter === 'acknowledged'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary dark:bg-[#243638] dark:text-[#f6f8f8]'
            }`}
          >
            {language === 'ar' ? 'تمت المعالجة' : 'Acknowledged'}
          </button>
        </div>

      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {displayAlerts.length === 0 ? (
          <Card className="bg-card/80 border-border p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-[color:var(--chart-4)] mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts found'}
              </p>
            </div>
          </Card>
        ) : (
          Object.entries(groupedAlerts).map(([day, dayAlerts]) => (
            <div key={day} className="space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {day}
              </div>
              {dayAlerts.map(alert => {
                const TypeIcon = getTypeIcon(alert.type);
                const severityColor = getSeverityColor(alert.severity);
                
                return (
                  <Card
                    key={alert.id}
                    className={`bg-card/80 border-border p-6 ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${severityColor}20`, color: severityColor }}
                      >
                        {getSeverityIcon(alert.severity)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-foreground font-medium">{alert.title}</h3>
                            <Badge
                              variant="outline"
                              className="border-border"
                              style={{ color: severityColor, borderColor: severityColor }}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {alert.acknowledged && (
                              <Badge variant="outline" className="border-[color:var(--chart-4)] text-[color:var(--chart-4)]">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'تمت المعالجة' : 'Acknowledged'}
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimestamp(alert.timestamp, language)}
                          </span>
                        </div>

                        <p className="text-muted-foreground mb-3">{alert.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Camera className="w-4 h-4" />
                              <span>{alert.cameraName}</span>
                            </div>
                            {alert.personId && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>ID: {alert.personId}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground capitalize">{alert.type}</span>
                            </div>
                          </div>

                          {!alert.acknowledged && (
                            <Button
                              onClick={() => handleAcknowledge(alert.id)}
                              variant="outline"
                              size="sm"
                              className="border-border text-foreground hover:bg-secondary"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t('confirm', language)}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function generateAlerts(): (AlertType & { titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string })[] {
  const now = Date.now();
  const minutes = (value: number) => value * 60 * 1000;
  const days = (value: number) => value * 24 * 60 * 60 * 1000;

  const cameras = [
    { id: 'CAM-UN-1', nameEn: 'University Hall 1', nameAr: 'قاعة الجامعة 1' },
    { id: 'CAM-UN-2', nameEn: 'University Lab 2', nameAr: 'مختبر الجامعة 2' },
    { id: 'CAM-SM-1', nameEn: 'Supermarket Floor 1', nameAr: 'السوبرماركت - الدور 1' },
    { id: 'CAM-SC-1', nameEn: 'Service Counter 1', nameAr: 'كاونتر الخدمة 1' },
    { id: 'CAM-AP-2', nameEn: 'Airport Terminal 2', nameAr: 'مبنى المطار 2' },
    { id: 'CAM-MR-1', nameEn: 'Meeting Room 1', nameAr: 'قاعة الاجتماعات 1' },
  ];

  const alertTemplates = [
    {
      type: 'behavior',
      severity: 'high',
      titleEn: 'Low Satisfaction Detected',
      titleAr: 'انخفاض مستوى الرضا',
      descriptionEn: 'Significant drop in satisfaction levels near the service point.',
      descriptionAr: 'انخفاض ملحوظ في مستويات الرضا بالقرب من نقطة الخدمة.',
    },
    {
      type: 'security',
      severity: 'critical',
      titleEn: 'Security Alert',
      titleAr: 'تحذير أمني',
      descriptionEn: 'High risk pattern detected at checkpoint.',
      descriptionAr: 'اكتشاف نمط خطورة مرتفع عند نقطة التفتيش.',
      withPerson: true,
    },
    {
      type: 'behavior',
      severity: 'medium',
      titleEn: 'Elevated Stress Levels',
      titleAr: 'ارتفاع مستوى الإجهاد',
      descriptionEn: 'Stress indicators increased in the last 15 minutes.',
      descriptionAr: 'ارتفاع مؤشرات الإجهاد خلال آخر 15 دقيقة.',
    },
    {
      type: 'system',
      severity: 'medium',
      titleEn: 'Camera FPS Drop',
      titleAr: 'انخفاض معدل الإطارات',
      descriptionEn: 'Camera experiencing low frame rate.',
      descriptionAr: 'الكاميرا تعاني من انخفاض معدل الإطارات.',
    },
    {
      type: 'satisfaction',
      severity: 'low',
      titleEn: 'Satisfaction Improvement',
      titleAr: 'تحسن الرضا',
      descriptionEn: 'Notable improvement in satisfaction levels.',
      descriptionAr: 'تحسن ملحوظ في مستويات الرضا.',
    },
    {
      type: 'security',
      severity: 'high',
      titleEn: 'Suspicious Activity',
      titleAr: 'نشاط مشبوه',
      descriptionEn: 'Unusual movement patterns detected.',
      descriptionAr: 'تم رصد أنماط حركة غير اعتيادية.',
      withPerson: true,
    },
    {
      type: 'behavior',
      severity: 'low',
      titleEn: 'Attention Dip',
      titleAr: 'انخفاض الانتباه',
      descriptionEn: 'Slight attention drop in monitored area.',
      descriptionAr: 'انخفاض طفيف في مستوى الانتباه بالمنطقة.',
    },
  ];

  const schedule = [
    { offset: minutes(5), acknowledged: false },
    { offset: minutes(18), acknowledged: false },
    { offset: minutes(45), acknowledged: true },
    { offset: minutes(80), acknowledged: false },
    { offset: days(1) + minutes(20), acknowledged: true },
    { offset: days(1) + minutes(90), acknowledged: false },
    { offset: days(2) + minutes(10), acknowledged: true },
    { offset: days(2) + minutes(60), acknowledged: true },
    { offset: days(3) + minutes(30), acknowledged: false },
    { offset: days(4) + minutes(15), acknowledged: true },
    { offset: days(5) + minutes(50), acknowledged: false },
    { offset: days(6) + minutes(25), acknowledged: true },
  ];

  return schedule.map((item, index) => {
    const template = alertTemplates[index % alertTemplates.length];
    const camera = cameras[index % cameras.length];
    const timestamp = new Date(now - item.offset);
    return {
      id: `A${(index + 1).toString().padStart(3, '0')}`,
      type: template.type as AlertType['type'],
      severity: template.severity as AlertType['severity'],
      titleEn: template.titleEn,
      titleAr: template.titleAr,
      descriptionEn: template.descriptionEn,
      descriptionAr: template.descriptionAr,
      title: template.titleEn,
      description: template.descriptionEn,
      cameraId: camera.id,
      cameraName: camera.nameEn,
      timestamp,
      acknowledged: item.acknowledged,
      acknowledgedAt: item.acknowledged ? timestamp : undefined,
      personId: template.withPerson ? `P${1000 + index}` : undefined,
    };
  });
}

function formatTimestamp(date: Date, language: 'ar' | 'en'): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return language === 'ar' ? 'الآن' : 'Now';
  if (minutes < 60) return language === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  if (hours < 24) return language === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
  return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
}

function formatDayHeader(date: Date, language: 'ar' | 'en'): string {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return language === 'ar' ? 'اليوم' : 'Today';
  if (diffDays === 1) return language === 'ar' ? 'أمس' : 'Yesterday';
  return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
