import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Employee } from '@shared/types';
import { APP_NAME } from '@/lib/constants';
import { Toaster, toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useSettingsStore } from '@/stores/settingsStore';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);
  const { logoUrl, fetchLogoUrl } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchLogoUrl();
  }, [fetchLogoUrl]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInUser = await api<Employee>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (loggedInUser) {
        login(loggedInUser.id, loggedInUser.name, loggedInUser.role);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600 opacity-20"></div>
      <Toaster richColors />
      <Card className="w-full max-w-md z-10 shadow-2xl animate-scale-in">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            {logoUrl ? (
              <div className="bg-muted/50 p-1.5 rounded-lg inline-flex">
                <img src={logoUrl} alt="App Logo" className="h-9 w-9 object-contain" />
              </div>
            ) : (
              <Droplets className="h-10 w-10 text-brand" />
            )}
            <h1 className="text-3xl font-bold text-foreground">{APP_NAME}</h1>
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-brand hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}