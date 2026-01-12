import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n/translations';
import { Camera as CameraType, DetectedPerson } from '../types';
import { CameraFeed } from './CameraFeed';
import { Grid3x3, Grid2x2, List, Search, Maximize2, Minimize2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Slider } from './ui/slider';

export const CameraWall: React.FC = () => {
  const { language, selectedProfile, cameraCount } = useApp();
  const [layout, setLayout] = useState<'2x2' | '3x3' | 'list'>('3x3');
  const [filterContext, setFilterContext] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCameraName, setNewCameraName] = useState('');
  const [newCameraLocation, setNewCameraLocation] = useState('');
  const [newCameraContext, setNewCameraContext] = useState<CameraType['context']>('university');
  const [newCameraSensitivity, setNewCameraSensitivity] = useState([50]);

  const contextKeyMap: Record<string, string> = {
    university: 'university',
    market: 'supermarket',
    service: 'serviceCounter',
    airport: 'airport',
    public: 'crowd',
    work: 'meetingRoom'
  };
  const selectedContextKey = selectedProfile ? contextKeyMap[selectedProfile] : null;

  useEffect(() => {
    // Generate mock camera data with realistic detection
    const mockCameras: CameraType[] = [
      // University cameras
      ...generateContextCameras('university', 3, 'Building A', [
        { count: 4, satisfaction: ['high', 'high', 'medium', 'high'], attention: ['high', 'medium', 'high', 'high'] },
        { count: 5, satisfaction: ['medium', 'high', 'medium', 'low', 'high'], attention: ['medium', 'medium', 'high', 'low', 'medium'] },
        { count: 3, satisfaction: ['high', 'high', 'medium'], attention: ['high', 'high', 'medium'] }
      ]),
      
      // Supermarket cameras
      ...generateContextCameras('supermarket', 3, 'Store Floor', [
        { count: 6, satisfaction: ['medium', 'high', 'low', 'medium', 'high', 'medium'], attention: ['low', 'medium', 'low', 'high', 'medium', 'low'] },
        { count: 7, satisfaction: ['high', 'medium', 'medium', 'low', 'high', 'medium', 'high'], attention: ['medium', 'low', 'medium', 'low', 'high', 'medium', 'medium'] },
        { count: 5, satisfaction: ['medium', 'high', 'medium', 'high', 'low'], attention: ['medium', 'medium', 'low', 'high', 'low'] }
      ]),
      
      // Service Counter cameras
      ...generateContextCameras('serviceCounter', 2, 'Service Area', [
        { count: 2, satisfaction: ['low', 'medium'], attention: ['high', 'high'], stress: ['high', 'medium'] },
        { count: 3, satisfaction: ['medium', 'high', 'low'], attention: ['high', 'medium', 'high'], stress: ['medium', 'low', 'high'] }
      ]),
      
      // Meeting Room cameras
      ...generateContextCameras('meetingRoom', 2, 'Conference Wing', [
        { count: 4, satisfaction: ['high', 'high', 'medium', 'high'], attention: ['high', 'high', 'high', 'medium'] },
        { count: 6, satisfaction: ['high', 'medium', 'high', 'high', 'medium', 'high'], attention: ['high', 'high', 'medium', 'high', 'high', 'high'] }
      ]),
      
      // Crowd cameras
      ...generateContextCameras('crowd', 2, 'Public Area', [
        { count: 8, satisfaction: ['medium', 'high', 'low', 'medium', 'high', 'medium', 'low', 'high'], attention: ['low', 'medium', 'low', 'low', 'medium', 'low', 'medium', 'high'] },
        { count: 10, satisfaction: ['medium', 'low', 'medium', 'high', 'low', 'medium', 'high', 'medium', 'low', 'high'], attention: ['low', 'low', 'medium', 'medium', 'low', 'medium', 'high', 'low', 'low', 'medium'] }
      ]),
      
      // Airport cameras
      ...generateContextCameras('airport', 3, 'Terminal', [
        { count: 5, satisfaction: ['medium', 'high', 'low', 'medium', 'high'], attention: ['high', 'medium', 'medium', 'high', 'low'], risk: ['none', 'none', 'low', 'none', 'none'] },
        { count: 4, satisfaction: ['high', 'medium', 'medium', 'high'], attention: ['medium', 'high', 'medium', 'high'], risk: ['none', 'none', 'medium', 'none'] },
        { count: 6, satisfaction: ['medium', 'low', 'high', 'medium', 'high', 'medium'], attention: ['high', 'medium', 'high', 'medium', 'high', 'low'], risk: ['none', 'low', 'none', 'none', 'none', 'none'] }
      ])
    ];

    setCameras(mockCameras);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCameras(prevCameras => 
        prevCameras.map(camera => ({
          ...camera,
          detectedPersons: camera.detectedPersons.map(person => ({
            ...person,
            satisfaction: randomState(['high', 'medium', 'low'], person.satisfaction) as any,
            attention: randomState(['high', 'medium', 'low'], person.attention) as any,
            stress: randomState(['low', 'medium', 'high'], person.stress) as any,
            confidence: Math.max(0.7, Math.min(0.99, person.confidence + (Math.random() - 0.5) * 0.05))
          }))
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContextKey) {
      setFilterContext(selectedContextKey);
    }
  }, [selectedContextKey]);

  const filteredCameras = cameras.filter(camera => {
    if (selectedContextKey && camera.context !== selectedContextKey) return false;
    if (filterContext !== 'all' && camera.context !== filterContext) return false;
    if (searchQuery && !camera.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !camera.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const limitedCameras = cameraCount > 0 ? filteredCameras.slice(0, cameraCount) : filteredCameras;

  useEffect(() => {
    if (limitedCameras.length === 0) {
      setActiveCameraId(null);
      return;
    }
    if (!activeCameraId || !limitedCameras.some((cam) => cam.id === activeCameraId)) {
      setActiveCameraId(limitedCameras[0].id);
    }
  }, [activeCameraId, limitedCameras]);

  const activeCamera = limitedCameras.find((cam) => cam.id === activeCameraId) || null;

  const computeAnalytics = (camera: CameraType | null) => {
    if (!camera) {
      return {
        people: 0,
        satisfaction: 0,
        attention: 0,
        stress: 0,
        risk: 0
      };
    }
    const toScore = (value: string) => (value === 'high' ? 90 : value === 'medium' ? 65 : 40);
    const safeAvg = (values: number[]) =>
      values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const people = camera.detectedPersons.length;
    const satisfaction = safeAvg(camera.detectedPersons.map((p) => toScore(p.satisfaction)));
    const attention = safeAvg(camera.detectedPersons.map((p) => toScore(p.attention)));
    const stress = safeAvg(camera.detectedPersons.map((p) => toScore(p.stress)));
    const risk = camera.detectedPersons.filter((p) => p.risk && p.risk !== 'none').length;
    return { people, satisfaction, attention, stress, risk };
  };

  const [liveAnalytics, setLiveAnalytics] = useState(() => computeAnalytics(null));

  useEffect(() => {
    setLiveAnalytics(computeAnalytics(activeCamera));
  }, [activeCamera]);

  useEffect(() => {
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const timer = setInterval(() => {
      setLiveAnalytics((prev) => ({
        people: Math.max(0, prev.people + Math.floor(Math.random() * 3) - 1),
        satisfaction: clamp(prev.satisfaction + Math.floor(Math.random() * 3) - 1),
        attention: clamp(prev.attention + Math.floor(Math.random() * 3) - 1),
        stress: clamp(prev.stress + Math.floor(Math.random() * 3) - 1),
        risk: Math.max(0, prev.risk + (Math.random() > 0.85 ? 1 : 0) - (Math.random() > 0.85 ? 1 : 0))
      }));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const analytics = liveAnalytics;

  const gridClass = {
    '2x2': 'grid-cols-1 md:grid-cols-2',
    '3x3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'list': 'grid-cols-1'
  }[layout];

  const handleAddCamera = () => {
    const name = newCameraName.trim() || `Camera ${cameras.length + 1}`;
    const location = newCameraLocation.trim() || (language === 'ar' ? 'موقع' : 'Location');
    const context = selectedContextKey ? (selectedContextKey as CameraType['context']) : newCameraContext;
    const camera: CameraType = {
      id: `CAM-${context}-${Date.now()}`,
      name,
      location,
      context,
      status: 'online',
      fps: 25,
      recording: true,
      resolution: '1920x1080',
      lastSeen: new Date(),
      detectedPersons: []
    };
    setCameras((prev) => [camera, ...prev]);
    setActiveCameraId(camera.id);
    setIsAddOpen(false);
    setNewCameraName('');
    setNewCameraLocation('');
    setNewCameraSensitivity([50]);
  };

  return (
    <div className="space-y-6">
      {activeCamera && (
        <div className="space-y-4">
          <div className="bg-card/80 border border-border rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs">
                  {language === 'ar' ? 'تحليلات البث المباشر' : 'Live Feed Analytics'}
                </p>
                <h2 className="text-foreground font-semibold">{activeCamera.name}</h2>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="text-muted-foreground">
                  {language === 'ar' ? 'الأشخاص' : 'People'}:{' '}
                  <span className="text-foreground font-semibold">{analytics.people}</span>
                </div>
                <div className="text-muted-foreground">
                  {language === 'ar' ? 'الرضا' : 'Satisfaction'}:{' '}
                  <span className="text-primary font-semibold">{analytics.satisfaction}%</span>
                </div>
                <div className="text-muted-foreground">
                  {language === 'ar' ? 'الانتباه' : 'Attention'}:{' '}
                  <span className="text-accent font-semibold">{analytics.attention}%</span>
                </div>
                <div className="text-muted-foreground">
                  {language === 'ar' ? 'الإجهاد' : 'Stress'}:{' '}
                  <span className="text-[color:var(--chart-5)] font-semibold">{analytics.stress}%</span>
                </div>
                <div className="text-muted-foreground">
                  {language === 'ar' ? 'المخاطر' : 'Risk'}:{' '}
                  <span className="text-destructive font-semibold">{analytics.risk}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-lg border border-border bg-card/80 p-2 text-foreground hover:bg-secondary transition-colors"
              aria-label={language === 'ar' ? 'تكبير' : 'Fullscreen'}
              title={language === 'ar' ? 'تكبير' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <CameraFeed camera={activeCamera} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'بحث عن كاميرا...' : 'Search cameras...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/80 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة كاميرا' : 'Add Camera'}
        </Button>

        <div className="flex gap-2 bg-card/80 border border-border rounded-lg p-1">
          <button
            onClick={() => setLayout('2x2')}
            className={`p-2 rounded transition-colors ${
              layout === '2x2' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('3x3')}
            className={`p-2 rounded transition-colors ${
              layout === '3x3' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={`p-2 rounded transition-colors ${
              layout === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/80 border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('totalCameras', language)}</p>
          <p className="text-2xl font-bold text-foreground">{limitedCameras.length}</p>
        </div>
        <div className="bg-card/80 border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('online', language)}</p>
          <p className="text-2xl font-bold text-[color:var(--chart-4)]">
            {limitedCameras.filter(c => c.status === 'online').length}
          </p>
        </div>
        <div className="bg-card/80 border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('peopleDetected', language)}</p>
          <p className="text-2xl font-bold text-accent">
            {limitedCameras.reduce((sum, c) => sum + c.detectedPersons.length, 0)}
          </p>
        </div>
        <div className="bg-card/80 border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('recording', language)}</p>
          <p className="text-2xl font-bold text-destructive">
            {limitedCameras.filter(c => c.recording).length}
          </p>
        </div>
      </div>

      {/* Camera Grid */}
      <div className={`grid ${gridClass} gap-6`}>
        {limitedCameras.map(camera => (
          <button
            key={camera.id}
            type="button"
            onClick={() => setActiveCameraId(camera.id)}
            className="text-left"
          >
            <CameraFeed camera={camera} />
          </button>
        ))}
      </div>

      {limitedCameras.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'لا توجد كاميرات متطابقة' : 'No cameras match the filters'}
          </p>
        </div>
      )}

      {activeCamera && isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0 p-4 md:p-8">
            <div className="flex h-full flex-col gap-4">
              <div className="bg-card/90 border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {language === 'ar' ? 'تحليلات البث المباشر' : 'Live Feed Analytics'}
                  </p>
                  <h2 className="text-foreground font-semibold">{activeCamera.name}</h2>
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="text-muted-foreground">
                    {language === 'ar' ? 'الأشخاص' : 'People'}:{' '}
                    <span className="text-foreground font-semibold">{analytics.people}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {language === 'ar' ? 'الرضا' : 'Satisfaction'}:{' '}
                    <span className="text-primary font-semibold">{analytics.satisfaction}%</span>
                  </div>
                  <div className="text-muted-foreground">
                    {language === 'ar' ? 'الانتباه' : 'Attention'}:{' '}
                    <span className="text-accent font-semibold">{analytics.attention}%</span>
                  </div>
                  <div className="text-muted-foreground">
                    {language === 'ar' ? 'الإجهاد' : 'Stress'}:{' '}
                    <span className="text-[color:var(--chart-5)] font-semibold">{analytics.stress}%</span>
                  </div>
                  <div className="text-muted-foreground">
                    {language === 'ar' ? 'المخاطر' : 'Risk'}:{' '}
                    <span className="text-destructive font-semibold">{analytics.risk}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="ml-4 flex items-center justify-center rounded-lg border border-border bg-card/80 p-2 text-foreground hover:bg-secondary transition-colors"
                  aria-label={language === 'ar' ? 'تصغير' : 'Exit fullscreen'}
                  title={language === 'ar' ? 'تصغير' : 'Exit fullscreen'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1 rounded-xl overflow-hidden border border-border bg-black/40">
                <CameraFeed camera={activeCamera} />
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-lg border border-border bg-card/80 p-2 text-foreground hover:bg-secondary transition-colors"
                  aria-label={language === 'ar' ? 'تصغير' : 'Exit fullscreen'}
                  title={language === 'ar' ? 'تصغير' : 'Exit fullscreen'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'إضافة كاميرا' : 'Add Camera'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'سمِّ الكاميرا واضبط حساسية التنبيهات.' : 'Name the camera and adjust alert sensitivity.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {language === 'ar' ? 'اسم الكاميرا' : 'Camera Name'}
              </label>
              <Input
                value={newCameraName}
                onChange={(e) => setNewCameraName(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: كاميرا المدخل' : 'e.g. Entry Camera'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {language === 'ar' ? 'الموقع' : 'Location'}
              </label>
              <Input
                value={newCameraLocation}
                onChange={(e) => setNewCameraLocation(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: الطابق الأول' : 'e.g. Floor 1'}
              />
            </div>
            {!selectedContextKey && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {language === 'ar' ? 'السياق' : 'Context'}
                </label>
                <select
                  value={newCameraContext}
                  onChange={(e) => setNewCameraContext(e.target.value as CameraType['context'])}
                  className="h-9 w-full rounded-md border border-border bg-card/80 px-3 text-sm text-foreground"
                >
                  <option value="university">{t('university', language)}</option>
                  <option value="supermarket">{t('supermarket', language)}</option>
                  <option value="serviceCounter">{t('serviceCounter', language)}</option>
                  <option value="meetingRoom">{t('meetingRoom', language)}</option>
                  <option value="crowd">{t('crowd', language)}</option>
                  <option value="airport">{t('airport', language)}</option>
                </select>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{language === 'ar' ? 'الحساسية' : 'Sensitivity'}</span>
                <span>{newCameraSensitivity[0]}%</span>
              </div>
              <Slider
                value={newCameraSensitivity}
                onValueChange={setNewCameraSensitivity}
                max={100}
                step={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAddCamera}>
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper functions
function generateContextCameras(
  context: string,
  count: number,
  locationPrefix: string,
  detectionConfig: Array<{ count: number; satisfaction: string[]; attention: string[]; stress?: string[]; risk?: string[] }>
): CameraType[] {
  const cameras: CameraType[] = [];
  
  for (let i = 0; i < count; i++) {
    const config = detectionConfig[i];
    const persons: DetectedPerson[] = [];
    
    for (let j = 0; j < config.count; j++) {
      persons.push({
        id: `P${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        boundingBox: generateRandomBoundingBox(),
        face: Math.random() > 0.3 ? {
          boundingBox: generateRandomBoundingBox(0.1, 0.15),
          landmarks: generateFaceLandmarks(),
          confidence: 0.85 + Math.random() * 0.14
        } : null,
        skeleton: Math.random() > 0.2 ? {
          points: generateSkeletonKeypoints(),
          confidence: 0.75 + Math.random() * 0.24
        } : null,
        satisfaction: (config.satisfaction[j] || 'medium') as any,
        attention: (config.attention[j] || 'medium') as any,
        stress: (config.stress?.[j] || 'low') as any,
        risk: (config.risk?.[j] || 'none') as any,
        confidence: 0.82 + Math.random() * 0.17,
        timestamp: new Date()
      });
    }
    
    cameras.push({
      id: `CAM-${context}-${i + 1}`,
      name: `${context.charAt(0).toUpperCase() + context.slice(1)} ${i + 1}`,
      location: `${locationPrefix} ${i + 1}`,
      context: context as any,
      status: Math.random() > 0.1 ? 'online' : 'offline',
      fps: 25 + Math.floor(Math.random() * 6),
      recording: Math.random() > 0.3,
      resolution: '1920x1080',
      lastSeen: new Date(),
      detectedPersons: persons
    });
  }
  
  return cameras;
}

function generateRandomBoundingBox(minSize = 0.15, maxSize = 0.35): { x: number; y: number; width: number; height: number; confidence: number } {
  const width = minSize + Math.random() * (maxSize - minSize);
  const height = width * (1.5 + Math.random() * 0.5);
  return {
    x: Math.random() * (1 - width),
    y: Math.random() * (1 - height),
    width,
    height,
    confidence: 0.85 + Math.random() * 0.14
  };
}

function generateFaceLandmarks(): Array<{ type: string; x: number; y: number }> {
  return [
    { type: 'leftEye', x: 0.35, y: 0.35 },
    { type: 'rightEye', x: 0.65, y: 0.35 },
    { type: 'nose', x: 0.5, y: 0.55 },
    { type: 'leftMouth', x: 0.38, y: 0.75 },
    { type: 'rightMouth', x: 0.62, y: 0.75 }
  ].map(l => ({
    ...l,
    x: l.x + (Math.random() - 0.5) * 0.1,
    y: l.y + (Math.random() - 0.5) * 0.1
  }));
}

function generateSkeletonKeypoints(): Array<{ type: string; x: number; y: number; confidence: number }> {
  const base = [
    { type: 'head', x: 0.5, y: 0.15 },
    { type: 'neck', x: 0.5, y: 0.25 },
    { type: 'rightShoulder', x: 0.35, y: 0.3 },
    { type: 'rightElbow', x: 0.25, y: 0.45 },
    { type: 'rightWrist', x: 0.2, y: 0.6 },
    { type: 'leftShoulder', x: 0.65, y: 0.3 },
    { type: 'leftElbow', x: 0.75, y: 0.45 },
    { type: 'leftWrist', x: 0.8, y: 0.6 },
    { type: 'rightHip', x: 0.42, y: 0.55 },
    { type: 'rightKnee', x: 0.4, y: 0.75 },
    { type: 'rightAnkle', x: 0.38, y: 0.95 },
    { type: 'leftHip', x: 0.58, y: 0.55 },
    { type: 'leftKnee', x: 0.6, y: 0.75 },
    { type: 'leftAnkle', x: 0.62, y: 0.95 }
  ];
  
  return base.map(p => ({
    ...p,
    x: p.x + (Math.random() - 0.5) * 0.1,
    y: p.y + (Math.random() - 0.5) * 0.05,
    confidence: 0.6 + Math.random() * 0.39
  }));
}

function randomState<T>(states: T[], current: T): T {
  if (Math.random() > 0.8) {
    return states[Math.floor(Math.random() * states.length)];
  }
  return current;
}
