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
import {
    subscribeToTodos,
    type Todo,
} from "../services/todoService";
import { TodoForm } from "../components/todoForm";

type TodoFilter = "all" | "pending" | "completed";

function Dashboard() {
    const { user } = useAuth();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [filter, setFilter] = useState<TodoFilter>("all");

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

    const handleAddTodo = async (
        title: string,
        description: string,
        priority: string,
        dueDate: string
    ) => {
        if (!user) {
            throw new Error("No hay usuario autenticado");
        }

        try {
            await addDoc(collection(db, "todos"), {
                title,
                description,
                priority,
                dueDate,
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
        description: string,
        priority: string,
        dueDate: string
    ) => {
        try {
            const todoRef = doc(db, "todos", todoId);

            await updateDoc(todoRef, {
                title,
                description,
                priority,
                dueDate,
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
            setSuccessMessage("");

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

            setSuccessMessage(
                "Resumen enviado correctamente a tu correo."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch {
            setError("No se pudo enviar el resumen por correo");

            setTimeout(() => {
                setError("");
            }, 3000);
        }
    };

    const pendingCount = todos.filter(
        (todo) => !todo.completed
    ).length;

    const completedCount = todos.filter(
        (todo) => todo.completed
    ).length;

    const filteredTodos = todos.filter((todo) => {
        if (filter === "pending") {
            return !todo.completed;
        }

        if (filter === "completed") {
            return todo.completed;
        }

        return true;
    });

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
                    {user?.photoURL && (
                        <img
                            className="dashboard-avatar"
                            src={user.photoURL}
                            alt={`Foto de perfil de ${user.displayName || user.email
                                }`}
                        />
                    )}

                    <div>
                        <h1 className="greeting-title">
                            Bienvenido{" "}
                            {user?.displayName || user?.email}
                        </h1>

                        <p className="greeting-subtitle">
                            Panel de tareas
                        </p>

                        <p className="greeting-description">
                            Organizá tus tareas. Impulsá tu trabajo.
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
                    initialPriority={editingTodo.priority}
                    initialDueDate={editingTodo.dueDate}
                    onEditTodo={handleEditTodo}
                />
            ) : (
                <TodoForm
                    mode="create"
                    onAddTodo={handleAddTodo}
                    onSendSummary={handleSendSummary}
                    successMessage={successMessage}
                    errorMessage={error}
                />
            )}

            <section className="task-filter-section">
                <p className="section-label">Mis tareas</p>

                <div
                    className="task-filters"
                    role="group"
                    aria-label="Filtrar tareas"
                >
                    <button
                        type="button"
                        className={`task-filter ${filter === "all" ? "active" : ""
                            }`}
                        onClick={() => setFilter("all")}
                    >
                        Todas
                        <span className="task-filter-count">
                            {todos.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`task-filter ${filter === "pending" ? "active" : ""
                            }`}
                        onClick={() => setFilter("pending")}
                    >
                        Pendientes
                        <span className="task-filter-count">
                            {pendingCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`task-filter ${filter === "completed" ? "active" : ""
                            }`}
                        onClick={() => setFilter("completed")}
                    >
                        Completadas
                        <span className="task-filter-count">
                            {completedCount}
                        </span>
                    </button>
                </div>
            </section>

            {todos.length === 0 ? (
                <p className="empty-state">
                    No tenés tareas todavía.
                </p>
            ) : filteredTodos.length === 0 ? (
                <p className="empty-state">
                    {filter === "pending"
                        ? "No tenés tareas pendientes."
                        : "No tenés tareas completadas."}
                </p>
            ) : (
                <ul className="task-list">
                    {filteredTodos.map((todo) => (
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

                                <div className="task-details">
                                    <span
                                        className={`task-priority priority-${todo.priority}`}
                                    >
                                        {todo.priority === "high"
                                            ? "🔴 Alta"
                                            : todo.priority === "medium"
                                                ? "🟡 Media"
                                                : "🟢 Baja"}
                                    </span>

                                    {todo.dueDate && (
                                        <span className="task-due-date">
                                            📅 {todo.dueDate}
                                        </span>
                                    )}

                                    <span className="task-status">
                                        {todo.completed
                                            ? "Completada"
                                            : "Pendiente"}
                                    </span>
                                </div>
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