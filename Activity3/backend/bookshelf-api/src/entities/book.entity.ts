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

  @Column({ type: 'integer', nullable: true })
  publishedYear: number | null;

  @Column({ type: 'text', nullable: true })
  isbn: string | null;

  @Column({ type: 'integer', nullable: true })
  pageCount: number | null;

  @Column({ type: 'text', nullable: true })
  coverUrl: string | null;

  @Column({ type: 'text', nullable: true })
  plot: string | null;

  @Column({ type: 'boolean', default: false })
  borrowed: boolean;

  @Column({ type: 'datetime', nullable: true })
  borrowedDate: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}


