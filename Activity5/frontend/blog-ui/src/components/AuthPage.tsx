import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { useTheme } from '../hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Field, FieldContent, FieldLabel, FieldError } from './ui/field';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  general?: string;
}

export default function AuthPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.email = validateEmail(email);
    if (mode === 'register') {
      newErrors.name = validateName(name);
    }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(email, name, password);
        setSuccess('Registration successful. Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
          setEmail('');
          setName('');
          setPassword('');
        }, 1000);
      } else {
        const { accessToken } = await login(email, password);
        const { setAuthToken } = await import('../api');
        setAuthToken(accessToken);
        navigate('/');
      }
    } catch (err: any) {
      setErrors({ 
        general: err?.response?.data?.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
        <CardHeader className="text-start">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Enter your details to create a new account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  required 
                />
              </FieldContent>
              <FieldError>{errors.email}</FieldError>
            </Field>
            
            {mode === 'register' && (
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
                    required 
                  />
                </FieldContent>
                <FieldError>{errors.name}</FieldError>
              </Field>
            )}
            
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input 
                    value={password} 
                    onChange={e => {
                      setPassword(e.target.value);
                      handleInputChange('password', e.target.value);
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    required 
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
            
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm"
            >
              {mode === 'login' ? (
                <>
                  Don't have an account? <span className="text-primary font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-primary font-medium">Sign in</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


