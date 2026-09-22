import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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
    const [error, setError] =
        useState<Partial<Record<keyof LoginForm, string>>>({});
    const [googleError, setGoogleError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));

        setGoogleError("");
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const validationErrors = validateLogin(form);

        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }

        setError({});
        setGoogleError("");
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

    const handleGoogleLogin = async () => {
        setError({});
        setGoogleError("");
        setLoading(true);

        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (error) {
            setGoogleError(
                "No se pudo iniciar sesión con Google. Intentá nuevamente.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">
                    Iniciar sesión
                </h1>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            className="login-input"
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        {error.email && (
                            <p className="login-error">
                                {error.email}
                            </p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <input
                            className="login-input"
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                        />

                        {error.password && (
                            <p className="login-error">
                                {error.password}
                            </p>
                        )}
                    </div>

                    <button
                        className="login-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"}
                    </button>

                    <div className="login-divider">
                        <span>o</span>
                    </div>

                    <button
                        className="login-google"
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg
                            className="google-icon"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fill="#4285F4"
                                d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M6.54 13.59a5.85 5.85 0 0 1 0-3.18V7.88H3.3a9.5 9.5 0 0 0 0 8.24l3.24-2.53Z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
                            />
                        </svg>

                        Continuar con Google
                    </button>

                    {googleError && (
                        <p className="login-error login-google-error">
                            {googleError}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;