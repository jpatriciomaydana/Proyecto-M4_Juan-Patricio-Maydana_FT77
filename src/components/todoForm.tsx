import { useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
    mode: "create" | "edit";
    onAddTodo?: (
        title: string,
        description: string,
        priority: string,
        dueDate: string
    ) => Promise<void>;
    onEditTodo?: (
        id: string,
        title: string,
        description: string,
        priority: string,
        dueDate: string
    ) => Promise<void>;
    onSendSummary?: () => void;
    todoId?: string;
    initialTitle?: string;
    initialDescription?: string;
    initialPriority?: string;
    initialDueDate?: string;
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
    initialPriority = "medium",
    initialDueDate = "",
    successMessage = "",
    errorMessage = "",
}: TodoFormProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [priority, setPriority] = useState(initialPriority);
    const [dueDate, setDueDate] = useState(initialDueDate);
    const [titleError, setTitleError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setTitleError("El título de la tarea es obligatorio");
            return;
        }

        setTitleError("");

        if (mode === "create" && onAddTodo) {
            await onAddTodo(
                title.trim(),
                description,
                priority,
                dueDate
            );

            setTitle("");
            setDescription("");
            setPriority("medium");
            setDueDate("");
        }

        if (mode === "edit" && onEditTodo && todoId) {
            await onEditTodo(
                todoId,
                title.trim(),
                description,
                priority,
                dueDate
            );
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
                    <p className="task-form-error">
                        {titleError}
                    </p>
                )}

                <textarea
                    className="task-input task-description-input"
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                />

                <div className="task-extra-fields">
                    <div className="task-field-group">
                        <label
                            className="task-field-label"
                            htmlFor="priority"
                        >
                            Prioridad
                        </label>

                        <select
                            id="priority"
                            className="task-input task-select"
                            value={priority}
                            onChange={(e) =>
                                setPriority(e.target.value)
                            }
                        >
                            <option value="high">🔴 Alta</option>
                            <option value="medium">🟡 Media</option>
                            <option value="low">🟢 Baja</option>
                        </select>
                    </div>

                    <div className="task-field-group">
                        <label
                            className="task-field-label"
                            htmlFor="dueDate"
                        >
                            Vencimiento
                        </label>

                        <input
                            id="dueDate"
                            className="task-input task-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) =>
                                setDueDate(e.target.value)
                            }
                        />
                    </div>
                </div>
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

