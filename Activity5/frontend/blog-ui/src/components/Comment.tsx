import { useState, useEffect, useRef } from 'react';
import { updateComment, deleteComment, toggleCommentLike, getCommentLikeCounts, getUserCommentLikeStatus } from '../api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { MoreHorizontal, Edit, Trash2, Heart, ThumbsDown } from 'lucide-react';

interface CommentProps {
  comment: {
    id: number;
    text: string;
    author?: {
      id: number;
      name?: string;
      email?: string;
      avatar?: string;
    } | null;
  };
  userId?: number;
  onUpdate: (commentId: number, updatedComment: any) => void;
  onDelete: (commentId: number) => void;
}

export default function Comment({ comment, userId, onUpdate, onDelete }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = comment.author && userId === comment.author.id;

  // Load likes data when component mounts
  useEffect(() => {
    const loadLikesData = async () => {
      if (!userId) return;
      
      try {
        const [countsData, statusData] = await Promise.all([
          getCommentLikeCounts(comment.id),
          getUserCommentLikeStatus(comment.id, userId)
        ]);
        
        setLikes(countsData.likeCount);
        setDislikes(countsData.dislikeCount);
        setIsLiked(statusData.isLiked);
        setIsDisliked(statusData.isDisliked);
      } catch (error) {
        console.error('Failed to load comment likes data:', error);
      }
    };

    loadLikesData();
  }, [comment.id, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSave = async () => {
    const updated = await updateComment(comment.id, { text: editText });
    onUpdate(comment.id, updated);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteComment(comment.id);
    onDelete(comment.id);
  };

  const handleLike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleCommentLike(comment.id, userId, true);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isLiked) {
        setIsLiked(false);
      } else {
        setIsLiked(true);
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleCommentLike(comment.id, userId, false);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isDisliked) {
        setIsDisliked(false);
      } else {
        setIsDisliked(true);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to toggle comment dislike:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
        {comment.author?.avatar ? (
          <img 
            src={`http://localhost:3005${comment.author.avatar}`} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 
          comment.author?.email ? comment.author.email.charAt(0).toUpperCase() : 'U'
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {comment.author?.name || comment.author?.email || 'Unknown'}
          </Badge>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="min-h-16"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.text);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">{comment.text}</p>
            
            {/* Like/Dislike Buttons */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                onClick={handleLike}
                disabled={likesLoading}
              >
                <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${isDisliked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                onClick={handleDislike}
                disabled={likesLoading}
              >
                <ThumbsDown className={`h-3 w-3 mr-1 ${isDisliked ? 'fill-current' : ''}`} />
                {dislikes}
              </Button>
            </div>
          </>
        )}
      </div>
      {isOwner && !isEditing && (
        <div className="relative" ref={menuRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-50 w-40 bg-background border border-border rounded-lg shadow-lg">
              <div className="p-1 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


