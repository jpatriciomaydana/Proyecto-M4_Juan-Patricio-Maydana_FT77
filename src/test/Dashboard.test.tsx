import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "../pages/Dashboard";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/todoService", () => ({
    subscribeToTodos: vi.fn(),
}));

vi.mock("../services/firebase", () => ({
    db: {},
}));

vi.mock("firebase/firestore", () => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getFirestore: vi.fn(),
    updateDoc: vi.fn(),
}));

import { useAuth } from "../hooks/useAuth";
import { subscribeToTodos } from "../services/todoService";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

describe("Dashboard", () => {
    it("muestra las tareas del usuario autenticado", async () => {
        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodos = [
            {
                id: "todo-1",
                title: "Comprar ingredientes",
                description: "Tomates y cebollas",
                completed: false,
                userId: "user-123",
                priority: "medium",
                dueDate: "2026-09-30",
            },
            {
                id: "todo-2",
                title: "Preparar presentación",
                description: "Revisar las diapositivas",
                completed: true,
                userId: "user-123",
                priority: "high",
                dueDate: "2026-10-01",
            },
        ];

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange(mockTodos);
                return vi.fn();
            }
        );

        render(<Dashboard />);

        expect(
            await screen.findByText("Comprar ingredientes")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Preparar presentación")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Tomates y cebollas")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Revisar las diapositivas")
        ).toBeInTheDocument();

        expect(subscribeToTodos).toHaveBeenCalledWith(
            "user-123",
            expect.any(Function)
        );
    });

    it("crea una tarea con los datos del usuario autenticado", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange([]);
                return vi.fn();
            }
        );

        vi.mocked(addDoc).mockResolvedValue({
            id: "todo-nuevo",
        } as never);

        vi.mocked(collection).mockReturnValue(
            "todos-reference" as never
        );

        render(<Dashboard />);

        const titleInput = screen.getByPlaceholderText(
            "Título de la tarea"
        );

        const descriptionInput = screen.getByPlaceholderText(
            "Descripción (opcional)"
        );

        await user.type(
            titleInput,
            "Nueva tarea"
        );

        await user.type(
            descriptionInput,
            "Descripción de la nueva tarea"
        );

        await user.click(
            screen.getByRole("button", {
                name: "+",
            })
        );

        expect(collection).toHaveBeenCalledWith(
            expect.anything(),
            "todos"
        );

        expect(addDoc).toHaveBeenCalledWith(
            "todos-reference",
            {
                title: "Nueva tarea",
                description: "Descripción de la nueva tarea",
                priority: "medium",
                dueDate: "",
                completed: false,
                userId: "user-123",
            }
        );
    });

    it("edita una tarea con los datos modificados", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodo = {
            id: "todo-1",
            title: "Título original",
            description: "Descripción original",
            completed: false,
            userId: "user-123",
            priority: "medium",
            dueDate: "2026-09-30",
        };

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange([mockTodo]);
                return vi.fn();
            }
        );

        vi.mocked(doc).mockReturnValue(
            "todo-reference" as never
        );

        vi.mocked(updateDoc).mockResolvedValue(
            undefined
        );

        render(<Dashboard />);

        await user.click(
            screen.getByRole("button", {
                name: "Editar tarea",
            })
        );

        const titleInput = screen.getByDisplayValue(
            "Título original"
        );

        const descriptionInput = screen.getByDisplayValue(
            "Descripción original"
        );

        await user.clear(titleInput);
        await user.type(
            titleInput,
            "Título modificado"
        );

        await user.clear(descriptionInput);
        await user.type(
            descriptionInput,
            "Descripción modificada"
        );

        await user.click(
            screen.getByRole("button", {
                name: "✓",
            })
        );

        expect(doc).toHaveBeenCalledWith(
            expect.anything(),
            "todos",
            "todo-1"
        );

        expect(updateDoc).toHaveBeenCalledWith(
            "todo-reference",
            {
                title: "Título modificado",
                description: "Descripción modificada",
                priority: "medium",
                dueDate: "2026-09-30",
            }
        );
    });

    it("marca una tarea como completada", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodo = {
            id: "todo-1",
            title: "Tarea pendiente",
            description: "Descripción de la tarea",
            completed: false,
            userId: "user-123",
            priority: "medium",
            dueDate: "2026-09-30",
        };

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange([mockTodo]);
                return vi.fn();
            }
        );

        vi.mocked(doc).mockReturnValue(
            "todo-reference" as never
        );

        vi.mocked(updateDoc).mockResolvedValue(undefined);

        render(<Dashboard />);

        await user.click(
            screen.getByRole("button", {
                name: "Completar tarea",
            })
        );

        expect(doc).toHaveBeenCalledWith(
            expect.anything(),
            "todos",
            "todo-1"
        );

        expect(updateDoc).toHaveBeenCalledWith(
            "todo-reference",
            {
                completed: true,
            }
        );
    });

    it("elimina una tarea", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodo = {
            id: "todo-1",
            title: "Tarea para eliminar",
            description: "Descripción de la tarea",
            completed: false,
            userId: "user-123",
            priority: "medium",
            dueDate: "2026-09-30",
        };

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange([mockTodo]);
                return vi.fn();
            }
        );

        vi.mocked(doc).mockReturnValue(
            "todo-reference" as never
        );

        vi.mocked(deleteDoc).mockResolvedValue(undefined);

        render(<Dashboard />);

        await user.click(
            screen.getByRole("button", {
                name: "Eliminar tarea",
            })
        );

        expect(doc).toHaveBeenCalledWith(
            expect.anything(),
            "todos",
            "todo-1"
        );

        expect(deleteDoc).toHaveBeenCalledWith(
            "todo-reference"
        );
    });

    it("muestra solamente las tareas pendientes al seleccionar el filtro", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodos = [
            {
                id: "todo-1",
                title: "Tarea pendiente",
                description: "Descripción pendiente",
                completed: false,
                userId: "user-123",
                priority: "medium",
                dueDate: "2026-09-30",
            },
            {
                id: "todo-2",
                title: "Tarea completada",
                description: "Descripción completada",
                completed: true,
                userId: "user-123",
                priority: "high",
                dueDate: "2026-10-01",
            },
        ];

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange(mockTodos);
                return vi.fn();
            }
        );

        render(<Dashboard />);

        expect(
            screen.getByText("Tarea pendiente")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Tarea completada")
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: /Pendientes/i,
            })
        );

        expect(
            screen.getByText("Tarea pendiente")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Tarea completada")
        ).not.toBeInTheDocument();
    });

    it("muestra solamente las tareas completadas al seleccionar el filtro", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodos = [
            {
                id: "todo-1",
                title: "Tarea pendiente",
                description: "Descripción pendiente",
                completed: false,
                userId: "user-123",
                priority: "medium",
                dueDate: "2026-09-30",
            },
            {
                id: "todo-2",
                title: "Tarea completada",
                description: "Descripción completada",
                completed: true,
                userId: "user-123",
                priority: "high",
                dueDate: "2026-10-01",
            },
        ];

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange(mockTodos);
                return vi.fn();
            }
        );

        render(<Dashboard />);

        await user.click(
            screen.getByRole("button", {
                name: /Completadas/i,
            })
        );

        expect(
            screen.getByText("Tarea completada")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Tarea pendiente")
        ).not.toBeInTheDocument();
    });

    it("muestra todas las tareas al seleccionar el filtro Todas", async () => {
        const user = userEvent.setup();

        const mockUser = {
            uid: "user-123",
            email: "usuario@test.com",
            displayName: "Usuario de prueba",
        };

        const mockTodos = [
            {
                id: "todo-1",
                title: "Tarea pendiente",
                description: "Descripción pendiente",
                completed: false,
                userId: "user-123",
                priority: "medium",
                dueDate: "2026-09-30",
            },
            {
                id: "todo-2",
                title: "Tarea completada",
                description: "Descripción completada",
                completed: true,
                userId: "user-123",
                priority: "high",
                dueDate: "2026-10-01",
            },
        ];

        vi.mocked(useAuth).mockReturnValue({
            user: mockUser as ReturnType<typeof useAuth>["user"],
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        vi.mocked(subscribeToTodos).mockImplementation(
            (_userId, onTodosChange) => {
                onTodosChange(mockTodos);
                return vi.fn();
            }
        );

        render(<Dashboard />);

        await user.click(
            screen.getByRole("button", {
                name: /Pendientes/i,
            })
        );

        expect(
            screen.queryByText("Tarea completada")
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: /Todas/i,
            })
        );

        expect(
            screen.getByText("Tarea pendiente")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Tarea completada")
        ).toBeInTheDocument();
    });
});