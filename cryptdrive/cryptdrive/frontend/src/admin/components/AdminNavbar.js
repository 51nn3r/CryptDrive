import { NavLink } from 'react-router-dom';

export default function AdminNavbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <span className="navbar-brand">CryptDrive Admin</span>
            <div className="navbar-nav">
                <NavLink to="users" className="nav-link">Users</NavLink>
                <NavLink to="groups" className="nav-link">Groups</NavLink>
                <NavLink to="files" className="nav-link">Files</NavLink>
                <NavLink to="system" className="nav-link">System</NavLink>
            </div>
        </nav>
    );
}
