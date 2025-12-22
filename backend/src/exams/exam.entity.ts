import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ExamType, ExamStatus } from '../shared/enums';

@Entity()
export class Exam {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @Column()
    name: string;

    @Column()
    date: Date;

    @Column({ nullable: true })
    fileUrl: string;

    @Column({
        type: 'enum',
        enum: ExamType,
    })
    type: ExamType;

    @Column({
        type: 'enum',
        enum: ExamStatus,
    })
    status: ExamStatus;

    @Column({ nullable: true })
    doctorName: string;

    @Column({ nullable: true })
    doctorCrm: string;

    @Column({ nullable: true })
    digitalSignature: string;
}
