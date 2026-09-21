import { useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
    onAddTodo: (title: string, description: string) => void;
}

export const TodoForm = ({ onAddTodo }: TodoFormProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onAddTodo(title, description);
        setTitle("");
        setDescription("");
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
            <button type="submit">Agregar tarea</button>
        </form>
    );
};
