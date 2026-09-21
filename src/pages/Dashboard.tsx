import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/firebase";

interface Todo {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
}

interface TodoForm {
    title: string;
    description: string;
}

const initialTodoForm: TodoForm = {
    title: "",
    description: "",
};

const Dashboard = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [form, setForm] = useState<TodoForm>(initialTodoForm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingForm, setEditingForm] = useState<TodoForm>(initialTodoForm);

    useEffect(() => {
        if (!user) {
            setTodos([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        const todosRef = collection(db, "todos");

        const todosQuery = query(
            todosRef,
            where("userId", "==", user.uid),
        );

        const unsubscribe = onSnapshot(
            todosQuery,
            (snapshot) => {
                const todosData: Todo[] = snapshot.docs.map((document) => ({
                    id: document.id,
                    ...(document.data() as Omit<Todo, "id">),
                }));

                setTodos(todosData);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError("No se pudieron cargar las tareas.");
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (!user) {
            setError("Debes iniciar sesión para crear una tarea.");
            return;
        }

        if (!form.title.trim()) {
            setError("El título es obligatorio.");
            return;
        }

        try {
            setError("");

            await addDoc(collection(db, "todos"), {
                title: form.title.trim(),
                description: form.description.trim(),
                completed: false,
                userId: user.uid,
            });

            setForm(initialTodoForm);
        } catch (err) {
            console.error(err);
            setError("No se pudo crear la tarea.");
        }
    };

    const handleToggle = async (todo: Todo) => {
        try {
            await updateDoc(doc(db, "todos", todo.id), {
                completed: !todo.completed,
            });
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar la tarea.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "todos", id));
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar la tarea.");
        }
    };

    const startEditing = (todo: Todo) => {
        setEditingId(todo.id);

        setEditingForm({
            title: todo.title,
            description: todo.description,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingForm(initialTodoForm);
    };

    const handleEditingChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setEditingForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (!editingId) {
            return;
        }

        if (!editingForm.title.trim()) {
            setError("El título es obligatorio.");
            return;
        }

        try {
            setError("");

            await updateDoc(doc(db, "todos", editingId), {
                title: editingForm.title.trim(),
                description: editingForm.description.trim(),
            });

            cancelEditing();
        } catch (err) {
            console.error(err);
            setError("No se pudo editar la tarea.");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("No se pudo cerrar la sesión.");
        }
    };

    if (authLoading) {
        return <p>Cargando usuario...</p>;
    }

    if (!user) {
        return null;
    }

    return (
        <main>
            <header>
                <h1>
                    Bienvenido, {user.displayName || user.email} 👋
                </h1>

                <button onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </header>

            <section>
                <h2>Nueva tarea</h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="title">
                            Título
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="description">
                            Descripción
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit">
                        Crear tarea
                    </button>
                </form>
            </section>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <section>
                <h2>Mis tareas</h2>

                {loading ? (
                    <p>Cargando tareas...</p>
                ) : todos.length === 0 ? (
                    <p>No tenés tareas todavía.</p>
                ) : (
                    <ul>
                        {todos.map((todo) => (
                            <li key={todo.id}>
                                {editingId === todo.id ? (
                                    <form onSubmit={handleEditSubmit}>
                                        <input
                                            name="title"
                                            value={editingForm.title}
                                            onChange={handleEditingChange}
                                        />

                                        <textarea
                                            name="description"
                                            value={
                                                editingForm.description
                                            }
                                            onChange={handleEditingChange}
                                        />

                                        <button type="submit">
                                            Guardar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                        >
                                            Cancelar
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <h3>
                                            {todo.title}
                                        </h3>

                                        <p>
                                            {todo.description}
                                        </p>

                                        <p>
                                            {todo.completed
                                                ? "Completada"
                                                : "Pendiente"}
                                        </p>

                                        <button
                                            onClick={() =>
                                                handleToggle(todo)
                                            }
                                        >
                                            {todo.completed
                                                ? "Marcar pendiente"
                                                : "Completar"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                startEditing(todo)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(todo.id)
                                            }
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default Dashboard;