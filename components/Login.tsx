
import React, { useState, useEffect } from 'react';
import { AuthMode } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  auth: any;
}

const Login: React.FC<LoginProps> = ({ auth }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega credenciais salvas ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    const savedPassword = localStorage.getItem('remember_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const getFriendlyErrorMessage = (error: any) => {
    const code = error.code || error.message || '';
    
    if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
      return "Usuário ou senha incorretos.";
    }
    if (code.includes('auth/invalid-email')) {
      return "O e-mail digitado é inválido.";
    }
    if (code.includes('auth/email-already-in-use')) {
      return "Este e-mail já está em uso.";
    }
    if (code.includes('auth/weak-password')) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    if (code.includes('auth/network-request-failed')) {
      return "Erro de conexão. Verifique sua internet.";
    }
    
    return "Ocorreu um erro ao processar sua solicitação.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError("As senhas não coincidem.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Lógica de "Lembrar-me"
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_password', password);
      } else {
        localStorage.removeItem('remember_email');
        localStorage.removeItem('remember_password');
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-12">
          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <h1 className="text-[44px] leading-tight font-black text-[#4338CA] mb-2 tracking-tighter">
              Minha <br /> Coleção
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[2px]">Gestão Inteligente</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold mb-6 text-center border border-red-200 flex items-center justify-center gap-2 animate-in fade-in zoom-in">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest ml-1">E-mail de acesso</label>
              <input 
                type="email" 
                required 
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-800"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest ml-1">Senha pessoal</label>
              <input 
                type="password" 
                required 
                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {mode === 'login' && (
              <div className="flex items-center gap-2 ml-1 py-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-5 h-5 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="text-[12px] font-bold text-slate-600 uppercase tracking-wider cursor-pointer">Lembrar meu acesso</label>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest ml-1">Confirmar nova senha</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-800"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white font-black text-lg shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar Agora' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-slate-600 font-bold text-sm">
              {mode === 'login' ? 'Novo por aqui? ' : 'Já possui cadastro? '}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="text-[#4338CA] font-black hover:underline decoration-2"
              >
                {mode === 'login' ? 'Criar minha conta' : 'Acessar minha conta'}
              </button>
            </p>
            
            {mode === 'login' && (
              <button className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-[#4338CA] transition-colors block w-full">
                Recuperar Acesso
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
