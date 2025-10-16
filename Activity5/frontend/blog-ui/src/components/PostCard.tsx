import { useState, useEffect, useRef } from 'react';
import { updatePost, deletePost, addComment, toggleLike, getPostLikeCounts, getUserLikeStatus } from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Field, FieldContent, FieldLabel } from './ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MoreHorizontal, Edit, Trash2, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import Comment from './Comment';
import type { Post } from '../api';

interface PostCardProps {
  post: Post;
  userId?: number;
  currentUserAvatar?: string;
  onUpdate: (postId: number, updatedPost: Post) => void;
  onDelete: (postId: number) => void;
  onCommentAdded?: () => void;
  autoOpenComments?: boolean;
  disableDialog?: boolean; // New prop to disable the internal dialog
  highlightCommentId?: number; // New prop to highlight a specific comment
}

export default function PostCard({ post, userId, currentUserAvatar, onUpdate, onDelete, onCommentAdded, autoOpenComments = false, disableDialog = false, highlightCommentId }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [scrolledToComment, setScrolledToComment] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const allComments = post.comments || [];
  const commentCount = allComments.length;
  const isOwner = post.author && userId === post.author.id;

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

  // Auto-open comment dialog when autoOpenComments is true (but not if dialog is disabled)
  useEffect(() => {
    if (autoOpenComments && !showCommentDialog && !disableDialog) {
      setShowCommentDialog(true);
    }
    // Show inline comments when autoOpenComments is true and dialog is disabled
    if (autoOpenComments && disableDialog) {
      setShowInlineComments(true);
    }
  }, [autoOpenComments, showCommentDialog, disableDialog]);

  // Scroll to and animate the highlighted comment
  useEffect(() => {
    if (highlightCommentId && showInlineComments && !scrolledToComment) {
      setTimeout(() => {
        const commentElement = commentRefs.current[highlightCommentId];
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          // Add animation class
          commentElement.classList.add('animate-pulse');
          
          // Remove animation after 2 seconds
          setTimeout(() => {
            commentElement.classList.remove('animate-pulse');
          }, 2000);
        }
        setScrolledToComment(true);
      }, 300); // Small delay to ensure comments are rendered
    }
  }, [highlightCommentId, showInlineComments, scrolledToComment]);

  useEffect(() => {
    const loadLikesData = async () => {
      if (!userId) return;
      
      try {
        const [countsData, statusData] = await Promise.all([
          getPostLikeCounts(post.id),
          getUserLikeStatus(post.id, userId)
        ]);
        
        setLikes(countsData.likeCount);
        setDislikes(countsData.dislikeCount);
        setIsLiked(statusData.isLiked);
        setIsDisliked(statusData.isDisliked);
      } catch (error) {
        console.error('Failed to load likes data:', error);
      }
    };

    loadLikesData();
  }, [post.id, userId]);

  const handleSavePost = async () => {
    const updated = await updatePost(post.id, { title: editTitle, content: editContent });
    onUpdate(post.id, updated);
    setIsEditing(false);
  };

  const handleDeletePost = async () => {
    await deletePost(post.id);
    onDelete(post.id);
  };


  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const newComment = await addComment(post.id, commentText);
    const updatedPost = {
      ...post,
      comments: [...(post.comments || []), newComment]
    };
    onUpdate(post.id, updatedPost);
    setCommentText('');
    
    // Notify parent component to refresh notifications
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleUpdateComment = (commentId: number, updatedComment: any) => {
    const updatedPost = {
      ...post,
      comments: (post.comments || []).map(c => c.id === commentId ? updatedComment : c)
    };
    onUpdate(post.id, updatedPost);
  };

  const handleDeleteComment = (commentId: number) => {
    const updatedPost = {
      ...post,
      comments: (post.comments || []).filter(c => c.id !== commentId)
    };
    onUpdate(post.id, updatedPost);
  };

  const handleLike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleLike(post.id, userId, true);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isLiked) {
        setIsLiked(false);
      } else {
        setIsLiked(true);
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleLike(post.id, userId, false);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isDisliked) {
        setIsDisliked(false);
      } else {
        setIsDisliked(true);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to toggle dislike:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        {isEditing ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <FieldContent>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Content</FieldLabel>
              <FieldContent>
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
              </FieldContent>
            </Field>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSavePost}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title);
                  setEditContent(post.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {post.author?.avatar ? (
                    <img 
                      src={`http://localhost:3005${post.author.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    post.author?.name ? post.author.name.charAt(0).toUpperCase() : 
                    post.author?.email ? post.author.email.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>
                    {post.author?.name || post.author?.email || 'Unknown'}
                  </CardDescription>
                </div>
              </div>
            </div>
            {isOwner && (
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
                  <div className="absolute right-0 top-8 z-50 w-48 bg-background border border-border rounded-lg shadow-lg">
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
                        Edit Post
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                        onClick={() => {
                          handleDeletePost();
                          setShowMenu(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {!isEditing && (
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</p>
        </CardContent>
      )}

      {/* Stats Section */}
      <CardContent className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={handleLike}
              disabled={likesLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
              onClick={() => setShowCommentDialog(true)}
            >
              <MessageCircle className="h-4 w-4" />
              {commentCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${isDisliked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={handleDislike}
              disabled={likesLoading}
            >
              <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
              {dislikes}
            </Button>
          </div>
        </div>

        {/* Inline Comments Section (when dialog is disabled) */}
        {disableDialog && showInlineComments && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Comments ({commentCount})</h3>
            
            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  ref={(el) => (commentRefs.current[comment.id] = el)}
                  className="p-4 rounded-lg border bg-muted/30 border-border transition-all duration-300 ease-in-out"
                >
                  <Comment
                    comment={comment}
                    userId={userId}
                    onUpdate={(commentId, updatedComment) => {
                      const updatedComments = allComments.map(c => 
                        c.id === commentId ? updatedComment : c
                      );
                      onUpdate(post.id, { ...post, comments: updatedComments });
                    }}
                    onDelete={(commentId) => {
                      const updatedComments = allComments.filter(c => c.id !== commentId);
                      onUpdate(post.id, { ...post, comments: updatedComments });
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            {userId && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                    {currentUserAvatar ? (
                      <img 
                        src={`http://localhost:3005${currentUserAvatar}`} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      userId ? String.fromCharCode(65 + (userId % 26)) : 'U'
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        size="sm"
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Comment Dialog */}
      {!disableDialog && (
        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Comments</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col space-y-6">
              {/* Post Content */}
              <div className="border-b pb-6 flex-shrink-0">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
                    {post.author?.avatar ? (
                      <img 
                        src={`http://localhost:3005${post.author.avatar}`} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      post.author?.name ? post.author.name.charAt(0).toUpperCase() : 
                      post.author?.email ? post.author.email.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {post.author?.name || post.author?.email || 'Unknown'}
                    </p>
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed text-sm">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Post Stats */}
                <div className="flex items-center gap-6 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                    onClick={handleLike}
                    disabled={likesLoading}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                    {likes}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-muted-foreground hover:text-blue-500"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {commentCount}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${isDisliked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                    onClick={handleDislike}
                    disabled={likesLoading}
                  >
                    <ThumbsDown className={`h-4 w-4 mr-1 ${isDisliked ? 'fill-current' : ''}`} />
                    {dislikes}
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {allComments.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-foreground">
                        Comments ({allComments.length})
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {allComments.map(comment => (
                        <div
                          key={comment.id}
                          ref={el => commentRefs.current[comment.id] = el}
                          className={`transition-all duration-200 ${
                            highlightCommentId === comment.id 
                              ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg p-2 -m-2' 
                              : ''
                          }`}
                        >
                          <Comment
                            comment={comment}
                            userId={userId}
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteComment}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h4 className="font-medium text-muted-foreground mb-2">No comments yet</h4>
                    <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Section */}
              <div className="border-t pt-4 flex-shrink-0">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                    {currentUserAvatar ? (
                      <img 
                        src={`http://localhost:3005${currentUserAvatar}`} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      userId ? String.fromCharCode(65 + (userId % 26)) : 'U'
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        size="sm"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </Card>
  );
}


