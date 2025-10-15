import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AllClothing from './pages/AllClothing';
import CuratedClothing from './pages/CuratedClothingPage';
import WishlistPage from './pages/WishlistPage';
import { useAuth } from './hooks/UserContext';
import { JSX, useEffect } from 'react';
import PasswordRecovery from './pages/PasswordRecovery';
import { SurveyPage } from './pages/Survey';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { checkAuthStatus, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {


  const { checkAuthStatus, user } = useAuth();

  useEffect(() => {
    // Check authentication status when the component mounts
    checkAuthStatus();
  }, []);



  return (
    <div className="">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PasswordRecovery />} />
        <Route path="/allclothing"
          element={
            <ProtectedRoute>
              <AllClothing user={user!}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/curatedclothing"
          element={
            <ProtectedRoute>
                <CuratedClothing user={user!}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage user={user!}/>
            </ProtectedRoute>
          }
        />
        <Route path="/survey" 
          element={
            <ProtectedRoute>
              <SurveyPage user={user?.id!} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div >
  );
}

export default App;


