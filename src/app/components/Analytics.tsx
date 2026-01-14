import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, TrendingUp, Users, Smile, Eye, Zap, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { analyticsColors } from '../theme';
import { clampNumber, parseNumber } from '../utils/validation';
import { toBlob, toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const Analytics: React.FC = () => {
  const { language, stateColors } = useApp();
  const [timeRange, setTimeRange] = useState('24h');
  const [customAmount, setCustomAmount] = useState(3);
  const [customUnit, setCustomUnit] = useState<'hour' | 'day' | 'month'>('day');
  const [exportMenu, setExportMenu] = useState<null | 'metrics' | 'trends' | 'distributions'>(null);
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

  const customAmountError =
    timeRange === 'custom' && (customAmount < 1 || customAmount > 365);

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

  const getExportNode = (key: 'metrics' | 'trends' | 'distributions') => {
    if (key === 'metrics') return metricsRef.current ?? document.getElementById('analytics-metrics');
    if (key === 'trends') return trendsRef.current ?? document.getElementById('analytics-trends');
    return distributionsRef.current ?? document.getElementById('analytics-distributions');
  };

  const getExportBackground = () => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    return bg || (document.documentElement.classList.contains('dark') ? '#0a1415' : '#ffffff');
  };

  const exportNodeAsPng = async (node: HTMLElement | null, filename: string) => {
    if (!node) return;
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
      const blob = await toBlob(node, {
        backgroundColor: getExportBackground(),
        pixelRatio: 2,
        filter: (domNode) => !(domNode as HTMLElement)?.dataset?.exportIgnore
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export PNG failed', error);
    }
  };

  const exportNodeAsPdf = async (node: HTMLElement | null, filename: string) => {
    if (!node) return;
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
      const dataUrl = await toPng(node, {
        backgroundColor: getExportBackground(),
        pixelRatio: 2,
        filter: (domNode) => !(domNode as HTMLElement)?.dataset?.exportIgnore
      });
      const img = new Image();
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'l' : 'p',
          unit: 'px',
          format: [img.width, img.height]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
        pdf.save(filename);
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('Export PDF failed', error);
    }
  };

  const [satisfactionDistribution, attentionDistribution, stressDistribution] = useMemo(() => {
    const toPercent = (count: number, total: number) =>
      total === 0 ? 0 : Math.round((count / total) * 100);

    const classify = (value: number, highCut: number, lowCut: number) => {
      if (value >= highCut) return 'high';
      if (value <= lowCut) return 'low';
      return 'medium';
    };

    const buildDistribution = (
      key: 'satisfaction' | 'attention' | 'stress',
      colors: { high: string; medium: string; low: string },
      labels: { high: string; medium: string; low: string }
    ) => {
      const total = timeSeriesData.length;
      const avg =
        total === 0 ? 0 : timeSeriesData.reduce((sum, point) => sum + point[key], 0) / total;
      const highCut = Math.min(95, Math.max(5, avg + 5));
      const lowCut = Math.max(5, Math.min(95, avg - 5));
      let high = 0;
      let medium = 0;
      let low = 0;
      timeSeriesData.forEach((point) => {
        const category = classify(point[key], highCut, lowCut);
        if (category === 'high') high += 1;
        else if (category === 'low') low += 1;
        else medium += 1;
      });
      let highValue = toPercent(high, total);
      let mediumValue = toPercent(medium, total);
      let lowValue = toPercent(low, total);
      if (total > 0) {
        const values = [
          { key: 'high', value: highValue },
          { key: 'medium', value: mediumValue },
          { key: 'low', value: lowValue }
        ];
        const zeroKeys = values.filter((item) => item.value === 0).map((item) => item.key);
        if (zeroKeys.length > 0) {
          zeroKeys.forEach((key) => {
            if (key === 'high') highValue = 1;
            if (key === 'medium') mediumValue = 1;
            if (key === 'low') lowValue = 1;
          });
          const sum = highValue + mediumValue + lowValue;
          if (sum !== 100) {
            const diff = sum - 100;
            const maxKey =
              highValue >= mediumValue && highValue >= lowValue
                ? 'high'
                : mediumValue >= lowValue
                  ? 'medium'
                  : 'low';
            if (maxKey === 'high') highValue = Math.max(1, highValue - diff);
            if (maxKey === 'medium') mediumValue = Math.max(1, mediumValue - diff);
            if (maxKey === 'low') lowValue = Math.max(1, lowValue - diff);
          }
        }
      }
      return [
        { name: labels.high, value: highValue, color: colors.high },
        { name: labels.medium, value: mediumValue, color: colors.medium },
        { name: labels.low, value: lowValue, color: colors.low }
      ];
    };

    const satisfaction = buildDistribution(
      'satisfaction',
      stateColors.satisfaction,
      {
        high: t('satisfactionHigh', language),
        medium: t('satisfactionMedium', language),
        low: t('satisfactionLow', language)
      }
    );

    const attention = buildDistribution(
      'attention',
      stateColors.attention,
      {
        high: t('attentionHigh', language),
        medium: t('attentionMedium', language),
        low: t('attentionLow', language)
      }
    );

    const stress = buildDistribution(
      'stress',
      { high: stateColors.stress.high, medium: stateColors.stress.medium, low: stateColors.stress.low },
      {
        high: t('stressHigh', language),
        medium: t('stressMedium', language),
        low: t('stressLow', language)
      }
    );

    return [satisfaction, attention, stress];
  }, [language, stateColors, timeSeriesData]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-card border-border text-foreground dark:bg-[#243638]">
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
                onChange={(e) => setCustomAmount(parseNumber(e.target.value, 1))}
                onBlur={() => setCustomAmount(clampNumber(customAmount || 1, 1, 365))}
                className="w-24 bg-card/80 border-border text-foreground"
                aria-invalid={customAmountError}
              />
              <Select value={customUnit} onValueChange={(value) => setCustomUnit(value as 'hour' | 'day' | 'month')}>
                <SelectTrigger className="w-[140px] bg-card border-border text-foreground dark:bg-[#243638]">
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

        <div className="relative">
          <Button
            className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90"
            onClick={() => setExportMenu(exportMenu === 'metrics' ? null : 'metrics')}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export', language)}
          </Button>
          {exportMenu === 'metrics' && (
            <div className="absolute right-0 mt-2 flex gap-2 rounded-lg border border-border bg-card/90 p-2 shadow-lg z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportNodeAsPng(getExportNode('metrics'), 'analytics-kpis.png');
                  setExportMenu(null);
                }}
              >
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportNodeAsPdf(getExportNode('metrics'), 'analytics-kpis.pdf');
                  setExportMenu(null);
                }}
              >
                PDF
              </Button>
            </div>
          )}
          {customAmountError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {language === 'ar' ? 'القيمة يجب أن تكون بين 1 و 365' : 'Value must be between 1 and 365'}
            </p>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div id="analytics-metrics" ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <Card id="analytics-trends" ref={trendsRef} className="bg-card/80 backdrop-blur-xl border-border p-6">
        <div className="flex items-center justify-between mb-6" data-export-ignore="true">
          <h2 className="text-xl font-bold text-foreground">
            {language === 'ar' ? 'الاتجاهات على مدار الوقت' : 'Trends Over Time'}
          </h2>
          <div className="relative">
            <Button
              className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90"
              onClick={() => setExportMenu(exportMenu === 'trends' ? null : 'trends')}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('export', language)}
            </Button>
            {exportMenu === 'trends' && (
              <div className="absolute right-0 mt-2 flex gap-2 rounded-lg border border-border bg-card/90 p-2 shadow-lg z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportNodeAsPng(getExportNode('trends'), 'analytics-trends.png');
                    setExportMenu(null);
                  }}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportNodeAsPdf(getExportNode('trends'), 'analytics-trends.pdf');
                    setExportMenu(null);
                  }}
                >
                  PDF
                </Button>
              </div>
            )}
          </div>
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
            <YAxis stroke="var(--muted-foreground)" tickMargin={16} dx={-8} />
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
        <div className="relative">
          <Button
            className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90"
            onClick={() => setExportMenu(exportMenu === 'distributions' ? null : 'distributions')}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export', language)}
          </Button>
          {exportMenu === 'distributions' && (
            <div className="absolute right-0 mt-2 flex gap-2 rounded-lg border border-border bg-card/90 p-2 shadow-lg z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportNodeAsPng(getExportNode('distributions'), 'analytics-distributions.png');
                  setExportMenu(null);
                }}
              >
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportNodeAsPdf(getExportNode('distributions'), 'analytics-distributions.pdf');
                  setExportMenu(null);
                }}
              >
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      <div id="analytics-distributions" ref={distributionsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
