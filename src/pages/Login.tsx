import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LoginForm {
    email: string;
    password: string;
}

const initialLoginForm: LoginForm = {
    email: "",
    password: "",
};

function validateLogin(form: LoginForm) {
    const errors: Partial<Record<keyof LoginForm, string>> = {};

    if (
        !form.email.trim() ||
        !form.email.includes("@") ||
        !form.email.includes(".")
    ) {
        errors.email = "Ingresá un email válido.";
    }

    if (!form.password.trim() || form.password.length < 6) {
        errors.password =
            "La contraseña debe tener al menos 6 caracteres.";
    }

    return errors;
}

export const Login = () => {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>(initialLoginForm);
    const [error, setError] = useState<Partial<Record<keyof LoginForm, string>>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };



    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const validationErrors = validateLogin(form);

        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }

        setError({});
        setLoading(true);

        try {
            await login(form.email, form.password);
            navigate("/dashboard");
        } catch (error) {
            setError({
                email: "No se pudo iniciar sesión. Revisá tus credenciales.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    {error.email && (
                        <p>{error.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password">
                        Contraseña
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    {error.password && (
                        <p>{error.password}</p>
                    )}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>

            </form>
        </div>
    );
}

export default Login;
