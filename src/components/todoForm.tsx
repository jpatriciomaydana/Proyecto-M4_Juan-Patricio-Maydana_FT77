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
    successMessage?: string;
    errorMessage?: string;
}

export const TodoForm = ({
    mode,
    onAddTodo,
    onEditTodo,
    onSendSummary,
    todoId,
    initialTitle = "",
    initialDescription = "",
    successMessage = "",
    errorMessage = "",
}: TodoFormProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [titleError, setTitleError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setTitleError("El título de la tarea es obligatorio");
            return;
        }

        setTitleError("");

        if (mode === "create" && onAddTodo) {
            await onAddTodo(title.trim(), description);

            setTitle("");
            setDescription("");
        }

        if (mode === "edit" && onEditTodo && todoId) {
            await onEditTodo(todoId, title.trim(), description);
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
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setTitleError("");
                    }}
                />

                {titleError && (
                    <p className="task-form-error">{titleError}</p>
                )}

                <textarea
                    className="task-input task-description-input"
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="task-form-actions">
                {mode === "create" && onSendSummary && (
                    <>
                        <button
                            className="btn-summary"
                            type="button"
                            onClick={onSendSummary}
                        >
                            Enviar resumen al mail
                        </button>

                        {successMessage && (
                            <p className="task-form-success">
                                {successMessage}
                            </p>
                        )}

                        {errorMessage && (
                            <p className="task-form-error">
                                {errorMessage}
                            </p>
                        )}
                    </>
                )}

                <button className="btn-add" type="submit">
                    {mode === "create" ? "+" : "✓"}
                </button>
            </div>
        </form>
    );
};