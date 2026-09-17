import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../services/firebase";
import type { User } from "firebase/auth";
import type { AuthContextType } from "../types/auth";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

s
export const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    //  Observador de sesión (Persistencia)
    useEffect(() => {
        //onAuthStateChanged se conecta a Firebase y escucha si hay un usuario logueado
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Si hay usuario lo guarda, si no, guarda null
            setLoading(false);    // Como Firebase ya respondió, apagamos el estado de carga
        });

        // Limpieza: si la app se cierra o el componente se desmonta, siempre se cierra.
        return () => unsubscribe();
    }, []); // [] significa: "ejecutá esto una sola vez cuando la app arranca"

    // nuevo usuario
    async function register(email: string, password: string) {
        await createUserWithEmailAndPassword(auth, email, password);
    }

    // usuario existente
    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    // login con google
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }

    // cerrar sesión
    async function logout() {
        await signOut(auth);
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
                loginWithGoogle,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
