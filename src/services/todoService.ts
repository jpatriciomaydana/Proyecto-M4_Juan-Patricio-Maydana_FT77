import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
}

export const subscribeToTodos = (
  userId: string,
  onTodosChange: (todos: Todo[]) => void
) => {
  const todosRef = collection(db, "todos");

  const q = query(
    todosRef,
    where("userId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const todos: Todo[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Todo[];

    onTodosChange(todos);
  });

  return unsubscribe;
};