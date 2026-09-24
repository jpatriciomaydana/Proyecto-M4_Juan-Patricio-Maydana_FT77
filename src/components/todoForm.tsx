import { useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
    mode: "create" | "edit";
    onAddTodo?: (title: string, description: string) => Promise<void>;
    onEditTodo?: (
        id: string,
        title: string,
        description: string
    ) => Promise<void>;
    onSendSummary?: () => void;
    todoId?: string;
    initialTitle?: string;
    initialDescription?: string;
}

export const TodoForm = ({
    mode,
    onAddTodo,
    onEditTodo,
    onSendSummary,
    todoId,
    initialTitle = "",
    initialDescription = "",
}: TodoFormProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);

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
            <div className="task-form-fields">
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
            </div>

            <div className="task-form-actions">
                {mode === "create" && onSendSummary && (
                    <button
                        className="btn-summary"
                        type="button"
                        onClick={onSendSummary}
                    >
                        Enviar resumen al mail
                    </button>
                )}

                <button className="btn-add" type="submit">
                    {mode === "create" ? "+" : "✓"}
                </button>
            </div>
        </form>
    );
};
