import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { store } from './store';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Chatbot from './components/Chatbot';
import FindDoctor from './components/clinic/FindDoctor';
import Appointments from './pages/Appointments';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = store.getState().auth;
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
    return (
        <>
            <Navigation />
            <ToastContainer />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/admin/*" element={<AdminRedirect />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/chatbot" element={
                    <PrivateRoute>
                        <Chatbot />
                    </PrivateRoute>
                } />
                <Route path="/find-doctor" element={<FindDoctor />} />
                <Route path="/appointments" element={
                    <PrivateRoute>
                        <Appointments />
                    </PrivateRoute>
                } />
            </Routes>
        </>
    );
};

const AdminRedirect: React.FC = () => {
    const { isAuthenticated, user } = store.getState().auth;
    if (!isAuthenticated || !user?.is_admin) {
        return <Navigate to="/" />;
    }
    return <Navigate to="/admin/users" />;
};

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <Router>
                    <AppRoutes />
                </Router>
            </ThemeProvider>
        </Provider>
    );
}

export default App;
