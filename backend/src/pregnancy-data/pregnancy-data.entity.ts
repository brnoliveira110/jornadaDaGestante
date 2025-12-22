import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BloodType } from '../shared/enums';

@Entity()
export class PregnancyData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @Column()
    dum: Date;

    @Column()
    dpp: Date;

    @Column('float')
    initialWeight: number;

    @Column('float')
    preGestationalHeight: number;

    @Column('float')
    preGestationalBMI: number;

    @Column({
        type: 'enum',
        enum: BloodType,
    })
    bloodType: BloodType;

    @Column({
        type: 'enum',
        enum: BloodType,
        nullable: true,
    })
    spouseBloodType: BloodType;

    @Column('float')
    weightGoalMax: number;

    @Column('float')
    weightGoalMin: number;
}
