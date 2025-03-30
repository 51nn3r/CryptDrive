import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/csrf';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const csrfToken = getCookie('csrftoken');
            const response = await fetch('/core/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ username, password, password_confirm: passwordConfirm })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Something went wrong.");
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header text-center">
                        <h5>Create Account</h5>
                    </div>
                    <div className="card-body">
                        {error && (
                        <div className="alert alert-danger">
                            <ul className="mb-0">
                                {Object.entries(error).map(([field, messages], index) => (
                                    <li key={index}>
                                        <strong>{field}:</strong> {messages.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Username:</label>
                                <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label>Password:</label>
                                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label>Confirm Password:</label>
                                <input type="password" className="form-control" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-success w-100">Register</button>
                        </form>
                        <p className="mt-3 text-center">
                            Already have an account? <a href="/login">Login here</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
