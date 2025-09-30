import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Author } from './author.entity';
import { Category } from './category.entity';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  title: string;

  @ManyToOne(() => Author, (author) => author.books, { onDelete: 'SET NULL', nullable: true })
  author: Author | null;

  @ManyToOne(() => Category, (category) => category.books, { onDelete: 'SET NULL', nullable: true })
  category: Category | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}


