import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AlertType, AlertTargetRole } from '../shared/enums';

@Entity()
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({
        type: 'enum',
        enum: AlertType,
    })
    type: AlertType;

    @Column()
    date: Date;

    @Column({ default: false })
    read: boolean;

    @Column({
        type: 'enum',
        enum: AlertTargetRole,
    })
    targetRole: AlertTargetRole;
}
