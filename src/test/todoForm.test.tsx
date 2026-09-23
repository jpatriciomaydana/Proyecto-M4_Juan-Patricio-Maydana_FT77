import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodoForm } from "../components/todoForm";

describe("TodoForm", () => {
    it("llama a onAddTodo con el título y la descripción ingresados", async () => {
        const onAddTodo = vi.fn();
        const user = userEvent.setup();

        render(
            <TodoForm
                mode="create"
                onAddTodo={onAddTodo}
            />
        );

        const titleInput = screen.getByPlaceholderText(
            "Título de la tarea"
        );

        const descriptionInput = screen.getByPlaceholderText(
            "Descripción (opcional)"
        );

        await user.type(titleInput, "Comprar ingredientes");
        await user.type(
            descriptionInput,
            "Comprar tomates y cebollas"
        );

        await user.click(screen.getByRole("button"));

        expect(onAddTodo).toHaveBeenCalledWith(
            "Comprar ingredientes",
            "Comprar tomates y cebollas"
        );
    });

    it("limpia los campos después de crear una tarea", async () => {
        const onAddTodo = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(
            <TodoForm
                mode="create"
                onAddTodo={onAddTodo}
            />
        );

        const titleInput = screen.getByPlaceholderText(
            "Título de la tarea"
        );

        const descriptionInput = screen.getByPlaceholderText(
            "Descripción (opcional)"
        );

        await user.type(titleInput, "Comprar ingredientes");
        await user.type(
            descriptionInput,
            "Comprar tomates y cebollas"
        );

        await user.click(screen.getByRole("button"));

        expect(titleInput).toHaveValue("");
        expect(descriptionInput).toHaveValue("");
    });

    it("llama a onEditTodo con el id y los datos modificados", async () => {
        const onEditTodo = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(
            <TodoForm
                mode="edit"
                todoId="todo-123"
                initialTitle="Tarea original"
                initialDescription="Descripción original"
                onEditTodo={onEditTodo}
            />
        );

        const titleInput = screen.getByPlaceholderText(
            "Título de la tarea"
        );

        const descriptionInput = screen.getByPlaceholderText(
            "Descripción (opcional)"
        );

        await user.clear(titleInput);
        await user.type(titleInput, "Tarea modificada");

        await user.clear(descriptionInput);
        await user.type(
            descriptionInput,
            "Descripción modificada"
        );

        await user.click(screen.getByRole("button"));

        expect(onEditTodo).toHaveBeenCalledWith(
            "todo-123",
            "Tarea modificada",
            "Descripción modificada"
        );
    });
});