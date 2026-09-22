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
        <form className="task-form" onSubmit={handleSubmit}>
            <input
                className="task-input"
                type="text"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                className="task-input task-description-input"
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button className="btn-add" type="submit">
                {mode === "create" ? "+" : "✓"}
            </button>
        </form>
    );
};