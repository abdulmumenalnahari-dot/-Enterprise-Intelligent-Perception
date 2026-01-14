import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toBlob, toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { clampNumber, parseNumber } from '../utils/validation';

export const Reports: React.FC = () => {
  const { language } = useApp();
  const isRTL = language === 'ar';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportType, setReportType] = useState<'satisfaction' | 'stress' | 'alerts'>('satisfaction');
  const [reportName, setReportName] = useState('');
  const [fromAmount, setFromAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState<'hour' | 'day' | 'week' | 'month' | 'year'>('day');
  const [toAmount, setToAmount] = useState(2);
  const [toUnit, setToUnit] = useState<'hour' | 'day' | 'week' | 'month' | 'year'>('day');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const fixedReports = useMemo(() => getFixedReports(language), [language]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'satisfaction' | 'stress' | 'alerts'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [createError, setCreateError] = useState('');

  const unitLabel = (unit: typeof fromUnit, amount: number) => {
    if (isRTL) {
      const map = { hour: 'ساعة', day: 'يوم', week: 'أسبوع', month: 'شهر', year: 'سنة' };
      return `${amount} ${map[unit]}`;
    }
    const plural = amount === 1 ? unit : `${unit}s`;
    return `${amount} ${plural}`;
  };

  const typeLabel = (type: typeof reportType) => {
    if (type === 'satisfaction') return isRTL ? 'تقرير الرضا' : 'Satisfaction Report';
    if (type === 'stress') return isRTL ? 'تقرير الإجهاد' : 'Stress Report';
    return isRTL ? 'تقرير التنبيهات' : 'Alerts Report';
  };

  const rangeLabel = () => {
    const from = unitLabel(fromUnit, fromAmount);
    const to = unitLabel(toUnit, toAmount);
    return isRTL ? `من ${from} إلى ${to}` : `From ${from} to ${to}`;
  };

  useEffect(() => {
    setReportName(`${typeLabel(reportType)} (${rangeLabel()})`);
  }, [reportType, fromAmount, fromUnit, toAmount, toUnit, language]);

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    const fromValid = fromAmount >= 1 && fromAmount <= 365;
    const toValid = toAmount >= 1 && toAmount <= 365;
    if (!fromValid || !toValid) {
      setCreateError(isRTL ? 'المدة يجب أن تكون بين 1 و 365.' : 'Range must be between 1 and 365.');
      return;
    }
    setCreateError('');
    const now = new Date();
    const title = `${typeLabel(reportType)} (${rangeLabel()})`;
    const newReport = {
      id: `R-${now.getTime()}`,
      title: reportName || title,
      date: now.toISOString().slice(0, 10),
      createdAt: now,
      type: typeLabel(reportType),
      typeId: reportType,
      periodId: 'custom',
      range: rangeLabel(),
      size: `${(1 + Math.random() * 9).toFixed(1)} MB`
    };
    setReports((prev) => [newReport, ...prev]);
    setIsCreateOpen(false);
  };

  const normalize = (value: string) => value.toLowerCase().trim();

  const applyFilters = (items: ReportItem[]) => {
    const text = normalize(query);
    const filtered = items.filter((report) => {
      if (typeFilter !== 'all' && report.typeId !== typeFilter) return false;
      if (periodFilter !== 'all' && report.periodId !== periodFilter) return false;
      if (!text) return true;
      const haystack = `${report.title} ${report.type} ${report.range ?? ''}`.toLowerCase();
      return haystack.includes(text);
    });
    return filtered.sort((a, b) => {
      const aTime = (a.createdAt ? new Date(a.createdAt).getTime() : Date.parse(a.date)) || 0;
      const bTime = (b.createdAt ? new Date(b.createdAt).getTime() : Date.parse(b.date)) || 0;
      return sortBy === 'newest' ? bTime - aTime : aTime - bTime;
    });
  };

  const visibleReports = useMemo(() => applyFilters(reports), [reports, query, typeFilter, periodFilter, sortBy]);
  const visibleFixedReports = useMemo(() => applyFilters(fixedReports), [fixedReports, query, typeFilter, periodFilter, sortBy]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getExportBackground = () => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    return bg || (document.documentElement.classList.contains('dark') ? '#0a1415' : '#ffffff');
  };

  const exportNodeAsImage = async (node: HTMLElement | null, filename: string, format: 'png' | 'jpg') => {
    if (!node) return;
    try {
      const blob = await toBlob(node, {
        backgroundColor: getExportBackground(),
        pixelRatio: 2
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export image failed', error);
    }
  };

  const exportNodeAsPdf = async (node: HTMLElement | null, filename: string) => {
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: getExportBackground(),
        pixelRatio: 2
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

  const exportReport = (report: ReportItem, format: 'png' | 'jpg' | 'pdf' | 'csv') => {
    const node = cardRefs.current[report.id];
    if (format === 'csv') {
      const rows = [
        ['title', report.title],
        ['date', report.date],
        ['range', report.range ?? ''],
        ['size', report.size]
      ];
      const content = rows.map((row) => row.join(',')).join('\n');
      downloadBlob(new Blob([content], { type: 'text/csv;charset=utf-8' }), `${report.id}.csv`);
      return;
    }
    if (format === 'pdf') {
      exportNodeAsPdf(node ?? null, `${report.id}.pdf`);
      return;
    }
    exportNodeAsImage(node ?? null, `${report.id}.${format}`, format);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{isRTL ? 'التقارير' : 'Reports'}</h2>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'إنشاء وتحميل التقارير التحليلية' : 'Generate and download analytical reports'}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isRTL ? 'إنشاء تقرير جديد' : 'Generate New Report'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالتقارير...' : 'Search reports...'}
            className="bg-card/80 border-border text-foreground"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
          <SelectTrigger className="w-[190px] bg-card border-border text-foreground dark:bg-[#243638]">
            <SelectValue placeholder={isRTL ? 'نوع التقرير' : 'Report type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="satisfaction">{isRTL ? 'الرضا' : 'Satisfaction'}</SelectItem>
            <SelectItem value="stress">{isRTL ? 'الإجهاد' : 'Stress'}</SelectItem>
            <SelectItem value="alerts">{isRTL ? 'التنبيهات' : 'Alerts'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as typeof periodFilter)}>
          <SelectTrigger className="w-[190px] bg-card border-border text-foreground dark:bg-[#243638]">
            <SelectValue placeholder={isRTL ? 'الفترة' : 'Period'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="daily">{isRTL ? 'يومي' : 'Daily'}</SelectItem>
            <SelectItem value="weekly">{isRTL ? 'أسبوعي' : 'Weekly'}</SelectItem>
            <SelectItem value="monthly">{isRTL ? 'شهري' : 'Monthly'}</SelectItem>
            <SelectItem value="yearly">{isRTL ? 'سنوي' : 'Yearly'}</SelectItem>
            <SelectItem value="custom">{isRTL ? 'مخصص' : 'Custom'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[190px] bg-card border-border text-foreground dark:bg-[#243638]">
            <SelectValue placeholder={isRTL ? 'الترتيب' : 'Sort by'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{isRTL ? 'الأحدث' : 'Newest'}</SelectItem>
            <SelectItem value="oldest">{isRTL ? 'الأقدم' : 'Oldest'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleReports.map(report => (
          <Card key={report.id} className="bg-card/80 border-border p-6 flex flex-col">
            <div ref={(el) => { cardRefs.current[report.id] = el; }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/15 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-foreground font-medium mb-2 line-clamp-2 min-h-[3rem]">{report.title}</h3>
              <div className="space-y-1 mb-4 flex-1">
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {report.date}
                </p>
                {report.createdAt && (
                  <p className="text-muted-foreground text-xs">
                    {new Date(report.createdAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </p>
                )}
                {report.range && (
                  <p className="text-muted-foreground text-xs">{report.range}</p>
                )}
                <p className="text-muted-foreground text-sm">{report.size}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
                  <Download className="w-4 h-4 mr-2" />
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => exportReport(report, 'pdf')}>PDF</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportReport(report, 'png')}>PNG</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportReport(report, 'jpg')}>JPG</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportReport(report, 'csv')}>CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {isRTL ? 'تقارير ثابتة' : 'Fixed Reports'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleFixedReports.map(report => (
            <Card key={report.id} className="bg-card/80 border-border p-6 flex flex-col">
              <div ref={(el) => { cardRefs.current[report.id] = el; }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-foreground font-medium mb-2 line-clamp-2 min-h-[3rem]">{report.title}</h3>
                <div className="space-y-1 mb-4 flex-1">
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </p>
                  <p className="text-muted-foreground text-sm">{report.size}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90">
                    <Download className="w-4 h-4 mr-2" />
                    {isRTL ? 'تصدير' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => exportReport(report, 'pdf')}>PDF</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportReport(report, 'png')}>PNG</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportReport(report, 'jpg')}>JPG</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportReport(report, 'csv')}>CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء تقرير جديد' : 'Create New Report'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'حدد نوع التقرير والمدّة والاسم.' : 'Select report type, range, and name.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'نوع التقرير' : 'Report Type'}</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as typeof reportType)}>
                <SelectTrigger className="bg-card border-border text-foreground dark:bg-[#243638]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satisfaction">{isRTL ? 'تقرير الرضا' : 'Satisfaction Report'}</SelectItem>
                  <SelectItem value="stress">{isRTL ? 'تقرير الإجهاد' : 'Stress Report'}</SelectItem>
                  <SelectItem value="alerts">{isRTL ? 'تقرير التنبيهات' : 'Alerts Report'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'من' : 'From'}</Label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={1}
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(parseNumber(e.target.value, 1));
                    if (createError) setCreateError('');
                  }}
                  onBlur={() => setFromAmount(clampNumber(fromAmount || 1, 1, 365))}
                  className="bg-card border-border text-foreground dark:bg-[#243638]"
                  aria-invalid={fromAmount < 1 || fromAmount > 365}
                />
                <Select value={fromUnit} onValueChange={(value) => setFromUnit(value as typeof fromUnit)}>
                  <SelectTrigger className="bg-card border-border text-foreground dark:bg-[#243638]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">{isRTL ? 'ساعة' : 'Hour'}</SelectItem>
                    <SelectItem value="day">{isRTL ? 'يوم' : 'Day'}</SelectItem>
                    <SelectItem value="week">{isRTL ? 'أسبوع' : 'Week'}</SelectItem>
                    <SelectItem value="month">{isRTL ? 'شهر' : 'Month'}</SelectItem>
                    <SelectItem value="year">{isRTL ? 'سنة' : 'Year'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'إلى' : 'To'}</Label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={1}
                  value={toAmount}
                  onChange={(e) => {
                    setToAmount(parseNumber(e.target.value, 1));
                    if (createError) setCreateError('');
                  }}
                  onBlur={() => setToAmount(clampNumber(toAmount || 1, 1, 365))}
                  className="bg-card border-border text-foreground dark:bg-[#243638]"
                  aria-invalid={toAmount < 1 || toAmount > 365}
                />
                <Select value={toUnit} onValueChange={(value) => setToUnit(value as typeof toUnit)}>
                  <SelectTrigger className="bg-card border-border text-foreground dark:bg-[#243638]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">{isRTL ? 'ساعة' : 'Hour'}</SelectItem>
                    <SelectItem value="day">{isRTL ? 'يوم' : 'Day'}</SelectItem>
                    <SelectItem value="week">{isRTL ? 'أسبوع' : 'Week'}</SelectItem>
                    <SelectItem value="month">{isRTL ? 'شهر' : 'Month'}</SelectItem>
                    <SelectItem value="year">{isRTL ? 'سنة' : 'Year'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'اسم التقرير' : 'Report Name'}</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder={`${typeLabel(reportType)} (${rangeLabel()})`}
                className="bg-card border-border text-foreground dark:bg-[#243638]"
              />
              <p className="text-xs text-muted-foreground">{rangeLabel()}</p>
            </div>
            {createError && (
              <p className="text-xs text-red-600 dark:text-red-400">{createError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type ReportItem = {
  id: string;
  title: string;
  date: string;
  createdAt?: Date;
  type: string;
  typeId: 'satisfaction' | 'stress' | 'alerts';
  periodId: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  size: string;
  range?: string;
};

function getFixedReports(language: 'ar' | 'en'): ReportItem[] {
  const labels = [
    { id: 'daily', ar: 'يومي', en: 'Daily' },
    { id: 'weekly', ar: 'أسبوعي', en: 'Weekly' },
    { id: 'monthly', ar: 'شهري', en: 'Monthly' },
    { id: 'yearly', ar: 'سنوي', en: 'Yearly' }
  ];
  const types = [
    { id: 'satisfaction', ar: 'تقرير الرضا', en: 'Satisfaction Report' },
    { id: 'stress', ar: 'تقرير الإجهاد', en: 'Stress Report' },
    { id: 'alerts', ar: 'تقرير التنبيهات', en: 'Alerts Report' }
  ];
  const today = new Date().toISOString().slice(0, 10);
  const items: ReportItem[] = [];
  labels.forEach((period) => {
    types.forEach((type) => {
      items.push({
        id: `${period.id}-${type.id}`,
        title: `${language === 'ar' ? type.ar : type.en} • ${language === 'ar' ? period.ar : period.en}`,
        date: today,
        type: language === 'ar' ? period.ar : period.en,
        typeId: type.id as ReportItem['typeId'],
        periodId: period.id as ReportItem['periodId'],
        size: `${(1 + Math.random() * 9).toFixed(1)} MB`
      });
    });
  });
  return items;
}
