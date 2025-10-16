import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, updateUser, deleteUser, getCurrentUserIdFromToken } from '../api';
import { useTheme } from '../hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from './ui/field';
import { Skeleton } from './ui/skeleton';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function UserPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const uid = getCurrentUserIdFromToken()!;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (password && password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.name = validateName(name);
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleInputChange = (field: keyof FormErrors, value: string) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser(uid);
        setName(u.name || '');
        setEmail(u.email || '');
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMsg(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(uid, { name, email, ...(password ? { password } : {}) });
      setMsg('Profile updated successfully');
      setPassword(''); // Clear password field after successful update
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setErrors({ 
        general: err?.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const { setAuthToken } = await import('../api');
    await deleteUser(uid);
    setAuthToken(null);
    navigate('/auth');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Dark/Light Mode Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 h-10 w-10 p-0"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-9 w-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <FieldContent>
                  <Input 
                    value={name} 
                    onChange={e => {
                      setName(e.target.value);
                      handleInputChange('name', e.target.value);
                    }}
                    placeholder="Enter your full name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                </FieldContent>
                <FieldError>{errors.name}</FieldError>
              </Field>
              
              <Field>
                <FieldLabel>Email</FieldLabel>
                <FieldContent>
                  <Input 
                    value={email} 
                    onChange={e => {
                      setEmail(e.target.value);
                      handleInputChange('email', e.target.value);
                    }}
                    type="email"
                    placeholder="Enter your email"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                </FieldContent>
                <FieldError>{errors.email}</FieldError>
              </Field>
              
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <FieldDescription>Leave empty to keep current password</FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <Input 
                      value={password} 
                      onChange={e => {
                        setPassword(e.target.value);
                        handleInputChange('password', e.target.value);
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FieldContent>
                <FieldError>{errors.password}</FieldError>
              </Field>
            
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              
              {msg && (
                <Alert>
                  <AlertDescription className="text-green-600">{msg}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="w-full"
                >
                  Delete Account
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">Back to Posts</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


