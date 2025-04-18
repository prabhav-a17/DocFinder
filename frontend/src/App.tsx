import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { store } from './store';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
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
import { restoreUserSession } from './utils/auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = store.getState().auth;
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    useEffect(() => {
        // Restore user session on app mount
        restoreUserSession();
    }, []);

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <GlobalStyles />
                <Router>
                    <div className="app">
                        <Navigation />
                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                        <main className="page-container">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
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
                                <Route path="/find-doctor/:specialist" element={<FindDoctor />} />
                                <Route path="/appointments" element={
                                    <PrivateRoute>
                                        <Appointments />
                                    </PrivateRoute>
                                } />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </ThemeProvider>
        </Provider>
    );
}

export default App;
