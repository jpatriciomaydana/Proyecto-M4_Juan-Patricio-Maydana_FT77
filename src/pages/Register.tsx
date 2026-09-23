import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Register.css";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const initialRegisterForm: RegisterForm = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export function Register() {
    const [form, setForm] = useState(initialRegisterForm);
    const [error, setError] = useState("");
    const [googleError, setGoogleError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { register, loginWithGoogle } = useAuth();

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }

        if (googleError) {
            setGoogleError("");
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setError("");
        setGoogleError("");

        const errors = validateRegister(form);

        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors)[0]);
            return;
        }

        setLoading(true);

        try {
            await register(
                form.name,
                form.email,
                form.password,
            );

            navigate("/dashboard");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error desconocido al registrarse.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError("");
        setGoogleError("");
        setLoading(true);

        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch {
            setGoogleError(
                "No se pudo crear la cuenta con Google. Intentá nuevamente.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">
            <div className="register-card">
                <h1 className="register-title">
                    Crear cuenta
                </h1>

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >
                    <div className="register-field">
                        <label htmlFor="name">
                            Nombre
                        </label>

                        <input
                            className="register-input"
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            className="register-input"
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <input
                            className="register-input"
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="confirmPassword">
                            Confirmar contraseña
                        </label>

                        <input
                            className="register-input"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <p className="register-error">
                            {error}
                        </p>
                    )}

                    <button
                        className="register-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Registrando..."
                            : "Registrarse"}
                    </button>

                    <div className="register-divider">
                        <span>o</span>
                    </div>

                    <button
                        className="register-google"
                        type="button"
                        onClick={handleGoogleRegister}
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
                        <p className="register-error register-google-error">
                            {googleError}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}

function validateRegister(form: RegisterForm) {
    const errors: Partial<Record<keyof RegisterForm, string>> = {};

    if (!form.name.trim()) {
        errors.name = "El nombre es obligatorio.";
    }

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

    if (form.password !== form.confirmPassword) {
        errors.confirmPassword =
            "Las contraseñas no coinciden.";
    }

    return errors;
}

export default Register;