import { describe, expect, it, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
}));

vi.mock("../services/firebase", () => ({
    db: {},
}));

import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

import { subscribeToTodos } from "../services/todoService";

describe("subscribeToTodos", () => {
    it("consulta las tareas del usuario indicado y devuelve los datos", () => {
        const onTodosChange = vi.fn();
        const unsubscribe = vi.fn();

        const snapshot = {
            docs: [
                {
                    id: "todo-1",
                    data: () => ({
                        title: "Comprar ingredientes",
                        description: "Tomates y cebollas",
                        completed: false,
                        userId: "user-123",
                    }),
                },
            ],
        };

        vi.mocked(collection).mockReturnValue(
            "todos-reference" as never
        );

        vi.mocked(where).mockReturnValue(
            "user-filter" as never
        );

        vi.mocked(query).mockReturnValue(
            "todos-query" as never
        );

        vi.mocked(onSnapshot).mockImplementation(
            (...args) => {
                const callback = args.find(
                    (arg) => typeof arg === "function"
                );

                if (callback) {
                    callback(snapshot as never);
                }

                return unsubscribe;
            }
        );
        const result = subscribeToTodos(
            "user-123",
            onTodosChange
        );

        expect(collection).toHaveBeenCalledWith(
            expect.anything(),
            "todos"
        );

        expect(where).toHaveBeenCalledWith(
            "userId",
            "==",
            "user-123"
        );

        expect(query).toHaveBeenCalledWith(
            "todos-reference",
            "user-filter"
        );

        expect(onTodosChange).toHaveBeenCalledWith([
            {
                id: "todo-1",
                title: "Comprar ingredientes",
                description: "Tomates y cebollas",
                completed: false,
                userId: "user-123",
            },
        ]);

        expect(result).toBe(unsubscribe);
    });
});
