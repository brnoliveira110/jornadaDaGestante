import { BloodType, Consultation, ExamResult, Post, PregnancyData, User, UserRole, Vaccine, Tip, WeeklyDevelopment } from './types';
import { calculateDPP } from './utils';

const MOCK_DUM = '2023-11-15'; // Exemplo

export const WEEKLY_DEVELOPMENT: WeeklyDevelopment[] = [
  { week: 1, sizeComparison: 'Semente de Papoula (Micro)', weight: '< 1g', length: '< 1mm', heartRate: 'Inexistente', description: 'A jornada começa! Seu corpo se prepara para a concepção. O revestimento uterino engrossa.' },
  { week: 2, sizeComparison: 'Semente de Papoula', weight: '< 1g', length: '< 1mm', heartRate: 'Inexistente', description: 'Ovulação e fertilização. O óvulo encontra o espermatozoide e a mágica acontece.', imageUrl: '/assets/images/fetal_development/week_2.png' },
  { week: 3, sizeComparison: 'Grão de Sal', weight: '< 1g', length: '0.1mm', heartRate: 'Inexistente', description: 'Implantação no útero. O blastocisto se fixa e começa a liberar hormônios da gravidez.' },
  { week: 4, sizeComparison: 'Semente de Gergelim', weight: '< 1g', length: '1mm', heartRate: 'Iniciando', description: 'Tubo neural em formação. O saco vitelino nutre o embrião até a placenta assumir.', imageUrl: '/assets/images/fetal_development/week_4.png' },
  { week: 5, sizeComparison: 'Semente de Laranja', weight: '< 1g', length: '2mm', heartRate: '80-100 bpm', description: 'O coração começa a bater! Formam-se os primórdios do cérebro e medula espinhal.' },
  { week: 6, sizeComparison: 'Ervilha', weight: '< 1g', length: '5mm', heartRate: '100-120 bpm', description: 'Nariz, boca e orelhas começam a tomar forma. Os brotos dos membros aparecem.', imageUrl: '/assets/images/fetal_development/week_6.png' },
  { week: 7, sizeComparison: 'Mirtilo', weight: '< 1g', length: '10mm', heartRate: '120-140 bpm', description: 'Braços e pernas crescem. Rins começam a se desenvolver.' },
  { week: 8, sizeComparison: 'Framboesa', weight: '1g', length: '1.6cm', heartRate: '140-160 bpm', description: 'Dedos das mãos e pés se formam (com membranas). O tronco se endireita.' },
  { week: 9, sizeComparison: 'Azeitona', weight: '2g', length: '2.3cm', heartRate: '150-170 bpm', description: 'Coração já tem 4 câmaras. O bebê começa a se mover, mas você não sente.' },
  { week: 10, sizeComparison: 'Ameixa Seca', weight: '4g', length: '3.1cm', heartRate: '150-170 bpm', description: 'Fase fetal começa! Órgãos vitais estão formados e começam a funcionar.' },
  { week: 11, sizeComparison: 'Limão', weight: '7g', length: '4.1cm', heartRate: '140-160 bpm', description: 'Pele transparente. Ossos começam a endurecer. O bebê já pode soluçar.' },
  { week: 12, sizeComparison: 'Maracujá', weight: '14g', length: '5.4cm', heartRate: '140-160 bpm', description: 'Reflexos se desenvolvem. O médico pode ouvir o coração com doppler.' },
  { week: 13, sizeComparison: 'Pêssego', weight: '23g', length: '7.4cm', heartRate: '140-160 bpm', description: 'Impressões digitais se formam. Cordas vocais em desenvolvimento.' },
  { week: 14, sizeComparison: 'Limão Siciliano', weight: '43g', length: '8.7cm', heartRate: '140-150 bpm', description: 'O bebê faz caretas e pode chupar o dedo. Rins produzem urina.' },
  { week: 15, sizeComparison: 'Maçã', weight: '70g', length: '10.1cm', heartRate: '140-150 bpm', description: 'Pode sentir luz através das pálpebras fechadas. Pernas crescem mais que os braços.' },
  { week: 16, sizeComparison: 'Abacate', weight: '100g', length: '11.6cm', heartRate: '140-150 bpm', description: 'Coração bombeia 25L de sangue/dia. Sexo pode ser visível no ultrassom.' },
  { week: 17, sizeComparison: 'Cebola', weight: '140g', length: '13cm', heartRate: '140-150 bpm', description: 'Esqueleto muda de cartilagem para osso. Cordão umbilical fica mais grosso.' },
  { week: 18, sizeComparison: 'Batata Doce', weight: '190g', length: '14.2cm', heartRate: '140-150 bpm', description: 'Ouvidos formados e funcionais. Pode ouvir sua voz e batimentos cardíacos.' },
  { week: 19, sizeComparison: 'Manga', weight: '240g', length: '15.3cm', heartRate: '140-150 bpm', description: 'Vernix caseoso cobre a pele para proteção. Cabelo começa a crescer.' },
  { week: 20, sizeComparison: 'Banana', weight: '300g', length: '16.4cm', heartRate: '140-150 bpm', description: 'Meio do caminho! Você provavelmente sente os movimentos (chutes).' },
  { week: 21, sizeComparison: 'Centaurea', weight: '360g', length: '26.7cm', heartRate: '130-150 bpm', description: 'Sobrancelhas e cílios formados. O bebê engole líquido amniótico.' },
  { week: 22, sizeComparison: 'Mamão Papaia', weight: '430g', length: '27.8cm', heartRate: '130-150 bpm', description: 'Tato apurado. O bebê explora o próprio rosto e cordão umbilical.' },
  { week: 23, sizeComparison: 'Toranja', weight: '500g', length: '28.9cm', heartRate: '130-150 bpm', description: 'Audição apurada. Pulmões produzem surfactante para respirar no futuro.' },
  { week: 24, sizeComparison: 'Milho', weight: '600g', length: '30cm', heartRate: '130-150 bpm', description: 'Viabilidade fetal aumenta. O bebê dorme e acorda regularmente.' },
  { week: 25, sizeComparison: 'Couve-flor', weight: '660g', length: '34.6cm', heartRate: '130-150 bpm', description: 'Cabelo tem cor e textura. Gordura corporal começa a se acumular.' },
  { week: 26, sizeComparison: 'Alface', weight: '760g', length: '35.6cm', heartRate: '130-150 bpm', description: 'Olhos começam a abrir! Resposta a luzes fortes externas.' },
  { week: 27, sizeComparison: 'Brócolis', weight: '875g', length: '36.6cm', heartRate: '130-150 bpm', description: 'Cérebro ativo e complexo. O bebê pode sonhar.' },
  { week: 28, sizeComparison: 'Berinjela', weight: '1kg', length: '37.6cm', heartRate: '130-140 bpm', description: 'Pode piscar os olhos. O bebê já reconhece sua voz claramente.' },
  { week: 29, sizeComparison: 'Abóbora "Butternut"', weight: '1.2kg', length: '38.6cm', heartRate: '130-140 bpm', description: 'Cabeça proporcional ao corpo. Espaço fica apertado, movimentos mudam.' },
  { week: 30, sizeComparison: 'Repolho', weight: '1.3kg', length: '39.9cm', heartRate: '130-140 bpm', description: 'Medula óssea produz glóbulos vermelhos. Lanugem começa a cair.' },
  { week: 31, sizeComparison: 'Coco', weight: '1.5kg', length: '41.1cm', heartRate: '130-140 bpm', description: 'Todos os 5 sentidos funcionam. O bebê vira a cabeça para sons.' },
  { week: 32, sizeComparison: 'Couve Kale', weight: '1.7kg', length: '42.4cm', heartRate: '130-140 bpm', description: 'Unhas das mãos completas. Treina respiração intensamente.' },
  { week: 33, sizeComparison: 'Abacaxi', weight: '1.9kg', length: '43.7cm', heartRate: '120-140 bpm', description: 'Sistema imunológico absorve anticorpos da mãe. Ossos endurecem.' },
  { week: 34, sizeComparison: 'Melão Cantaloupe', weight: '2.1kg', length: '45cm', heartRate: '120-140 bpm', description: 'Gordura preenche a pele enrugada. Testículos descem (meninos).' },
  { week: 35, sizeComparison: 'Melão Honeydew', weight: '2.4kg', length: '46.2cm', heartRate: '120-140 bpm', description: 'Posição cefálica (cabeça para baixo) geralmente assumida.' },
  { week: 36, sizeComparison: 'Alface Romana', weight: '2.6kg', length: '47.4cm', heartRate: '120-140 bpm', description: 'Pulmões maduros. O bebê desce para a pelve (encaixe).' },
  { week: 37, sizeComparison: 'Acelga', weight: '2.9kg', length: '48.6cm', heartRate: '120-140 bpm', description: 'Termo precoce. O bebê pratica sucção e deglutição.' },
  { week: 38, sizeComparison: 'Aipo', weight: '3.1kg', length: '49.8cm', heartRate: '120-140 bpm', description: 'Termo pleno. Vernix quase sumiu. Mecônio formado no intestino.' },
  { week: 39, sizeComparison: 'Mini Melancia', weight: '3.3kg', length: '50.7cm', heartRate: '120-140 bpm', description: 'Pronto para nascer! Pele nova se forma sob a antiga.' },
  { week: 40, sizeComparison: 'Melancia', weight: '3.5kg', length: '51.2cm', heartRate: '120-140 bpm', description: 'Data prevista! Ossos do crânio flexíveis para o parto.' },
  { week: 41, sizeComparison: 'Jaca', weight: '3.6kg+', length: '51.5cm+', heartRate: '120-140 bpm', description: 'Pós-termo. Monitoramento constante. O bebê continua ganhando peso.' },
  { week: 42, sizeComparison: 'Abóbora Gigante', weight: '3.7kg+', length: '51.7cm+', heartRate: '120-140 bpm', description: 'Indução provável. A placenta pode começar a envelhecer.' }
];



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
  weightGoalMax: 16,
  theme: 'GIRL'
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