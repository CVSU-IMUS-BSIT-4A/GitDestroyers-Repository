import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCurrentUserIdFromToken,
  getUser,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  createPost,
} from '../api';
import { setAuthToken } from '../api';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  Home,
  Plus,
} from 'lucide-react';
import Feed, { type FeedRef } from './Feed';
import type { Post } from '../api';


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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showAddPostDialog, setShowAddPostDialog] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const TITLE_MAX = 120;
  const CONTENT_MAX = 2000;
  const { isDarkMode, toggleDarkMode } = useTheme();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<FeedRef>(null);
  const userId = getCurrentUserIdFromToken();



  async function loadCurrentUser() {
    if (userId) {
      try {
        const user = await getUser(userId);
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load current user:', error);
      }
    }
  }

  async function loadNotifications() {
    if (!userId) return;

    setNotificationsLoading(true);
    try {
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(userId),
        getUnreadNotificationCount(userId),
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  // UPDATED: navigate to post from notification click
  async function handleNotificationClick(notification: any) {
    if (!userId) return;

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id, userId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setShowNotificationsDropdown(false);

      if (notification.post?.id) {
        navigate(`/post/${notification.post.id}${notification.comment?.id ? `?comment=${notification.comment.id}` : ''}`);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  }


  useEffect(() => {
    loadCurrentUser();
    loadNotifications();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target as Node)
      ) {
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


  const handleUpdatePost = (postId: number, updatedPost: Post) => {
    // Handled by Feed component internally
  };

  const handleDeletePost = (postId: number) => {
    // Handled by Feed component internally
  };

  const handleLogout = () => {
    setAuthToken(null);
    window.location.href = '/auth';
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(postTitle.trim(), postContent.trim());
      // Reset form and close dialog
      setPostTitle('');
      setPostContent('');
      setShowAddPostDialog(false);
      // Show success toast
      toast.success('Post created successfully!');
      // Refresh the feed to show the new post
      feedRef.current?.refresh();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      const message = error?.response?.data?.message || 'Failed to create post';
      toast.error(typeof message === 'string' ? message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHomeClick = async () => {
    setIsRefreshing(true);
    
    // Custom slow scroll to top
    const scrollToTop = () => {
      const scrollStep = -window.scrollY / (10); 
      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep);
        } else {
          clearInterval(scrollInterval);
        }
      }, 20);
    };
    
    scrollToTop();
    
    // Wait a bit for scroll animation, then refresh
    setTimeout(async () => {
      await feedRef.current?.refresh();
      setIsRefreshing(false);
    }, 800); // Wait 800ms for scroll animation to complete
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
            {/* Add Post Button */}
            <Dialog open={showAddPostDialog} onOpenChange={setShowAddPostDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0"
                  title="Add Post"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts with the HeroCommu community.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter post title..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      maxLength={TITLE_MAX}
                    />
                    <div className="text-xs text-muted-foreground text-right">{postTitle.length}/{TITLE_MAX}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={6}
                      maxLength={CONTENT_MAX}
                    />
                    <div className="text-xs text-muted-foreground text-right">{postContent.length}/{CONTENT_MAX}</div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPostDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Home Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={handleHomeClick}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Home className="h-4 w-4" />
              )}
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
                        <div className="text-sm text-muted-foreground">No notifications</div>
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
                                ) : notification.actor?.name ? (
                                  notification.actor.name.charAt(0).toUpperCase()
                                ) : (
                                  'U'
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()} at{' '}
                                  {new Date(notification.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
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
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
                  ) : userId ? (
                    String.fromCharCode(65 + (userId % 26))
                  ) : (
                    'U'
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
                      <UserIcon className="h-4 w-4" />
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
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive-foreground"
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

        {/* Feed */}
        <Feed
          ref={feedRef}
          userId={userId || undefined}
          currentUser={currentUser}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onCommentAdded={loadNotifications}
        />

      </div>
    </div>
  );
}
