import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// 🛡️ Protected Route Wrapper
// If user is not logged in, redirect to /login
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }
    
    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // If user exists, render the protected page
    return children;
};

function App() {
    return (
        // 🔐 AuthProvider makes 'user' and 'login/register/logout' available everywhere
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Catch-all: redirect any unknown route to dashboard or login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;