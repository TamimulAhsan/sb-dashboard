
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ 
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading or spinner while checking authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
