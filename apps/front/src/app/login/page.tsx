"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@apollo/client/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SIGN_IN } from "@/graphql/mutations/auth";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface SignInData {
  signIn: {
    accessToken: string;
    user: User;
  };
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const router = useRouter();

  const [signIn, { loading, error }] = useMutation<SignInData>(SIGN_IN);

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
        router.replace("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-red-950 opacity-80" />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-16">
              <Image
                src="/logo.png"
                alt="Tunealo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-white">Bienvenido de nuevo</h2>
          <p className="text-gray-400 text-center mb-8">Ingresa a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                placeholder="ejemplo@tunealo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                Credenciales incorrectas. Intenta nuevamente.
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-red-600 text-white font-bold py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => router.push('/register')}
              className="text-primary hover:text-red-400 font-semibold hover:underline"
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}