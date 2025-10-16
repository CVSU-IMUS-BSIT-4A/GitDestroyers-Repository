import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPost, listPosts, getCurrentUserIdFromToken, getUser, getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } from '../api';
import { setAuthToken } from '../api';
import { useTheme } from '../hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Field, FieldContent, FieldLabel, FieldError } from './ui/field';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { PenTool, X, User, Settings, LogOut, ChevronDown, Plus, Bell, Sun, Moon, Home } from 'lucide-react';
import PostCard from './PostCard';
import type { Post } from '../api';

interface PostFormErrors {
  title?: string;
  content?: string;
  general?: string;
}

interface User {
  id: number;
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
}

export default function PostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const pageSize = 5;
  const userId = getCurrentUserIdFromToken();

  async function load() {
    try {
      setLoading(true);
      setBackendAvailable(true);
      const data = await listPosts(page, pageSize);
      setPosts(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setBackendAvailable(false);
      return;
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    if (userId) {
      try {
        const user = await getUser(userId);
        setCurrentUser(user);
        setBackendAvailable(true);
      } catch (error) {
        console.error('Failed to load current user:', error);
        setBackendAvailable(false);
      }
    }
  }

  async function loadNotifications() {
    if (!userId) return;
    
    setNotificationsLoading(true);
    try {
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(userId),
        getUnreadNotificationCount(userId)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    if (!userId) return;
    
    try {
      await markAllNotificationsAsRead(userId);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  async function handleNotificationClick(notification: any) {
    if (!userId) return;
    
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id, userId);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setShowNotificationsDropdown(false);
      
      if (notification.post?.id) {
        const url = notification.comment?.id 
          ? `/post/${notification.post.id}?comment=${notification.comment.id}`
          : `/post/${notification.post.id}`;
        navigate(url);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  }


  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    loadCurrentUser();
    loadNotifications();
  }, [userId]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };

    if (showProfileDropdown || showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotificationsDropdown]);


  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return 'Title is required';
    if (title.trim().length < 3) return 'Title must be at least 3 characters';
    if (title.trim().length > 100) return 'Title must be less than 100 characters';
    return undefined;
  };

  const validateContent = (content: string): string | undefined => {
    if (!content.trim()) return 'Content is required';
    if (content.trim().length < 10) return 'Content must be at least 10 characters';
    if (content.trim().length > 2000) return 'Content must be less than 2000 characters';
    return undefined;
  };

  const validatePostForm = (): boolean => {
    const newErrors: PostFormErrors = {};
    
    newErrors.title = validateTitle(title);
    newErrors.content = validateContent(content);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleInputChange = (field: keyof PostFormErrors, value: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleCreate() {
    setErrors({});
    
    if (!validatePostForm()) {
      return;
    }

    setCreating(true);
    try {
      const newPost = await createPost(title, content);
      setTitle('');
      setContent('');
      setPosts(prev => [newPost, ...prev]);
      setIsPopoverOpen(false);
    } catch (err: any) {
      setErrors({ 
        general: err?.response?.data?.message || 'Failed to create post. Please try again.' 
      });
    } finally {
      setCreating(false);
    }
  }

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setErrors({});
    setIsPopoverOpen(false);
  };

  const handleUpdatePost = (postId: number, updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
  };

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleLogout = () => {
    setAuthToken(null);
    window.location.href = '/auth';
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex justify-between items-center mb-8 py-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">HeroCommu</h1>
            <p className="text-muted-foreground">Where CvSU Imus Heroes Connect.</p>
          </div>
          <nav className="flex items-center gap-3">
            {/* New Post Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                setIsDialogLoading(true);
                setTimeout(() => {
                  setIsDialogLoading(false);
                  setIsPopoverOpen(true);
                }, 500);
              }}
            >
              {isDialogLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  New Post
                </>
              )}
            </Button>
            {/* Home Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Home className="h-4 w-4" />
            </Button>

            {/* Notifications Button */}
            <div className="relative" ref={notificationsDropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 relative"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              {showNotificationsDropdown && (
                <div className="absolute right-0 top-11 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs h-6 px-2"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="text-sm text-muted-foreground">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                              !notification.isRead 
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                                : 'bg-muted/30 border-border'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                                {notification.actor?.avatar ? (
                                  <img 
                                    src={`http://localhost:3005${notification.actor.avatar}`} 
                                    alt="Avatar" 
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  notification.actor?.name ? notification.actor.name.charAt(0).toUpperCase() : 'U'
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()} at{' '}
                                  {new Date(notification.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 px-2 flex items-center gap-2"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {currentUser?.avatar ? (
                    <img 
                      src={`http://localhost:3005${currentUser.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    userId ? String.fromCharCode(65 + (userId % 26)) : 'U'
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 top-11 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-1 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        window.location.href = '/profile';
                      }}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        window.location.href = '/user';
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <div className="border-t my-1"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </nav>
          </header>

          {/* Backend unavailable message - Top */}
          {!backendAvailable && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">
                      Unable to connect to the server. Please check your connection and try again.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setBackendAvailable(true);
                      setLoading(true);
                      load();
                    }}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Post Dialog */}
        <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className='text-center'>New Post</DialogTitle>
              <hr className="border-border mt-4" />
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <Field>
                <FieldLabel>Title</FieldLabel>
                <FieldContent>
                  <Input 
                    placeholder="Enter post title" 
                    value={title} 
                    onChange={e => {
                      setTitle(e.target.value);
                      handleInputChange('title', e.target.value);
                    }}
                    className={errors.title ? 'border-destructive' : ''}
                    maxLength={100}
                  />
                </FieldContent>
                <FieldError>{errors.title}</FieldError>
              </Field>
              
              <Field>
                <FieldLabel>Content</FieldLabel>
                <FieldContent>
                  <Textarea 
                    placeholder="Write your post content..." 
                    value={content} 
                    onChange={e => {
                      setContent(e.target.value);
                      handleInputChange('content', e.target.value);
                    }}
                    className={`min-h-40 ${errors.content ? 'border-destructive' : ''}`}
                    maxLength={2000}
                  />
                </FieldContent>
                <FieldError>{errors.content}</FieldError>
              </Field>
              
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreate} 
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Post'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Posts List */}
        <div className="space-y-6">
          {loading || !backendAvailable ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : (
                    posts.map(post => (
                      <PostCard
                        key={`main-${post.id}`}
                        post={post}
                        userId={userId || undefined}
                        currentUserAvatar={currentUser?.avatar}
                        onUpdate={handleUpdatePost}
                        onDelete={handleDeletePost}
                        onCommentAdded={loadNotifications}
                      />
                    ))
          )}
          
          {/* Backend unavailable message */}
          {!backendAvailable && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <p className="text-sm">
                      Unable to connect to the server. Please check your connection and try again.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setBackendAvailable(true);
                      setLoading(true);
                      load();
                    }}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            disabled={page <= 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Badge variant="secondary">Page {page}</Badge>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

    </div>
  );
}

