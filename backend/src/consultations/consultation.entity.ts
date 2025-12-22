import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ConsultationStatus } from '../shared/enums';

@Entity()
export class Consultation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @Column()
    date: Date;

    @Column('int')
    gestationalAgeWeeks: number;

    @Column('float', { nullable: true })
    uterineHeight: number;

    @Column({ nullable: true })
    bloodPressure: string;

    @Column('int', { nullable: true })
    fetalHeartRate: number;

    @Column('float')
    currentWeight: number;

    @Column()
    edema: boolean;

    @Column()
    notes: string;

    @Column()
    prescription: string;

    @Column('text', { array: true, default: '{}' })
    requestedExams: string[];

    @Column({
        type: 'enum',
        enum: ConsultationStatus,
    })
    status: ConsultationStatus;
}
