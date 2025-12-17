import { Consultation } from "./types";

/**
 * Regra de Naegele para calcular a Data Provável do Parto (DPP).
 * Fórmula: DUM + 7 dias - 3 meses + 1 ano (ou + 9 meses e 7 dias).
 */
export const calculateDPP = (dumDateString: string): Date => {
  const dum = new Date(dumDateString);
  const dpp = new Date(dum);

  // Adiciona 7 dias
  dpp.setDate(dum.getDate() + 7);
  // Subtrai 3 meses (ou adiciona 9 meses)
  dpp.setMonth(dum.getMonth() + 9);

  return dpp;
};

/**
 * Calcula a Idade Gestacional (IG) atual em semanas baseada na DUM.
 */
export const calculateGestationalAge = (dumDateString: string): number => {
  const dum = new Date(dumDateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - dum.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

/**
 * Calcula o Índice de Massa Corporal (IMC).
 * Peso (kg) / Altura (m)²
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  if (heightM === 0) return 0;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Formata data para o padrão brasileiro (DD/MM/AAAA)
 */
export const formatDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Prepara dados para o gráfico da Curva de Atalah (simplificado)
 * Gera um array mesclando dados ideais e dados reais.
 */
export const generateChartData = (consultations: Consultation[], heightCm: number) => {
  // Ordena consultas por data
  const sorted = [...consultations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return sorted.map(c => ({
    week: c.gestationalAgeWeeks,
    bmi: calculateBMI(c.currentWeight, heightCm),
    weight: c.currentWeight,
    minNormal: 20, // Simulando faixas da curva de Atalah para visualização
    maxNormal: 26 + (c.gestationalAgeWeeks * 0.15) // Ligeiro aumento fisiológico
  }));
};

import { BloodType } from "./types";

export const formatBloodType = (type?: BloodType): string => {
  if (!type) return 'N/A';
  switch (type) {
    case BloodType.A_POS: return 'A+';
    case BloodType.A_NEG: return 'A-';
    case BloodType.B_POS: return 'B+';
    case BloodType.B_NEG: return 'B-';
    case BloodType.AB_POS: return 'AB+';
    case BloodType.AB_NEG: return 'AB-';
    case BloodType.O_POS: return 'O+';
    case BloodType.O_NEG: return 'O-';
    default: return type;
  }
};
