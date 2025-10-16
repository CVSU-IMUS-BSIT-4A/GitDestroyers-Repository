import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity'; // <-- add this import
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Post]), 
    NotificationsModule, 
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
