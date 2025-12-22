import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    authorName: string;

    @Column()
    content: string;

    @Column('int', { default: 0 })
    likes: number;

    @Column()
    timestamp: Date;

    @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
    comments: Comment[];
}
