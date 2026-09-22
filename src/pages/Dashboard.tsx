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
import { subscribeToTodos, type Todo, } from "../services/todoService";
import { TodoForm } from "../components/todoForm";

function Dashboard() {
    const { user, logout } = useAuth();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    useEffect(() => {
        if (!user) {
            setTodos([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

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
                title: title,
                description: description,
                completed: false,
                userId: user.uid,
            });
        } catch (error) {
            console.error(error);
            setError("No se pudo crear la tarea");
            throw error;
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
        } catch (error) {
            console.error(error);
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
        } catch (error) {
            console.error(error);
            setError("No se pudo actualizar la tarea");
        }
    };

    const handleDeleteTodo = async (todoId: string) => {
        try {
            const todoRef = doc(db, "todos", todoId);

            await deleteDoc(todoRef);
        } catch (error) {
            console.error(error);
            setError("No se pudo eliminar la tarea");
        }
    };

    if (loading) {
        return <p>Cargando tareas...</p>;
    }

    return (
        <main>
            <h1>Panel de Tareas</h1>

            <p>
                Bienvenido{" "}
                {user?.displayName || user?.email}
            </p>

            <button onClick={logout}>
                Cerrar sesión
            </button>

            {editingTodo ? (
                <TodoForm
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
                />
            )}

            {error && <p>{error}</p>}

            {todos.length === 0 ? (
                <p>No tenés tareas todavía.</p>
            ) : (
                <ul>
                    {todos.map((todo) => (
                        <li key={todo.id}>
                            <h3>{todo.title}</h3>

                            <p>{todo.description}</p>

                            <p>
                                Estado:{" "}
                                {todo.completed
                                    ? "Completada"
                                    : "Pendiente"}
                            </p>

                            <button
                                onClick={() =>
                                    handleToggleTodo(
                                        todo.id,
                                        todo.completed
                                    )
                                }
                            >
                                {todo.completed
                                    ? "Marcar pendiente"
                                    : "Completar"}
                            </button>

                            <button onClick={() => setEditingTodo(todo)}>
                                Editar
                            </button>

                            <button
                                onClick={() =>
                                    handleDeleteTodo(todo.id)
                                }
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Dashboard;