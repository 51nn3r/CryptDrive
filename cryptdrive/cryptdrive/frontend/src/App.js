import logo from './logo.svg';
import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/DashboardPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    useEffect(() => {
        fetch('/core/login/', {
            method: 'GET',
            credentials: 'include',
        });
    }, []);

    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />

                <main className="flex-grow-1 container py-4">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;
