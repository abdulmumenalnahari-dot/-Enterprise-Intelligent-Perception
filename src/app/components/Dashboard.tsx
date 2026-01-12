import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { 
  Camera, 
  Users, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { Card } from './ui/card';
import { dashboardColors } from '../theme';

export const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { language, selectedProfile, cameraCount, theme } = useApp();
  const [isLive, setIsLive] = useState(true);
  const isDark = theme === 'dark';
  const colors = dashboardColors;
  const [stats, setStats] = useState({
    totalCameras: 24,
    onlineCameras: 22,
    peopleDetected: 147,
    activeAlerts: 3,
    avgSatisfaction: 82,
    avgAttention: 76,
    avgStress: 34
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        peopleDetected: prev.peopleDetected + Math.floor(Math.random() * 5) - 2,
        avgSatisfaction: Math.max(0, Math.min(100, prev.avgSatisfaction + Math.floor(Math.random() * 6) - 3)),
        avgAttention: Math.max(0, Math.min(100, prev.avgAttention + Math.floor(Math.random() * 6) - 3)),
        avgStress: Math.max(0, Math.min(100, prev.avgStress + Math.floor(Math.random() * 6) - 3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const contextKeyMap: Record<string, string> = {
    university: 'university',
    market: 'supermarket',
    service: 'serviceCounter',
    airport: 'airport',
    public: 'crowd',
    work: 'meetingRoom'
  };

  const selectedContextKey = selectedProfile ? contextKeyMap[selectedProfile] : null;
  const totalCameras = cameraCount > 0 ? cameraCount : stats.totalCameras;
  const onlineCameras = cameraCount > 0 ? Math.min(cameraCount, stats.onlineCameras) : stats.onlineCameras;
  const scale = stats.totalCameras > 0 ? totalCameras / stats.totalCameras : 1;
  const peopleDetected = Math.max(0, Math.round(stats.peopleDetected * scale));

  const statCards = [
    {
      icon: Camera,
      label: t('totalCameras', language),
      value: totalCameras,
      subValue: `${onlineCameras} ${t('online', language)}`,
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
      trend: '+2',
      onClick: () => onNavigate('cameraWall')
    },
    {
      icon: Users,
      label: t('peopleDetected', language),
      value: peopleDetected,
      subValue: language === 'ar' ? 'في الوقت الفعلي' : 'Real-time',
      iconBg: 'bg-accent/15',
      iconColor: 'text-accent',
      trend: '+12',
      live: true
    },
    {
      icon: AlertTriangle,
      label: t('activeAlerts', language),
      value: stats.activeAlerts,
      subValue: language === 'ar' ? 'تحتاج إلى انتباه' : 'Need attention',
      iconBg: 'bg-destructive/15',
      iconColor: 'text-destructive',
      onClick: () => onNavigate('alerts')
    },
    {
      icon: Activity,
      label: t('systemStatus', language),
      value: t('healthy', language),
      subValue: '99.8% ' + (language === 'ar' ? 'وقت التشغيل' : 'Uptime'),
      iconBg: 'bg-[color:var(--chart-4)]/15',
      iconColor: 'text-[color:var(--chart-4)]',
      trend: 'up'
    }
  ];

  const contexts = [
    { key: 'university', name: t('university', language), cameras: 8, people: 45, satisfaction: 85 },
    { key: 'supermarket', name: t('supermarket', language), cameras: 6, people: 52, satisfaction: 78 },
    { key: 'serviceCounter', name: t('serviceCounter', language), cameras: 4, people: 18, satisfaction: 72 },
    { key: 'meetingRoom', name: t('meetingRoom', language), cameras: 3, people: 12, satisfaction: 88 },
    { key: 'airport', name: t('airport', language), cameras: 3, people: 20, satisfaction: 80 },
    { key: 'crowd', name: t('crowd', language), cameras: 5, people: 35, satisfaction: 70 }
  ];

  const visibleContexts = selectedContextKey
    ? contexts.filter((context) => context.key === selectedContextKey).map((context) => ({
        ...context,
        cameras: totalCameras,
        people: peopleDetected
      }))
    : contexts;

  return (
    <div
      className="space-y-6"
      style={{
        '--dashboard-panel': isDark ? colors.panelDark : colors.panelLight,
        '--dashboard-panel-soft': isDark ? colors.panelSoftDark : colors.panelSoftLight
      } as React.CSSProperties}
    >
      {/* Live Status Banner */}
      <div className="bg-[color:var(--dashboard-panel)] backdrop-blur-xl border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLive ? (
              <>
                <div className="relative">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-destructive rounded-full animate-ping" />
                </div>
                <span className="text-foreground font-medium">{language === 'ar' ? 'البث المباشر نشط' : 'Live Monitoring Active'}</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-muted-foreground/60 rounded-full" />
                <span className="text-muted-foreground">{language === 'ar' ? 'البث متوقف' : 'Monitoring Paused'}</span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLive
                ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                : 'bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)] hover:bg-[color:var(--chart-4)]/25'
            }`}
          >
            {isLive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{language === 'ar' ? 'إيقاف' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{language === 'ar' ? 'بدء' : 'Resume'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`bg-[color:var(--dashboard-panel)] backdrop-blur-xl border border-border rounded-xl p-6 ${
                stat.onClick ? 'cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg shadow-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    stat.trend === 'up' || stat.trend.startsWith('+')
                      ? 'bg-[color:var(--chart-4)]/15 text-[color:var(--chart-4)]'
                      : 'bg-destructive/15 text-destructive'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : stat.trend.startsWith('+') ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">{stat.trend}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground/80 text-xs flex items-center gap-1">
                  {stat.live && <span className="w-1.5 h-1.5 bg-[color:var(--chart-4)] rounded-full animate-pulse" />}
                  {stat.subValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Behavioral Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[color:var(--dashboard-panel)] backdrop-blur-xl border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-medium">{t('satisfaction', language)}</h3>
            <span className="text-2xl font-bold text-primary">{stats.avgSatisfaction}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ backgroundColor: 'var(--chart-1)', width: `${stats.avgSatisfaction}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط الرضا العام' : 'Overall satisfaction average'}</p>
        </Card>

        <Card className="bg-[color:var(--dashboard-panel)] backdrop-blur-xl border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-medium">{t('attention', language)}</h3>
            <span className="text-2xl font-bold text-accent">{stats.avgAttention}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ backgroundColor: 'var(--chart-2)', width: `${stats.avgAttention}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط مستوى الانتباه' : 'Average attention level'}</p>
        </Card>

        <Card className="bg-[color:var(--dashboard-panel)] backdrop-blur-xl border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-medium">{t('stress', language)}</h3>
            <span className="text-2xl font-bold text-[color:var(--chart-5)]">{stats.avgStress}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ backgroundColor: 'var(--chart-5)', width: `${stats.avgStress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط مستوى الإجهاد' : 'Average stress level'}</p>
        </Card>
      </div>

      {/* Context Overview */}
      <Card className="bg-[color:var(--dashboard-panel)] backdrop-blur-xl border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{language === 'ar' ? 'نظرة عامة على السياقات' : 'Context Overview'}</h2>
          <button 
            onClick={() => onNavigate('cameraWall')}
            className="text-accent hover:text-accent/80 text-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {t('view', language)}
          </button>
        </div>
        <div className="space-y-4">
          {visibleContexts.map((context, index) => (
            <div
              key={index}
              className="bg-[color:var(--dashboard-panel-soft)] border border-border rounded-lg p-4 hover:border-primary/40 transition-all cursor-pointer"
              onClick={() => onNavigate('cameraWall')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium">{context.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {context.cameras} {t('cameras', language)} • {context.people} {language === 'ar' ? 'شخص' : 'people'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    context.satisfaction >= 80 ? 'text-[color:var(--chart-4)]' :
                    context.satisfaction >= 60 ? 'text-[color:var(--chart-5)]' : 'text-destructive'
                  }`}>
                    {context.satisfaction}%
                  </div>
                  <div className="text-xs text-muted-foreground">{t('satisfaction', language)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
