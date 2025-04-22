import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/csrf';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const csrfToken = getCookie('csrftoken');
            const response = await fetch('/core/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                onLogin(data.username);
                navigate('/dashboard');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Something went wrong.");
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-5">
                <div className="card">
                    <div className="card-header text-center">
                        <h5>Login</h5>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Username:</label>
                                <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label>Password:</label>
                                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Login</button>
                        </form>
                        <p className="mt-3 text-center">
                            Don’t have an account? <a href="/register">Register here</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
