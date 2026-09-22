import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
    mode: "create" | "edit";
    onAddTodo?: (title: string, description: string) => Promise<void>;
    onEditTodo?: (
        id: string,
        title: string,
        description: string
    ) => Promise<void>;
    todoId?: string;
    initialTitle?: string;
    initialDescription?: string;
}

export const TodoForm = ({
    mode,
    onAddTodo,
    onEditTodo,
    todoId,
    initialTitle = "",
    initialDescription = "",
}: TodoFormProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);

    useEffect(() => {
        setTitle(initialTitle);
        setDescription(initialDescription);
    }, [initialTitle, initialDescription]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (mode === "create" && onAddTodo) {
            await onAddTodo(title, description);

            setTitle("");
            setDescription("");
        }

        if (mode === "edit" && onEditTodo && todoId) {
            await onEditTodo(todoId, title, description);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">
                {mode === "create"
                    ? "Agregar tarea"
                    : "Guardar cambios"}
            </button>
        </form>
    );
};

