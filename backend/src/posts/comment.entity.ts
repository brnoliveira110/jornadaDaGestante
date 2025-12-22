import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    postId: string;

    @Column()
    authorName: string;

    @Column()
    content: string;

    @Column()
    timestamp: Date;

    @ManyToOne(() => Post, (post) => post.comments)
    post: Post;
}
