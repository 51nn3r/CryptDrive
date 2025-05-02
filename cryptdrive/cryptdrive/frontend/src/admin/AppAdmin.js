import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import UsersPage from './pages/UsersPage';
import GroupsPage from './pages/GroupsPage';
import FilesPage from './pages/FilesPage';
import SystemPage from './pages/SystemPage';

export default function AppAdmin() {
    return (
        <>
            <AdminNavbar />

            <div className="container-fluid mt-3">
                <Suspense fallback={<div>Loading…</div>}>
                    <Routes>
                        <Route path="users" element={<UsersPage />} />
                        <Route path="groups" element={<GroupsPage />} />
                        <Route path="files" element={<FilesPage />} />
                        <Route path="system" element={<SystemPage />} />
                        <Route path="*" element={<Navigate to="users" />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
}