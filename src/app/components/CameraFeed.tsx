import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Camera as CameraType, DetectedPerson } from '../types';
import { 
  Circle, 
  Activity, 
  Wifi, 
  WifiOff,
  Maximize2,
  AlertTriangle 
} from 'lucide-react';
import { cameraFeedColors } from '../theme';

interface CameraFeedProps {
  camera: CameraType;
  onMaximize?: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ camera, onMaximize }) => {
  const { language, stateColors } = useApp();
  const [timestamp, setTimestamp] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const colors = cameraFeedColors;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw AI overlays for each detected person
    camera.detectedPersons.forEach(person => {
      drawPersonOverlay(ctx, person, canvas.width, canvas.height);
    });
  }, [camera.detectedPersons, stateColors]);

  const drawPersonOverlay = (
    ctx: CanvasRenderingContext2D, 
    person: DetectedPerson,
    width: number,
    height: number
  ) => {
    const { boundingBox, face, skeleton, satisfaction, attention, stress, risk, confidence, id } = person;

    // Convert normalized coordinates to canvas coordinates
    const x = boundingBox.x * width;
    const y = boundingBox.y * height;
    const w = boundingBox.width * width;
    const h = boundingBox.height * height;

    // Determine primary state color
    const getSatisfactionColor = () => {
      if (satisfaction === 'high') return stateColors.satisfaction.high;
      if (satisfaction === 'medium') return stateColors.satisfaction.medium;
      return stateColors.satisfaction.low;
    };

    const getAttentionColor = () => {
      if (attention === 'high') return stateColors.attention.high;
      if (attention === 'medium') return stateColors.attention.medium;
      return stateColors.attention.low;
    };

    const getRiskColor = () => {
      if (risk === 'critical') return stateColors.risk.critical;
      if (risk === 'high') return stateColors.risk.high;
      if (risk === 'medium') return stateColors.risk.medium;
      if (risk === 'low') return stateColors.risk.low;
      return stateColors.risk.none;
    };

    const primaryColor = getSatisfactionColor();

    // Draw bounding box
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Draw corner accents
    const cornerLength = 12;
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLength);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLength, y);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLength, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerLength);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerLength);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerLength, y + h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLength, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerLength);
    ctx.stroke();

    // Draw face detection if available
    if (face) {
      const fx = face.boundingBox.x * width;
      const fy = face.boundingBox.y * height;
      const fw = face.boundingBox.width * width;
      const fh = face.boundingBox.height * height;

      ctx.strokeStyle = getAttentionColor();
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(fx, fy, fw, fh);
      ctx.setLineDash([]);

      // Draw facial landmarks
      if (face.landmarks) {
        ctx.fillStyle = getAttentionColor();
        face.landmarks.forEach(landmark => {
          const lx = landmark.x * width;
          const ly = landmark.y * height;
          ctx.beginPath();
          ctx.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Draw skeleton keypoints if available
    if (skeleton && skeleton.points.length > 0) {
      ctx.strokeStyle = primaryColor;
      ctx.fillStyle = primaryColor;
      ctx.lineWidth = 2;

      // Draw keypoints
      skeleton.points.forEach(point => {
        const px = point.x * width;
        const py = point.y * height;
        
        if (point.confidence > 0.5) {
          ctx.globalAlpha = point.confidence;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Draw skeleton connections (simplified)
      const connections = [
        [0, 1], [1, 2], [2, 3], // head to shoulders
        [1, 4], [4, 5], [5, 6], // right arm
        [1, 7], [7, 8], [8, 9], // left arm
        [1, 10], [10, 11], [11, 12], // right leg
        [1, 13], [13, 14], [14, 15] // left leg
      ];

      ctx.globalAlpha = 0.6;
      connections.forEach(([i, j]) => {
        if (skeleton.points[i] && skeleton.points[j]) {
          const p1 = skeleton.points[i];
          const p2 = skeleton.points[j];
          if (p1.confidence > 0.5 && p2.confidence > 0.5) {
            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
    }

    // Draw info panel
    const panelWidth = 180;
    const panelHeight = 90;
    const panelX = x + w + 8 < width - panelWidth ? x + w + 8 : x - panelWidth - 8;
    const panelY = y;

    // Panel background
    ctx.fillStyle = colors.overlayBg;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // ID and confidence
    ctx.fillStyle = colors.overlayText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`ID: ${id}`, panelX + 8, panelY + 16);
    ctx.fillStyle = colors.overlayMuted;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${Math.round(confidence * 100)}% confidence`, panelX + 8, panelY + 30);

    // State indicators
    const indicators = [
      { label: language === 'ar' ? 'رضا' : 'Sat', color: getSatisfactionColor(), value: satisfaction },
      { label: language === 'ar' ? 'انتباه' : 'Att', color: getAttentionColor(), value: attention },
      { label: language === 'ar' ? 'إجهاد' : 'Str', color: stateColors.stress[stress], value: stress }
    ];

    if (camera.context === 'airport' && risk !== 'none') {
      indicators.push({ 
        label: language === 'ar' ? 'خطر' : 'Risk', 
        color: getRiskColor(), 
        value: risk 
      });
    }

    let indicatorY = panelY + 42;
    indicators.forEach(ind => {
      // Color dot
      ctx.fillStyle = ind.color;
      ctx.beginPath();
      ctx.arc(panelX + 12, indicatorY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = colors.overlayLabel;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(ind.label, panelX + 22, indicatorY + 3);

      // Value
      ctx.fillStyle = ind.color;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(ind.value.toUpperCase(), panelX + panelWidth - 45, indicatorY + 3);

      indicatorY += 14;
    });
  };

  const statusColor = {
    online: stateColors.system.online,
    offline: stateColors.system.offline,
    warning: stateColors.system.warning,
    error: stateColors.system.error
  }[camera.status];

  return (
    <>
      <div
        className="relative bg-card rounded-lg overflow-hidden border border-border group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Camera Image */}
      <div className="relative aspect-video">
        <img
          src={getCameraImage(camera.context)}
          alt={camera.name}
          className="w-full h-full object-cover"
        />
        
        {/* AI Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Maximize button */}
        {isHovered && onMaximize && (
          <button
            onClick={onMaximize}
            className="absolute top-2 right-2 p-2 bg-card/80 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Camera Info Bar */}
      <div
        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3"
        style={{ '--camera-fps': colors.fpsText } as React.CSSProperties}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-[color:var(--camera-fps)]">{camera.fps} FPS</span>
          </div>
          <div className="flex items-center gap-3">
            {camera.recording && (
              <div className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-destructive fill-destructive animate-pulse" />
                <span className="text-destructive text-xs">REC</span>
              </div>
            )}
            {camera.status === 'online' ? (
              <Wifi className="w-4 h-4 text-[color:var(--chart-4)]" />
            ) : (
              <WifiOff className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
      </div>

      {/* Offline Overlay */}
      {camera.status === 'offline' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <WifiOff className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'الكاميرا غير متصلة' : 'Camera Offline'}
            </p>
          </div>
        </div>
      )}
      </div>
      {/* Under Video Bar */}
      <div className="flex items-center justify-between gap-4 border-t border-border bg-card/80 px-3 py-2 text-xs">
        <div className="flex flex-col">
          <span className="text-foreground font-medium">{camera.name}</span>
          <span className="text-muted-foreground">{camera.location}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            {camera.detectedPersons.length} {language === 'ar' ? 'شخص' : 'people'}
          </span>
          <span>{timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
    </>
  );
};

// Helper function to get camera images based on context
function getCameraImage(context: string): string {
  const images = {
    university: 'https://images.unsplash.com/photo-1758270704384-9df36d94a29d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzY4MDczMzk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    supermarket: 'https://images.unsplash.com/photo-1661260518151-114b0c165416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcm1hcmtldCUyMHNob3BwaW5nJTIwcGVvcGxlfGVufDF8fHx8MTc2ODA3MzM5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    serviceCounter: 'https://images.unsplash.com/photo-1759753802655-4cb6b79d30d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2aWNlJTIwY291bnRlciUyMGN1c3RvbWVyfGVufDF8fHx8MTc2ODA3MzM5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    meetingRoom: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjByb29tfGVufDF8fHx8MTc2ODA3MzM5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    crowd: 'https://images.unsplash.com/photo-1718030021211-26404142ef22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm93ZCUyMHBlb3BsZSUyMHB1YmxpY3xlbnwxfHx8fDE3NjgwNzMzOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    airport: 'https://images.unsplash.com/photo-1730013797851-1272c3c1a831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwdGVybWluYWwlMjBwYXNzZW5nZXJzfGVufDF8fHx8MTc2ODA3MzM5OHww&ixlib=rb-4.1.0&q=80&w=1080'
  };
  return images[context as keyof typeof images] || images.university;
}
