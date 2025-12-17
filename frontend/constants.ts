import { BloodType, Consultation, ExamResult, Post, PregnancyData, User, UserRole, Vaccine, Tip } from './types';
import { calculateDPP } from './utils';

const MOCK_DUM = '2023-11-15'; // Exemplo

export const CURRENT_USER_DOCTOR: User = {
  id: 'u1',
  name: 'Dr. Roberto Santos',
  role: UserRole.DOCTOR,
  crm: '12345-SP',
  avatarUrl: 'https://picsum.photos/100/100'
};

export const CURRENT_USER_PATIENT: User = {
  id: 'u2',
  name: 'Mariana Silva',
  role: UserRole.PATIENT,
  avatarUrl: 'https://picsum.photos/101/101'
};

export const SECOND_PATIENT: User = { 
  id: 'u3', 
  name: 'Juliana Costa', 
  role: UserRole.PATIENT, 
  avatarUrl: 'https://picsum.photos/102/102' 
};

// Credenciais para teste
export const MOCK_CREDENTIALS = {
  DOCTOR: { email: 'medico@jornada.com', pass: '123456' },
  PATIENT_1: { login: 'mariana.silva', pass: '123456' },
  PATIENT_2: { login: 'juliana.costa', pass: '123456' }
};

export const MOCK_PREGNANCY_DATA: PregnancyData = {
  id: 'p1',
  patientId: 'u2',
  dum: MOCK_DUM,
  dpp: calculateDPP(MOCK_DUM).toISOString(),
  initialWeight: 62.0,
  preGestationalHeight: 165,
  preGestationalBMI: 22.8,
  bloodType: BloodType.A_POS,
  spouseBloodType: BloodType.O_POS,
  weightGoalMin: 11,
  weightGoalMax: 16
};

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'c1',
    date: '2024-01-10',
    gestationalAgeWeeks: 8,
    uterineHeight: 0,
    bloodPressure: '110/70',
    fetalHeartRate: 150,
    currentWeight: 63.5,
    edema: false,
    notes: 'Primeira consulta. Paciente apresenta náuseas leves.',
    prescription: 'Ácido Fólico 5mg, Dramin se necessário.',
    requestedExams: ['Hemograma Completo', 'Tipagem Sanguínea'],
    status: 'COMPLETED'
  },
  {
    id: 'c2',
    date: '2024-02-15',
    gestationalAgeWeeks: 13,
    uterineHeight: 10,
    bloodPressure: '115/75',
    fetalHeartRate: 155,
    currentWeight: 64.8,
    edema: false,
    notes: 'Translucência nucal normal. Desenvolvimento adequado.',
    prescription: 'Manter vitaminas.',
    requestedExams: ['Urina Tipo 1'],
    status: 'COMPLETED'
  },
  {
    id: 'c3',
    date: '2024-03-20',
    gestationalAgeWeeks: 18,
    uterineHeight: 16,
    bloodPressure: '120/80',
    fetalHeartRate: 148,
    currentWeight: 66.2,
    edema: true,
    notes: 'Leve edema em membros inferiores ao final do dia.',
    prescription: 'Meias de compressão suave.',
    requestedExams: ['Ultrassom Morfológico'],
    status: 'COMPLETED'
  },
  {
    id: 'c4',
    date: '2024-04-18',
    gestationalAgeWeeks: 22,
    uterineHeight: undefined,
    bloodPressure: '',
    fetalHeartRate: undefined,
    currentWeight: 0,
    edema: false,
    notes: '',
    prescription: '',
    requestedExams: [],
    status: 'SCHEDULED'
  }
];

export const MOCK_VACCINES: Vaccine[] = [
  { id: 'v1', name: 'Influenza (Gripe)', dose: 1, totalDoses: 1, status: 'DONE', dateAdministered: '2024-01-10' },
  { id: 'v2', name: 'Hepatite B', dose: 1, totalDoses: 3, status: 'DONE', dateAdministered: '2023-05-20' },
  { id: 'v3', name: 'Hepatite B', dose: 2, totalDoses: 3, status: 'PENDING' },
  { id: 'v4', name: 'dTpa', dose: 1, totalDoses: 1, status: 'LATE', notes: 'Agendar urgentemente' },
];

export const MOCK_EXAMS: ExamResult[] = [
  { id: 'e1', name: 'Ultrassom 1º Trimestre', date: '2024-01-12', type: 'IMAGE', status: 'REVIEWED' },
  { id: 'e2', name: 'Hemograma Completo', date: '2024-01-15', type: 'PDF', status: 'REVIEWED' },
  { id: 'e3', name: 'Ultrassom Morfológico', date: '2024-03-25', type: 'IMAGE', status: 'UPLOADED' },
];

export const TIMELINE_INFO = [
  { month: 1, weeks: '1-4', size: 'Semente de Papoula', desc: 'O óvulo fertilizado se implanta no útero.' },
  { month: 2, weeks: '5-8', size: 'Framboesa', desc: 'O coração começa a bater. Tubo neural se forma.' },
  { month: 3, weeks: '9-12', size: 'Ameixa', desc: 'Formação de dedos e unhas. Rins começam a funcionar.' },
  { month: 4, weeks: '13-16', size: 'Abacate', desc: 'Impressões digitais se formam. Pode-se saber o sexo.' },
  { month: 5, weeks: '17-20', size: 'Banana', desc: 'Você pode começar a sentir os movimentos do bebê.' },
  { month: 6, weeks: '21-24', size: 'Espiga de Milho', desc: 'O bebê responde a sons. Sobrancelhas visíveis.' },
  { month: 7, weeks: '25-28', size: 'Berinjela', desc: 'Abre e fecha os olhos. Pulmões em amadurecimento.' },
  { month: 8, weeks: '29-32', size: 'Abacaxi', desc: 'Ganho de peso rápido. Ossos endurecendo.' },
  { month: 9, weeks: '33-40', size: 'Melancia', desc: 'Pronto para nascer. Posiciona-se de cabeça para baixo.' },
];

export const COMMUNITY_POSTS: Post[] = [
  { 
    id: 'po1', 
    authorName: 'Ana Souza (32 semanas)', 
    content: 'Alguém mais sentindo muita azia à noite? Alguma dica natural?', 
    likes: 12, 
    comments: [
       { id: 'c1', authorName: 'Carla Dias', content: 'Chá de gengibre me ajudou muito!', timestamp: '1h atrás' }
    ], 
    timestamp: '2h atrás' 
  },
  { 
    id: 'po2', 
    authorName: 'Carla Dias (18 semanas)', 
    content: 'Acabei de ver meu bebê no morfológico! É uma menina! 🎀', 
    likes: 45, 
    comments: [], 
    timestamp: '5h atrás' 
  },
];

export const INITIAL_TIPS: Tip[] = [
  {
    id: 't1',
    month: 1,
    category: 'Início da Jornada',
    title: 'Mês 1: Ácido Fólico e Hábitos',
    content: 'O foco agora é a formação do tubo neural. Inicie a suplementação de ácido fólico imediatamente e suspenda álcool e tabaco.',
    readTime: '2 min'
  },
  {
    id: 't2',
    month: 2,
    category: 'Bem-estar',
    title: 'Mês 2: Lidando com Enjoos',
    content: 'Coma pequenas porções várias vezes ao dia. Alimentos frios, cítricos e gengibre podem ajudar a aliviar as náuseas matinais.',
    readTime: '3 min'
  },
  {
    id: 't3',
    month: 3,
    category: 'Exames',
    title: 'Mês 3: Primeira Bateria de Exames',
    content: 'Fase crucial para o ultrassom morfológico do 1º trimestre (TN). Hidrate-se bem e mantenha sua rotina de pré-natal em dia.',
    readTime: '4 min'
  },
  {
    id: 't4',
    month: 4,
    category: 'Energia',
    title: 'Mês 4: O Retorno da Energia',
    content: 'Geralmente os enjoos passam. É um ótimo momento para iniciar atividades físicas leves, como hidroginástica ou pilates (com aval médico).',
    readTime: '3 min'
  },
  {
    id: 't5',
    month: 5,
    category: 'Desenvolvimento',
    title: 'Mês 5: Sentindo o Bebê',
    content: 'Você pode começar a sentir os primeiros movimentos ("borboletas"). Fique atenta à postura para evitar dores nas costas.',
    readTime: '4 min'
  },
  {
    id: 't6',
    month: 6,
    category: 'Nutrição',
    title: 'Mês 6: Controle de Ferro e Açúcar',
    content: 'Atenção à anemia e diabetes gestacional. Aumente a ingestão de ferro (feijão, folhas escuras) e evite doces em excesso.',
    readTime: '5 min'
  },
  {
    id: 't7',
    month: 7,
    category: 'Preparação',
    title: 'Mês 7: O Quarto e o Sono',
    content: 'A barriga pesa e o sono pode ficar difícil. Use travesseiros entre as pernas. Comece a organizar a mala da maternidade.',
    readTime: '4 min'
  },
  {
    id: 't8',
    month: 8,
    category: 'Monitoramento',
    title: 'Mês 8: Inchaço e Consultas',
    content: 'As consultas tornam-se quinzenais. Eleve as pernas sempre que possível para diminuir o inchaço e monitore a pressão arterial.',
    readTime: '3 min'
  },
  {
    id: 't9',
    month: 9,
    category: 'Reta Final',
    title: 'Mês 9: Sinais de Trabalho de Parto',
    content: 'Fique atenta às contrações rítmicas e perda do tampão. Descanse o máximo possível e revise seu plano de parto.',
    readTime: '5 min'
  }
];