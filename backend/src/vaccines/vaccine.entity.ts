import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { VaccineStatus } from '../shared/enums';

@Entity()
export class Vaccine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @Column()
    name: string;

    @Column('int')
    dose: number;

    @Column('int')
    totalDoses: number;

    @Column({ nullable: true })
    dateAdministered: Date;

    @Column({
        type: 'enum',
        enum: VaccineStatus,
    })
    status: VaccineStatus;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    prescribedBy: string;

    @Column({ nullable: true })
    doctorCrm: string;

    @Column({ nullable: true })
    digitalSignature: string;

    @Column({ nullable: true })
    requestDate: Date;
}
