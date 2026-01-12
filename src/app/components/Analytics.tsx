import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, TrendingUp, Users, Smile, Eye, Zap, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { analyticsColors } from '../theme';

export const Analytics: React.FC = () => {
  const { language, stateColors } = useApp();
  const [timeRange, setTimeRange] = useState('24h');
  const [customAmount, setCustomAmount] = useState(3);
  const [customUnit, setCustomUnit] = useState<'hour' | 'day' | 'month'>('day');
  const metricsRef = useRef<HTMLDivElement | null>(null);
  const trendsRef = useRef<HTMLDivElement | null>(null);
  const distributionsRef = useRef<HTMLDivElement | null>(null);

  const timeSeriesData = useMemo(() => {
    const makePoint = (label: string) => ({
      label,
      satisfaction: 65 + Math.random() * 25,
      attention: 55 + Math.random() * 30,
      stress: 20 + Math.random() * 25,
      people: Math.floor(80 + Math.random() * 100)
    });

    const hours = (count: number) =>
      Array.from({ length: count }, (_, i) => makePoint(`${(i % 24).toString().padStart(2, '0')}:00`));
    const days = (count: number) =>
      Array.from({ length: count }, (_, i) => makePoint(language === 'ar' ? `يوم ${i + 1}` : `Day ${i + 1}`));
    const months = (count: number) =>
      Array.from({ length: count }, (_, i) => makePoint(language === 'ar' ? `شهر ${i + 1}` : `Month ${i + 1}`));

    if (timeRange === '1h') return hours(1);
    if (timeRange === '24h') return hours(24);
    if (timeRange === '3d') return days(3);
    if (timeRange === '7d') return days(7);
    if (timeRange === '30d') return days(30);
    if (timeRange === '90d') return days(90);

    if (timeRange === 'custom') {
      const amount = Math.max(1, Math.min(365, customAmount || 1));
      if (customUnit === 'hour') return hours(Math.min(amount, 48));
      if (customUnit === 'day') return days(Math.min(amount, 90));
      return months(Math.min(amount, 12));
    }

    return hours(24);
  }, [customAmount, customUnit, language, timeRange]);

  const metrics = useMemo(() => {
    const totalPeople = timeSeriesData.reduce((sum, point) => sum + point.people, 0);
    const avg = (key: 'satisfaction' | 'attention' | 'stress') =>
      Math.round(timeSeriesData.reduce((sum, point) => sum + point[key], 0) / timeSeriesData.length);
    return {
      satisfaction: avg('satisfaction'),
      attention: avg('attention'),
      stress: avg('stress'),
      people: totalPeople
    };
  }, [timeSeriesData]);

  const exportNodeAsPng = (node: HTMLElement | null, filename: string) => {
    if (!node) return;
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const cloned = node.cloneNode(true) as HTMLElement;
    cloned.style.width = `${width}px`;
    cloned.style.height = `${height}px`;
    const isDark = document.documentElement.classList.contains('dark');
    cloned.style.background = isDark ? analyticsColors.exportDark : analyticsColors.exportLight;
    const serializer = new XMLSerializer();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">${serializer.serializeToString(cloned)}</div>
        </foreignObject>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  const exportNodeAsPdf = (node: HTMLElement | null, filename: string) => {
    if (!node) return;
    exportNodeAsPng(node, filename.replace('.pdf', '.png'));
    setTimeout(() => window.print(), 300);
  };

  const [satisfactionDistribution, attentionDistribution, stressDistribution] = useMemo(() => {
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const avg = (key: 'satisfaction' | 'attention' | 'stress') =>
      timeSeriesData.reduce((sum, point) => sum + point[key], 0) / timeSeriesData.length;
    const satisfactionAvg = avg('satisfaction');
    const attentionAvg = avg('attention');
    const stressAvg = avg('stress');

    const toDistribution = (mean: number, mode: 'high' | 'low') => {
      const bias = mode === 'high' ? 0.6 : 0.4;
      const high = clamp(mean * (0.6 + bias * 0.2));
      const medium = clamp(100 - high);
      const low = clamp(100 - high - medium);
      return {
        high: Math.round(clamp(high * 0.6)),
        medium: Math.round(clamp(medium * 0.7)),
        low: Math.max(0, 100 - Math.round(clamp(high * 0.6)) - Math.round(clamp(medium * 0.7)))
      };
    };

    const sat = toDistribution(satisfactionAvg, 'high');
    const att = toDistribution(attentionAvg, 'high');
    const str = toDistribution(stressAvg, 'low');

    const satisfaction = [
      { name: t('satisfactionHigh', language), value: sat.high, color: stateColors.satisfaction.high },
      { name: t('satisfactionMedium', language), value: sat.medium, color: stateColors.satisfaction.medium },
      { name: t('satisfactionLow', language), value: sat.low, color: stateColors.satisfaction.low }
    ];

    const attention = [
      { name: t('attentionHigh', language), value: att.high, color: stateColors.attention.high },
      { name: t('attentionMedium', language), value: att.medium, color: stateColors.attention.medium },
      { name: t('attentionLow', language), value: att.low, color: stateColors.attention.low }
    ];

    const stress = [
      { name: t('stressLow', language), value: str.low, color: stateColors.stress.low },
      { name: t('stressMedium', language), value: str.medium, color: stateColors.stress.medium },
      { name: t('stressHigh', language), value: str.high, color: stateColors.stress.high }
    ];

    return [satisfaction, attention, stress];
  }, [language, stateColors, timeSeriesData]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-card/80 border-border text-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">{language === 'ar' ? 'آخر ساعة' : 'Last Hour'}</SelectItem>
              <SelectItem value="24h">{language === 'ar' ? '24 ساعة' : 'Last 24 Hours'}</SelectItem>
              <SelectItem value="3d">{language === 'ar' ? '3 أيام' : 'Last 3 Days'}</SelectItem>
              <SelectItem value="7d">{language === 'ar' ? '7 أيام' : 'Last 7 Days'}</SelectItem>
              <SelectItem value="30d">{language === 'ar' ? '30 يوم' : 'Last 30 Days'}</SelectItem>
              <SelectItem value="90d">{language === 'ar' ? '90 يوم' : 'Last 90 Days'}</SelectItem>
              <SelectItem value="custom">{language === 'ar' ? 'تخصيص' : 'Custom'}</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={365}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value || 1))}
                className="w-24 bg-card/80 border-border text-foreground"
              />
              <Select value={customUnit} onValueChange={(value) => setCustomUnit(value as 'hour' | 'day' | 'month')}>
                <SelectTrigger className="w-[140px] bg-card/80 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">{language === 'ar' ? 'ساعة' : 'Hour'}</SelectItem>
                  <SelectItem value="day">{language === 'ar' ? 'يوم' : 'Day'}</SelectItem>
                  <SelectItem value="month">{language === 'ar' ? 'شهر' : 'Month'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              {t('export', language)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => exportNodeAsPng(metricsRef.current, 'analytics-kpis.png')}>PNG</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportNodeAsPdf(metricsRef.current, 'analytics-kpis.pdf')}>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics Cards */}
      <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/80 border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/15 rounded-lg flex items-center justify-center">
              <Smile className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-primary text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm mb-1">{t('satisfaction', language)}</h3>
          <p className="text-3xl font-bold text-foreground">{metrics.satisfaction}%</p>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط عام' : 'Overall average'}</p>
        </Card>

        <Card className="bg-card/80 border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-accent/15 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-accent text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+3.8%</span>
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm mb-1">{t('attention', language)}</h3>
          <p className="text-3xl font-bold text-foreground">{metrics.attention}%</p>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط عام' : 'Overall average'}</p>
        </Card>

        <Card className="bg-card/80 border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[color:var(--chart-5)]/15 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-[color:var(--chart-5)]" />
            </div>
            <div className="flex items-center gap-1 text-[color:var(--chart-5)] text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>-2.1%</span>
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm mb-1">{t('stress', language)}</h3>
          <p className="text-3xl font-bold text-foreground">{metrics.stress}%</p>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'متوسط عام (منخفض أفضل)' : 'Overall average (lower is better)'}</p>
        </Card>

        <Card className="bg-card/80 border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex items-center gap-1 text-primary text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm mb-1">{language === 'ar' ? 'إجمالي الأشخاص' : 'Total People'}</h3>
          <p className="text-3xl font-bold text-foreground">{metrics.people.toLocaleString()}</p>
          <p className="text-muted-foreground text-xs mt-2">{language === 'ar' ? 'تم اكتشافهم اليوم' : 'Detected today'}</p>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card ref={trendsRef} className="bg-card/80 backdrop-blur-xl border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {language === 'ar' ? 'الاتجاهات على مدار الوقت' : 'Trends Over Time'}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
                <Download className="w-4 h-4 mr-2" />
                {t('export', language)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => exportNodeAsPng(trendsRef.current, 'analytics-trends.png')}>PNG</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportNodeAsPdf(trendsRef.current, 'analytics-trends.pdf')}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stateColors.satisfaction.high} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={stateColors.satisfaction.high} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stateColors.attention.high} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={stateColors.attention.high} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stateColors.stress.high} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={stateColors.stress.high} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Area type="monotone" dataKey="satisfaction" stroke={stateColors.satisfaction.high} fillOpacity={1} fill="url(#colorSatisfaction)" name={t('satisfaction', language)} />
            <Area type="monotone" dataKey="attention" stroke={stateColors.attention.high} fillOpacity={1} fill="url(#colorAttention)" name={t('attention', language)} />
            <Area type="monotone" dataKey="stress" stroke={stateColors.stress.high} fillOpacity={1} fill="url(#colorStress)" name={t('stress', language)} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Pie Charts */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {language === 'ar' ? 'توزيعات المؤشرات' : 'Metric Distributions'}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              {t('export', language)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => exportNodeAsPng(distributionsRef.current, 'analytics-distributions.png')}>PNG</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportNodeAsPdf(distributionsRef.current, 'analytics-distributions.pdf')}>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={distributionsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/80 backdrop-blur-xl border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center">
            {t('satisfaction', language)} {language === 'ar' ? 'التوزيع' : 'Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={satisfactionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {satisfactionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {satisfactionDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-xl border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center">
            {t('attention', language)} {language === 'ar' ? 'التوزيع' : 'Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={attentionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {attentionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {attentionDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-card/80 backdrop-blur-xl border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center">
            {t('stress', language)} {language === 'ar' ? 'التوزيع' : 'Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stressDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {stressDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {stressDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
