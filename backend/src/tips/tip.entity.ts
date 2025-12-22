import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tip {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    month: number;

    @Column()
    category: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    readTime: string;
}
