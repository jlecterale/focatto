"use client";

import { useState } from "react";
import { EnvelopeSimple, Lock, User, Eye, EyeSlash } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onToggle: () => void;
}

export function AuthModal({ mode, onClose, onToggle }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Bem-vindo de volta!");
      } else {
        if (!name.trim()) { toast.error("Informe seu nome"); setLoading(false); return; }
        await register(name, email, password);
        toast.success("Conta criada com sucesso!");
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password"
          ? "Email ou senha incorretos"
          : err?.code === "auth/email-already-in-use"
          ? "Este email já está cadastrado"
          : err?.code === "auth/weak-password"
          ? "Senha deve ter no mínimo 6 caracteres"
          : "Erro ao autenticar. Tente novamente.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Bem-vindo ao Focatto!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao autenticar com o Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-gold-500 flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <h2 className="text-xl font-bold">
          {mode === "login" ? "Entrar no Focatto" : "Criar Conta"}
        </h2>
        <p className="text-sm text-surface-400 mt-1">
          {mode === "login"
            ? "Acesse sua conta para comprar e vender"
            : "Junte-se à maior comunidade de música do Brasil"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <Input
            label="Nome"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={16} />}
          />
        )}
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<EnvelopeSimple size={16} />}
          required
        />
        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-200"
          >
            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Button type="submit" className="w-full mt-2" loading={loading}>
          {mode === "login" ? "Entrar" : "Criar Conta"}
        </Button>
      </form>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-800"></div>
        </div>
        <span className="relative px-3 text-xs text-surface-400 bg-surface-900">OU CONTINUE COM</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleLogin}
        loading={loading}
      >
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </Button>

      <div className="mt-4 text-center text-sm text-surface-400">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <button onClick={onToggle} className="text-accent hover:underline font-medium">
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button onClick={onToggle} className="text-accent hover:underline font-medium">
              Fazer login
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
