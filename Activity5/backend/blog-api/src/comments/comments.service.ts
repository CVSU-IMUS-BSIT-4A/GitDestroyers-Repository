import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(page = 1, pageSize = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['author', 'post'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });
    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const comment = await this.repo.findOne({ 
      where: { id }, 
      relations: ['author', 'post', 'post.author'] 
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(data: { text: string; postId: number }, authorId: number) {
    const author = await this.users.findOne({ where: { id: authorId } });
    const comment = this.repo.create({ text: data.text, post: { id: data.postId } as any, author: author || null });
    const saved = await this.repo.save(comment);
    
    const fullComment = await this.findOne(saved.id);
    
    console.log('Comment created:', {
      commentId: saved.id,
      authorId,
      postId: data.postId,
      postAuthorId: fullComment.post?.author?.id,
      hasPost: !!fullComment.post,
      hasPostAuthor: !!fullComment.post?.author,
      postAuthorName: fullComment.post?.author?.name,
      postAuthorEmail: fullComment.post?.author?.email
    });
    
    if (fullComment.post?.author?.id && fullComment.post.author.id !== authorId) {
      try {
        console.log('Creating notification for post author:', {
          postAuthorId: fullComment.post.author.id,
          commentAuthorId: authorId,
          postId: data.postId,
          commentId: saved.id
        });
        await this.notificationsService.createNotification(
          fullComment.post.author.id,
          authorId,
          NotificationType.COMMENT,
          data.postId,
          saved.id
        );
        console.log('Notification created successfully');
      } catch (error) {
        console.error('Failed to create notification:', error);
        console.error('Error details:', error.message);
        // Don't fail the comment creation if notification fails
      }
    } else {
      console.log('No notification created - either no post author or same user');
    }
    
    return fullComment;
  }

  async update(id: number, data: Partial<{ text: string }>, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Comment not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your comment');
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Comment not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your comment');
    await this.repo.delete(id);
    return { deleted: true };
  }
}


