import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


function Navbar({ onLogout }) {
    const navigate = useNavigate();

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        user = null;
    }

    const handleLogout = () => {
        const response = fetch('/core/logout/', {
            method: 'GET',
            credentials: 'include',
        });

        localStorage.removeItem('user');
        localStorage.removeItem('privateKey');
        onLogout(null);
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">CryptDrive</Link>
                <button className="navbar-toggler" type="button"
                                data-bs-toggle="collapse" data-bs-target="#navMenu"
                                aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMenu">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {user?.is_superuser && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/adminpanel">Admin panel</Link>
                            </li>
                        )}
                        {user ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown"
                                     role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user.username}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                    <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Log out</button></li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
