import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth();

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
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const errors = validateRegister(form);

        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors)[0]);
            return;
        }

        setLoading(true);

        try {
            await register(form.email, form.password);
            navigate("/dashboard");
        }
        catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error desconocido al registrarse.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Crear cuenta</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">
                        Confirmar contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrarse"}
                </button>
            </form>
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
        errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return errors;
}

export default Register;