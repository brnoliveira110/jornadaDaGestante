
export enum UserRole {
    DOCTOR = 'DOCTOR',
    PATIENT = 'PATIENT',
}

export enum BloodType {
    A_POS = 'A_POS',
    A_NEG = 'A_NEG',
    B_POS = 'B_POS',
    B_NEG = 'B_NEG',
    AB_POS = 'AB_POS',
    AB_NEG = 'AB_NEG',
    O_POS = 'O_POS',
    O_NEG = 'O_NEG',
}

export enum ConsultationStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
}

export enum VaccineStatus {
    PENDING = 'PENDING',
    DONE = 'DONE',
    LATE = 'LATE',
}

export enum ExamType {
    PDF = 'PDF',
    IMAGE = 'IMAGE',
}

export enum ExamStatus {
    UPLOADED = 'UPLOADED',
    REVIEWED = 'REVIEWED',
    REQUESTED = 'REQUESTED',
    REALIZED = 'REALIZED',
}

export enum AlertType {
    WARNING = 'WARNING',
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
}

export enum AlertTargetRole {
    DOCTOR = 'DOCTOR',
    PATIENT = 'PATIENT',
    BOTH = 'BOTH',
}
