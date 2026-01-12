export interface Camera {
  id: string;
  name: string;
  location: string;
  context: 'university' | 'supermarket' | 'serviceCounter' | 'meetingRoom' | 'crowd' | 'airport';
  status: 'online' | 'offline' | 'warning' | 'error';
  fps: number;
  recording: boolean;
  resolution: string;
  lastSeen: Date;
  detectedPersons: DetectedPerson[];
}

export interface DetectedPerson {
  id: string;
  boundingBox: BoundingBox;
  face: FaceDetection | null;
  skeleton: SkeletonKeypoints | null;
  satisfaction: 'high' | 'medium' | 'low';
  attention: 'high' | 'medium' | 'low';
  stress: 'low' | 'medium' | 'high';
  risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: Date;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FaceDetection {
  boundingBox: BoundingBox;
  landmarks: FaceLandmark[];
  confidence: number;
}

export interface FaceLandmark {
  type: 'leftEye' | 'rightEye' | 'nose' | 'leftMouth' | 'rightMouth';
  x: number;
  y: number;
}

export interface SkeletonKeypoints {
  points: Keypoint[];
  confidence: number;
}

export interface Keypoint {
  type: string;
  x: number;
  y: number;
  confidence: number;
}

export interface Alert {
  id: string;
  type: 'security' | 'behavior' | 'system' | 'satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  acknowledged: boolean;
  personId?: string;
}

export interface AnalyticsData {
  timestamp: Date;
  satisfactionAvg: number;
  attentionAvg: number;
  stressAvg: number;
  peopleCount: number;
  cameraId?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  email: string;
  lastLogin: Date;
  active: boolean;
}

export interface Session {
  id: string;
  userId: string;
  username: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  details: string;
}
