import { JSX } from 'react';
import { Navigate, RouteProps } from 'react-router-dom';

type ProtectedRouteProps = RouteProps & {
    component: JSX.Element;
  };

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = localStorage.getItem('authGimToken');
   
    if (!token) {
        return <Navigate to="/login" />;
    }

      return <>{children}</>;
  };

export default ProtectedRoute;
