"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Envelope, Lock, Eye, EyeSlash, GoogleLogo, AppleLogo, Spinner, User } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { isIosApp } from "../lib/native";

type Mode = "login" | "register" | "forgot";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginWithGoogle, loginWithApple, register, resetPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  // Exigência da App Store (guideline 4.8): apps iOS que oferecem login de
  // terceiros (Google) devem oferecer também o Sign in with Apple.
  const [showAppleLogin, setShowAppleLogin] = useState(false);

  useEffect(() => {
    setShowAppleLogin(isIosApp());
  }, []);
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
      router.push("/profile");
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
      const isNew = await loginWithGoogle();
      toast.success(isNew ? "Conta criada com sucesso!" : "Login com Google realizado!");
      onClose();
      if (isNew) {
        router.push("/profile");
      }
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Erro ao autenticar com Google.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleLogin() {
    setLoading(true);
    try {
      const isNew = await loginWithApple();
      toast.success(isNew ? "Conta criada com sucesso!" : "Login com Apple realizado!");
      onClose();
      if (isNew) {
        router.push("/profile");
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const cancelled =
        error.code === "auth/popup-closed-by-user" ||
        /cancell?ed|1001/i.test(error.message || "");
      if (!cancelled) {
        toast.error("Erro ao autenticar com Apple.");
      }
    } finally {
      setLoading(false);
    }
  }

  const appleLoginButton = (idSuffix: string) =>
    showAppleLogin ? (
      <button
        type="button"
        id={`apple-${idSuffix}-btn`}
        onClick={handleAppleLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-black border border-[#2a2827] text-white font-semibold text-sm transition-all duration-200 hover:bg-[#181615] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <AppleLogo size={18} weight="fill" />
        {idSuffix === "login" ? "Entrar com Apple" : "Cadastrar com Apple"}
      </button>
    ) : null;

  if (!isOpen) return null;

  const inputClasses =
    "w-full bg-[#181615] border border-[#2a2827] rounded-xl px-4 py-3 text-sm text-white placeholder-surface-400 outline-none transition-all duration-200 focus:border-[#ef7c2c] focus:shadow-[0_0_0_3px_rgba(239,124,44,0.1)]";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-3 sm:p-4"
    >
      <div className="w-full max-w-[90vw] sm:max-w-[420px] bg-[#0c0a09] border border-[#2a2827] rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-white font-heading">
            {mode === "login" && "Entrar"}
            {mode === "register" && "Criar Conta"}
            {mode === "forgot" && "Redefinir Senha"}
          </h2>
          <button
            onClick={onClose}
            id="close-login-modal-btn"
            aria-label="Fechar modal de autenticação"
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
                  id="login-email-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  aria-label="Endereço de e-mail"
                  autoFocus
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password-input"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                  aria-label="Senha"
                />
                <button
                  type="button"
                  id="login-toggle-password-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="button"
                id="login-forgot-password-btn"
                onClick={() => setMode("forgot")}
                className="self-end text-xs text-surface-400 hover:text-[#ef7c2c] transition-colors -mt-1"
              >
                Esqueci a senha
              </button>

              <button
                type="submit"
                id="login-submit-btn"
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
                id="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GoogleLogo size={18} />
                Entrar com Google
              </button>

              {appleLoginButton("login")}

              <p className="text-xs text-surface-400 text-center mt-1">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  id="toggle-to-register-btn"
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
                  id="register-name-input"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  aria-label="Nome completo"
                  autoFocus
                />
              </div>
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  id="register-email-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  aria-label="Endereço de e-mail"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password-input"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                  aria-label="Senha"
                />
                <button
                  type="button"
                  id="register-toggle-password-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="register-confirm-password-input"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClasses} pl-10 pr-10`}
                  aria-label="Confirmar senha"
                />
                <button
                  type="button"
                  id="register-toggle-confirm-password-btn"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                id="register-submit-btn"
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
                id="google-register-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GoogleLogo size={18} />
                Cadastrar com Google
              </button>

              {appleLoginButton("register")}

              <p className="text-xs text-surface-400 text-center mt-1">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  id="toggle-to-login-btn"
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
                  id="forgot-email-input"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  aria-label="Seu endereço de e-mail"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                id="forgot-submit-btn"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ef7c2c] to-[#d4ae12] text-white font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(239,124,44,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size={16} className="animate-spin" /> : null}
                Enviar Link
              </button>

              <button
                type="button"
                id="forgot-back-to-login-btn"
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
