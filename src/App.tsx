import { AuthProvider } from "./context/authContext";


function App() {
  return (
    <AuthProvider>
      <main>
        <h1>MateCode</h1>
        <p>Gestión de tareas para pequeñas empresas</p>
      </main>
    </AuthProvider>
  )
}

export default App
