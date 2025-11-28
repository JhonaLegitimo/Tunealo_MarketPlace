"use client"; // para asegurarnos de que se ejecute en el cliente

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useAuth } from "@/context/AuthContext";
import { useMutation }from "@apollo/client/react";
// Definir la mutación de GraphQL para login

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(signInInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const router = useRouter();

  const [signIn, { loading, error }] = useMutation(SIGN_IN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await signIn({
        variables: {
          email: form.email,
          password: form.password,
        },
      });

      if (data?.signIn?.accessToken) {
  login(data.signIn.accessToken, data.signIn.user);
  alert(`Bienvenido ${data.signIn.user.name}`);
  router.replace("/home"); // o donde quieras redirigir
  }
    } catch (error) {
      alert("Credenciales incorrectas");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        <label className="block mb-4">
          <span className="text-gray-700">Correo</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>

        {error && (
          <p className="text-red-500 text-center mt-4">
            Error: {error.message}
          </p>
        )}
      </form>
    </div>
  );
}