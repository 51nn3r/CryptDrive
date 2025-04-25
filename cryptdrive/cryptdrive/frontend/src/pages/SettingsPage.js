import React, { useState, useEffect } from 'react';

import GroupPanel from '../components/GroupPanel';

function SettingsPage() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('/core/settings/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (response.ok) {
            setMessage('Username updated successfully.');
            localStorage.setItem('user', JSON.stringify({ username }));
        } else {
            setMessage('Failed to update username.');
        }
    };

    return (
        <div class="container mt-5">
            <GroupPanel />
        </div>
    );
}

export default SettingsPage;
