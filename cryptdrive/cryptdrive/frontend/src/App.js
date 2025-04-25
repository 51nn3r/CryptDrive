import logo from './logo.svg';
import React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        fetch('/core/login/', {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setUser(data.username);
                    localStorage.setItem('user', JSON.stringify(data));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('privateKey');
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
            })
            .finally(() => setChecking(false));
    }, []);

    if (checking) return null;

    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Navbar onLogout={setUser} />

                <main className="flex-grow-1 container py-4">
                    <Routes>
                        <Route path="/login" element={!user ? <LoginPage onLogin={setUser} /> : <Navigate to="/dashboard" />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />

                        <Route path="*" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}/>
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;
