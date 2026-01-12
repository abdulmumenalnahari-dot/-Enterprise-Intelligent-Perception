import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Clock, Camera, Search, ChevronDown, ShieldAlert, Activity } from 'lucide-react';

export const Profiles: React.FC = () => {
  const { language, stateColors } = useApp();
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'none' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'appearances' | 'risk'>('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const profiles = [
    {
      id: 'P1247',
      firstSeen: '2026-01-10 08:23',
      lastSeen: '2026-01-10 14:45',
      cameras: ['Airport Terminal 2', 'Airport Security'],
      satisfaction: 'medium',
      attention: 'high',
      stress: 'low',
      risk: 'low',
      appearances: 12
    },
    {
      id: 'P2891',
      firstSeen: '2026-01-10 09:15',
      lastSeen: '2026-01-10 14:30',
      cameras: ['University Building A 1', 'University Building A 3'],
      satisfaction: 'high',
      attention: 'high',
      stress: 'low',
      risk: 'none',
      appearances: 8
    },
    {
      id: 'P3456',
      firstSeen: '2026-01-10 10:00',
      lastSeen: '2026-01-10 14:25',
      cameras: ['Supermarket Floor 1', 'Supermarket Floor 2'],
      satisfaction: 'low',
      attention: 'medium',
      stress: 'high',
      risk: 'none',
      appearances: 15
    }
  ];

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = profiles.filter(profile => {
      if (riskFilter !== 'all' && profile.risk !== riskFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        profile.id,
        ...profile.cameras
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'appearances') return b.appearances - a.appearances;
      if (sortBy === 'risk') {
        const order = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
        return order[b.risk as keyof typeof order] - order[a.risk as keyof typeof order];
      }
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
  }, [profiles, query, riskFilter, sortBy]);

  const formatValue = (value: string) => {
    if (language === 'ar') {
      if (value === 'high') return 'مرتفع';
      if (value === 'medium') return 'متوسط';
      if (value === 'low') return 'منخفض';
      if (value === 'none') return 'لا يوجد';
      if (value === 'critical') return 'حرج';
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('profiles', language)}</h2>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' ? 'ملفات الأشخاص المكتشفين' : 'Detected person profiles'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالمعرف أو الكاميرا' : 'Search by ID or camera'}
            className="pl-10 bg-card/80 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Select value={riskFilter} onValueChange={(value) => setRiskFilter(value as typeof riskFilter)}>
          <SelectTrigger className="w-[190px] bg-card/80 border-border text-foreground">
            <SelectValue placeholder={language === 'ar' ? 'مستوى الخطر' : 'Risk Level'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="none">{language === 'ar' ? 'لا يوجد' : 'None'}</SelectItem>
            <SelectItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</SelectItem>
            <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
            <SelectItem value="high">{language === 'ar' ? 'عالي' : 'High'}</SelectItem>
            <SelectItem value="critical">{language === 'ar' ? 'حرج' : 'Critical'}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[190px] bg-card/80 border-border text-foreground">
            <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{language === 'ar' ? 'الأحدث' : 'Most recent'}</SelectItem>
            <SelectItem value="appearances">{language === 'ar' ? 'عدد الظهور' : 'Appearances'}</SelectItem>
            <SelectItem value="risk">{language === 'ar' ? 'الخطر' : 'Risk'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProfiles.map(profile => (
          <Card key={profile.id} className="bg-card/80 border-border p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{language === 'ar' ? 'معرف' : 'ID'}: {profile.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {language === 'ar' ? 'أول ظهور' : 'First seen'}: {profile.firstSeen}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {language === 'ar' ? 'آخر ظهور' : 'Last seen'}: {profile.lastSeen}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="border-primary text-primary">
                      {profile.appearances} {language === 'ar' ? 'ظهور' : 'appearances'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-border"
                      style={{ color: stateColors.risk[profile.risk as keyof typeof stateColors.risk] }}
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      {formatValue(profile.risk)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-secondary/60 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{t('satisfaction', language)}</p>
                    <p className="text-foreground font-medium capitalize" style={{ color: stateColors.satisfaction[profile.satisfaction as keyof typeof stateColors.satisfaction] }}>
                      {formatValue(profile.satisfaction)}
                    </p>
                  </div>
                  <div className="bg-secondary/60 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{t('attention', language)}</p>
                    <p className="text-foreground font-medium capitalize" style={{ color: stateColors.attention[profile.attention as keyof typeof stateColors.attention] }}>
                      {formatValue(profile.attention)}
                    </p>
                  </div>
                  <div className="bg-secondary/60 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{t('stress', language)}</p>
                    <p className="text-foreground font-medium capitalize" style={{ color: stateColors.stress[profile.stress as keyof typeof stateColors.stress] }}>
                      {formatValue(profile.stress)}
                    </p>
                  </div>
                  <div className="bg-secondary/60 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{t('risk', language)}</p>
                    <p className="text-foreground font-medium capitalize" style={{ color: stateColors.risk[profile.risk as keyof typeof stateColors.risk] }}>
                      {formatValue(profile.risk)}
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {language === 'ar' ? 'الكاميرات' : 'Cameras'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.cameras.map((cam, i) => (
                      <Badge key={i} variant="outline" className="border-border text-muted-foreground">
                        {cam}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary"
                    onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                  >
                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${expandedId === profile.id ? 'rotate-180' : ''}`} />
                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </Button>
                </div>

                {expandedId === profile.id && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/60 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-1">{language === 'ar' ? 'الظهور اليومي' : 'Daily appearances'}</p>
                      <p className="text-foreground font-medium">{Math.max(1, Math.round(profile.appearances / 2))}</p>
                    </div>
                    <div className="bg-secondary/60 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-1">{language === 'ar' ? 'مؤشر الاستقرار' : 'Stability index'}</p>
                      <p className="text-foreground font-medium">{Math.min(98, 60 + profile.appearances * 3)}%</p>
                    </div>
                    <div className="bg-secondary/60 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-1">{language === 'ar' ? 'آخر حدث' : 'Last event'}</p>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Activity className="w-4 h-4" />
                        {language === 'ar' ? 'تحليل سلوكي محدث' : 'Behavioral analysis updated'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
