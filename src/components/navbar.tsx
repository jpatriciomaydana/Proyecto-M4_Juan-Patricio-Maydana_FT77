import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./navbar.css";

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">
                    <div className="brand-logo">
                        <span className="brand-logo-m">M</span>
                        <span className="brand-logo-check">✓</span>
                    </div>

                    <div className="brand-text">
                        <span className="brand-name">MateCode</span>
                        <span className="brand-tagline">
                            Gestión simple para tu empresa
                        </span>
                    </div>
                </Link>
            </div>

            <div className="navbar-actions">
                {user ? (
                    <div className="navbar-user">
                        <span className="navbar-email">{user.email}</span>

                        <button
                            className="btn-logout"
                            onClick={logout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div className="navbar-links">
                        <Link
                            to="/login"
                            className="nav-link"
                        >
                            Iniciar Sesión
                        </Link>

                        <Link
                            to="/register"
                            className="nav-link"
                        >
                            Crear Cuenta
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};