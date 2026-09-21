import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
    /**
     * Ruta a la cual redirigir si el usuario no está autenticado.
     * Por defecto es "/login".
     */
    redirectTo?: string;
}

export function ProtectedRoute({ redirectTo = "/login" }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // 1. Mientras se verifica la sesión con el backend/storage, mostramos un indicador de carga
    if (loading) {
        return (
            <main>
                <p>Cargando sesión...</p>
            </main>
        );
    }

    // 2. Si no hay un usuario autenticado, redirigimos al login
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    // 3. Si está autenticado, renderizamos las rutas hijas (Dashboard, To-Do List, etc.)
    return <Outlet />;
}

export default ProtectedRoute;