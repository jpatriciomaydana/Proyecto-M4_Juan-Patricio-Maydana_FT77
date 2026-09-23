import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import ProtectedRoute from "../routes/ProtectedRoute";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from "../hooks/useAuth";

describe("ProtectedRoute", () => {
    it("redirige al login cuando el usuario no está autenticado", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<h1>Dashboard privado</h1>}
                        />
                    </Route>

                    <Route
                        path="/login"
                        element={<h1>Página de Login</h1>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole("heading", {
                name: "Página de Login",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                name: "Dashboard privado",
            })
        ).not.toBeInTheDocument();
    });

    it("permite acceder al dashboard cuando el usuario está autenticado", () => {
        const mockUser: User = {
            uid: "user-123",
            email: "usuario@test.com",
            emailVerified: true,
            displayName: "Usuario de prueba",
            photoURL: null,
            phoneNumber: null,
            providerId: "password",
            isAnonymous: false,
            metadata: {
                creationTime: undefined,
                lastSignInTime: undefined,
            },
            providerData: [],
            refreshToken: "",
            tenantId: null,
            delete: vi.fn(),
            getIdToken: vi.fn(),
            getIdTokenResult: vi.fn(),
            reload: vi.fn(),
            toJSON: vi.fn(),
        };

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<h1>Dashboard privado</h1>}
                        />
                    </Route>

                    <Route
                        path="/login"
                        element={<h1>Página de Login</h1>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole("heading", {
                name: "Dashboard privado",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                name: "Página de Login",
            })
        ).not.toBeInTheDocument();
    });

    it("muestra el estado de carga mientras verifica la sesión", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: true,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<h1>Dashboard privado</h1>}
                        />
                    </Route>

                    <Route
                        path="/login"
                        element={<h1>Página de Login</h1>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByText("Cargando sesión...")
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                name: "Página de Login",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                name: "Dashboard privado",
            })
        ).not.toBeInTheDocument();
    });
});
