import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function DashboardPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);
    if (!user) return null;
    
    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6">
                <h3 className="text-center">Vitaj, {user.username}!</h3>
                <p className="text-center">Toto je dashboard))</p>
            </div>
        </div>
    );
}

export default DashboardPage;
