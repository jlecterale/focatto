"use client";

import { useState, useEffect, useRef } from "react";
import { X, Envelope, Lock, Eye, EyeSlash, GoogleLogo, Spinner, User } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

type Mode = "login" | "register" | "forgot";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginWithGoogle, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode("login");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setLoading(false);
      }, 200);
    }
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Login realizado com sucesso!");
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: string };
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Email ou senha inválidos.",
        "auth/invalid-email": "Email inválido.",
        "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
      };
      toast.error(messages[error.code ?? ""] || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Conta criada com sucesso!");
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: string };
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "Este email já está em uso.",
        "auth/invalid-email": "Email inválido.",
        "auth/weak-password": "Senha muito fraca.",
      };
      toast.error(messages[error.code ?? ""] || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Digite seu email.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      toast.success("Link de redefinição enviado! Verifique seu email.");
      setMode("login");
    } catch (err: unknown) {
      const error = err as { code?: string };
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/invalid-email": "Email inválido.",
      };
      toast.error(messages[error.code ?? ""] || "Erro ao enviar email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Login com Google realizado!");
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Erro ao autenticar com Google.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const inputClasses =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4"
    >
      <div className="w-full max-w-[420px] bg-[#0c0a09] border border-[#2a2827] rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-white font-heading">
            {mode === "login" && "Entrar"}
            {mode === "register" && "Criar Conta"}
            {mode === "forgot" && "Redefinir Senha"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-[#181615] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  autoFocus
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="self-end text-xs text-surface-400 hover:text-[#ef7c2c] transition-colors -mt-1"
              >
                Esqueci a senha
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={16} className="animate-spin" /> : null}
                Entrar
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#2a2827]" />
                <span className="text-xs text-surface-400">ou</span>
                <div className="flex-1 h-px bg-[#2a2827]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GoogleLogo size={18} />
                Entrar com Google
              </button>

              <p className="text-xs text-surface-400 text-center mt-1">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#ef7c2c] hover:underline font-medium"
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {/* Register */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  autoFocus
                />
              </div>
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={16} className="animate-spin" /> : null}
                Criar Conta
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#2a2827]" />
                <span className="text-xs text-surface-400">ou</span>
                <div className="flex-1 h-px bg-[#2a2827]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GoogleLogo size={18} />
                Cadastrar com Google
              </button>

              <p className="text-xs text-surface-400 text-center mt-1">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#ef7c2c] hover:underline font-medium"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <p className="text-xs text-surface-400 leading-relaxed">
                Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
              </p>
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={16} className="animate-spin" /> : null}
                Enviar Link
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-surface-400 hover:text-[#ef7c2c] transition-colors text-center"
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
