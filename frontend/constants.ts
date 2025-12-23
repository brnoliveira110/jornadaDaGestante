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
    patientId: 'u2',
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
    patientId: 'u2',
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
    patientId: 'u2',
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
    patientId: 'u2',
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
  { id: 'v1', patientId: 'u2', name: 'Influenza (Gripe)', dose: 1, totalDoses: 1, status: 'DONE', dateAdministered: '2024-01-10' },
  { id: 'v2', patientId: 'u2', name: 'Hepatite B', dose: 1, totalDoses: 3, status: 'DONE', dateAdministered: '2023-05-20' },
  { id: 'v3', patientId: 'u2', name: 'Hepatite B', dose: 2, totalDoses: 3, status: 'PENDING' },
  { id: 'v4', patientId: 'u2', name: 'dTpa', dose: 1, totalDoses: 1, status: 'LATE', notes: 'Agendar urgentemente' },
];

export const MOCK_EXAMS: ExamResult[] = [
  { id: 'e1', patientId: 'u2', name: 'Ultrassom 1º Trimestre', date: '2024-01-12', type: 'IMAGE', status: 'REVIEWED' },
  { id: 'e2', patientId: 'u2', name: 'Hemograma Completo', date: '2024-01-15', type: 'PDF', status: 'REVIEWED' },
  { id: 'e3', patientId: 'u2', name: 'Ultrassom Morfológico', date: '2024-03-25', type: 'IMAGE', status: 'UPLOADED' },
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
      { id: 'c1', postId: 'po1', authorName: 'Carla Dias', content: 'Chá de gengibre me ajudou muito!', timestamp: '1h atrás' }
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
    minWeek: 1,
    maxWeek: 42,
    category: 'Geral',
    title: 'Duração da Gestação',
    content: 'A gestação normal dura em média 40 semanas, com uma variação normal entre 37 (marco da maturidade fetal) e 41 semanas.',
    readTime: '1 min'
  },
  {
    id: 't2',
    minWeek: 1,
    maxWeek: 42,
    category: 'Nutrição',
    title: 'Controle de Peso',
    content: 'O ganho de peso ideal deve ser personalizado. Em média, não deve ultrapassar 12 kg. O sobrepeso aumenta riscos de doenças maternas e fetais.',
    readTime: '2 min'
  },
  {
    id: 't3',
    minWeek: 1,
    maxWeek: 42,
    category: 'Nutrição',
    title: 'Alimentação Saudável',
    content: 'Faça refeições frequentes em pequenas quantidades. Evite regimes. Sua dieta deve ser rica em proteínas, vitaminas e minerais.',
    readTime: '2 min'
  },
  {
    id: 't4',
    minWeek: 1,
    maxWeek: 42,
    category: 'Saúde',
    title: 'Hidratação e Intestino',
    content: 'Beba água em abundância para que seu intestino funcione diariamente, e evite o álcool completamente.',
    readTime: '1 min'
  },
  {
    id: 't5',
    minWeek: 1,
    maxWeek: 42,
    category: 'Hábitos',
    title: 'Café e Adoçantes',
    content: 'Modere o café (max 2 xícaras/dia). Evite refrigerantes à base de cola. Use adoçante à base de sucralose.',
    readTime: '2 min'
  },
  {
    id: 't6',
    minWeek: 1,
    maxWeek: 42,
    category: 'Proteção',
    title: 'Repelente',
    content: 'Proteja-se usando repelentes corporais à base de Icaridina ou DEET e roupas claras que cubram a maior parte do corpo.',
    readTime: '1 min'
  },
  {
    id: 't7',
    minWeek: 1,
    maxWeek: 42,
    category: 'Vestuário',
    title: 'Higiene Íntima',
    content: 'Prefira calcinhas de algodão e não use protetores diários. O aumento da secreção vaginal é fisiológico.',
    readTime: '2 min'
  },
  {
    id: 't8',
    minWeek: 1,
    maxWeek: 42,
    category: 'Pele',
    title: 'Proteção Solar e Estrias',
    content: 'Use FPS 30+ no rosto diariamente (melasmas). Hidrate barriga e seios para evitar estrias, mas evite passar creme nos mamilos.',
    readTime: '3 min'
  },
  {
    id: 't9',
    minWeek: 13,
    maxWeek: 42,
    category: 'Atividade Física',
    title: 'Exercícios Recomendados',
    content: 'Caminhadas, alongamentos, yoga e hidroginástica são ótimos. Se era sedentária, inicie após o 1º trimestre (13 semanas).',
    readTime: '2 min'
  },
  {
    id: 't10',
    minWeek: 1,
    maxWeek: 42,
    category: 'Transporte',
    title: 'Dirigindo com Segurança',
    content: 'Use sempre o cinto de três pontos (faixa abaixo da barriga). Mantenha 15cm de distância do volante. Não dirija se sentir tonturas.',
    readTime: '2 min'
  },
  {
    id: 't11',
    minWeek: 1,
    maxWeek: 35,
    category: 'Viagens',
    title: 'Viagens de Avião',
    content: 'Até 27 semanas: permitido. 28-35 semanas: exige atestado médico. Após 36 semanas: não recomendado.',
    readTime: '2 min'
  },
  {
    id: 't12',
    minWeek: 16,
    maxWeek: 42,
    category: 'Beleza',
    title: 'Cabelos e Tinturas',
    content: 'Evite amônia e chumbo. Tinturas e alisamentos ficam adiados no 1º trimestre. Luzes (longe da raiz) permitidas após o 4º mês.',
    readTime: '2 min'
  },
  {
    id: 't13',
    minWeek: 1,
    maxWeek: 42,
    category: 'Emocional',
    title: 'Saúde Mental',
    content: 'Oscilações de humor, irritabilidade e choro fácil são comuns devido aos hormônios. Converse sobre seus sentimentos.',
    readTime: '2 min'
  },
  {
    id: 't14',
    minWeek: 20,
    maxWeek: 42,
    category: 'Emergência',
    title: 'Sinais de Alerta',
    content: 'Vá à maternidade se: sangramento, perda de líquido, dor abdominal intensa, visão turva, ou bebê sem mexer por >12h.',
    readTime: '1 min'
  }
];

export const PREGNANCY_VACCINATION_CALENDAR = [
  { name: 'Influenza (Gripe)', description: 'Dose única anual durante a campanha ou em qualquer idade gestacional.', requiredDoses: 1 },
  { name: 'Hepatite B', description: '3 doses. Iniciar o mais cedo possível se não for imune.', requiredDoses: 3 },
  { name: 'dT (Difteria e Tétano)', description: 'Esquema de 3 doses se não vacinada. Se vacinada há mais de 5 anos, reforço.', requiredDoses: 1 }, // Simplificado para reforço ou 1 ciclo
  { name: 'dTpa (Tríplice Bacteriana Acelular)', description: 'A partir da 20ª semana. Protege o bebê contra coqueluche.', requiredDoses: 1 }
];