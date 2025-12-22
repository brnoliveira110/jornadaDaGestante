import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../shared/enums';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({ nullable: true })
    avatarUrl: string;

    // Doctor specific fields
    @Column({ nullable: true })
    crm: string;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    titles: string;
}
