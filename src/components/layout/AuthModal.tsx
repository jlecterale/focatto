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
  const { login, register } = useAuth();
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
