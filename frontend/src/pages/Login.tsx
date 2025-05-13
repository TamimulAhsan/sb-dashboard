
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // In a real implementation, this would make a fetch request to the backend
    // Here we'll add a mock implementation for demonstration
    try {
      // This is where you would make an API call to your backend
      // For now, just simulate a successful login with admin/admin

      const success = await login(username, password);
      
      if (username === 'admin' && password === 'admin') {
        // Mock successful login
        const mockSession = {
          id: 'session-' + Math.random().toString(36).substring(2, 9),
          username: username,
          isAuthenticated: true,
          expiresAt: Date.now() + 3600000 // 1 hour from now
        };
        
        // Store session in localStorage (in a real app, use httpOnly cookies)
        localStorage.setItem('adminSession', JSON.stringify(mockSession));
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        // Redirect to dashboard
        navigate('/');
      } else {
        // Mock failed login
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          For demo purposes, use username: admin and password: admin
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
