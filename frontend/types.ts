// Enumerações para status e tipos
export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export enum BloodType {
  A_POS = 'A_POS', A_NEG = 'A_NEG',
  B_POS = 'B_POS', B_NEG = 'B_NEG',
  AB_POS = 'AB_POS', AB_NEG = 'AB_NEG',
  O_POS = 'O_POS', O_NEG = 'O_NEG'
}

// 1. Schema do Usuário
export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  // Campos específicos para médicos
  crm?: string;
  specialty?: string;
  titles?: string; // Ex: "Mestre em Obstetrícia, Doutor pela USP"
}

// 2. Schema de Dados da Gestação (Vinculado à Paciente)
export interface PregnancyData {
  id: string;
  patientId: string;
  dum: string; // Data da Última Menstruação (ISO Date)
  dpp: string; // Data Provável do Parto (Calculada)
  initialWeight: number; // kg
  preGestationalHeight: number; // cm
  preGestationalBMI: number;
  bloodType: BloodType;
  spouseBloodType?: BloodType;
  weightGoalMax: number;
  weightGoalMin: number;
  theme: 'NEUTRAL' | 'BOY' | 'GIRL';
}

// 3. Schema de Consultas (Prontuário)
export interface Consultation {
  id: string;
  patientId: string; // Adicionado
  date: string;
  gestationalAgeWeeks: number;
  uterineHeight?: number; // cm
  bloodPressure?: string; // "120/80"
  fetalHeartRate?: number; // bpm
  currentWeight: number;
  edema: boolean; // Presença de inchaço
  notes: string;
  prescription: string;
  requestedExams: string[];
  status: 'SCHEDULED' | 'COMPLETED';
}

// 4. Schema de Vacinas
export interface Vaccine {
  id: string;
  patientId: string; // Adicionado
  name: string;
  dose: number;
  totalDoses: number;
  dateAdministered?: string;
  status: 'PENDING' | 'DONE' | 'LATE';
  notes?: string;
  // Campos de Assinatura Digital
  prescribedBy?: string; // Nome do médico
  doctorCrm?: string;
  digitalSignature?: string; // Hash simulado
  requestDate?: string;
}

// 5. Schema de Exames (Arquivos)
export interface ExamResult {
  id: string;
  patientId: string; // Adicionado
  name: string;
  date: string;
  fileUrl?: string; // URL simulada
  type: 'PDF' | 'IMAGE';
  status: 'UPLOADED' | 'REVIEWED' | 'REQUESTED' | 'REALIZED';
  // Campos de Assinatura Digital
  doctorName?: string;
  doctorCrm?: string;
  digitalSignature?: string; // Hash simulado
}

// 6. Schema de Alertas
export interface Alert {
  id: string;
  userId?: string; // Opcional se for geral, ou obrigatório se for pessoal
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS';
  date: string;
  read: boolean;
  targetRole: UserRole | 'BOTH';
}

// 7. Schema de Dicas
export interface Tip {
  id: string;
  minWeek: number;
  maxWeek: number;
  category: string;
  title: string;
  content: string;
  readTime: string;
}

export interface Comment {
  id: string;
  postId: string; // Adicionado
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorName: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}