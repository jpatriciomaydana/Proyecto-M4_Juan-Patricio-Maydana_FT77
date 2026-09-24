import { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/firebase";
import { subscribeToTodos, type Todo } from "../services/todoService";
import { TodoForm } from "../components/todoForm";

function Dashboard() {
    const { user } = useAuth();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        const unsubscribe = subscribeToTodos(
            user.uid,
            (todos) => {
                setTodos(todos);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleAddTodo = async (title: string, description: string) => {
        if (!user) {
            throw new Error("No hay usuario autenticado");
        }

        try {
            await addDoc(collection(db, "todos"), {
                title,
                description,
                completed: false,
                userId: user.uid,
            });
        } catch {
            setError("No se pudo crear la tarea");
            throw new Error("No se pudo crear la tarea");
        }
    };

    const handleEditTodo = async (
        todoId: string,
        title: string,
        description: string
    ) => {
        try {
            const todoRef = doc(db, "todos", todoId);

            await updateDoc(todoRef, {
                title,
                description,
            });

            setEditingTodo(null);
        } catch {
            setError("No se pudo editar la tarea");
        }
    };

    const handleToggleTodo = async (
        todoId: string,
        completed: boolean
    ) => {
        try {
            const todoRef = doc(db, "todos", todoId);

            await updateDoc(todoRef, {
                completed: !completed,
            });
        } catch {
            setError("No se pudo actualizar la tarea");
        }
    };

    const handleDeleteTodo = async (todoId: string) => {
        try {
            const todoRef = doc(db, "todos", todoId);

            await deleteDoc(todoRef);
        } catch {
            setError("No se pudo eliminar la tarea");
        }
    };

    const handleSendSummary = async () => {
        if (!user?.email) {
            setError("No hay un correo asociado al usuario");
            return;
        }

        try {
            setError("");

            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: user.email,
                    todos: todos.map((todo) => ({
                        title: todo.title,
                        description: todo.description,
                        completed: todo.completed,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo enviar el resumen"
                );
            }
        } catch {
            setError("No se pudo enviar el resumen por correo");
        }
    };

    if (loading) {
        return (
            <main className="app-container">
                <p>Cargando tareas...</p>
            </main>
        );
    }

    return (
        <main className="app-container">
            <header className="app-header">
                <div className="app-header-user">
                    <div>
                        <h1 className="greeting-title">
                            Bienvenido{" "}
                            {user?.displayName || user?.email}
                        </h1>

                        <p className="greeting-subtitle">
                            Panel de tareas
                        </p>
                    </div>
                </div>
            </header>

            {editingTodo ? (
                <TodoForm
                    key={editingTodo.id}
                    mode="edit"
                    todoId={editingTodo.id}
                    initialTitle={editingTodo.title}
                    initialDescription={editingTodo.description}
                    onEditTodo={handleEditTodo}
                />
            ) : (
                <TodoForm
                    mode="create"
                    onAddTodo={handleAddTodo}
                    onSendSummary={handleSendSummary}
                />
            )}

            {error && <p>{error}</p>}

            {todos.length === 0 ? (
                <p>No tenés tareas todavía.</p>
            ) : (
                <ul className="task-list">
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            className={`task-card ${todo.completed ? "completed" : ""
                                }`}
                        >
                            <button
                                className={`task-checkbox ${todo.completed ? "checked" : ""
                                    }`}
                                onClick={() =>
                                    handleToggleTodo(
                                        todo.id,
                                        todo.completed
                                    )
                                }
                                type="button"
                                aria-label={
                                    todo.completed
                                        ? "Marcar tarea como pendiente"
                                        : "Completar tarea"
                                }
                            >
                                {todo.completed && "✓"}
                            </button>

                            <div className="task-content">
                                <h3 className="task-title">
                                    {todo.title}
                                </h3>

                                {todo.description && (
                                    <p className="task-description">
                                        {todo.description}
                                    </p>
                                )}

                                <span className="task-status">
                                    {todo.completed
                                        ? "Completada"
                                        : "Pendiente"}
                                </span>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="task-edit"
                                    onClick={() =>
                                        setEditingTodo(todo)
                                    }
                                    type="button"
                                    aria-label="Editar tarea"
                                >
                                    ✏️
                                </button>

                                <button
                                    className="task-delete"
                                    onClick={() =>
                                        handleDeleteTodo(todo.id)
                                    }
                                    type="button"
                                    aria-label="Eliminar tarea"
                                >
                                    🗑️
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Dashboard;
