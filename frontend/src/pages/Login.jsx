import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Para redireccionar
import { useAuth } from '../context/AuthContext'; // Importamos el hook del contexto
import api from '../services/api';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hooks
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate(); // Hook de navegación
  const { login } = useAuth(); // Hook de autenticación (Contexto)

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);

      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;

      // 1. Usamos la función login del contexto (actualiza estado global)
      await login(access_token);

      // 2. Redirigimos al Dashboard
      // alert(`Login realizado com sucesso!`);
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data.detail === "Credenciales incorrectas" ? "Credenciais inválidas" : err.response.data.detail);
      } else {
        setError("Erro de conexão ou dados inválidos (422)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Encabezado con Logo */}
        <div className="bg-space-orange/10 p-8 text-center">
          <img
            src="https://www.spacerh.com.br/ws/media-library/28076a3924164c9b9313f5d88d389e6b/wwwwwww.png"
            alt="Space Logo"
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo à SPACE</h2>
          <p className="text-gray-500 text-sm mt-2">Faça login para gerenciar sua conta</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Mensaje de Error (si existe) */}
            {error && (
              <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                <span className="font-medium">Erro:</span>&nbsp;{error}
              </div>
            )}

            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-space-orange focus:border-space-orange transition-colors`}
                  placeholder="exemplo@empresa.com"
                  {...register("email", { required: "O e-mail é obrigatório" })}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"} // Cambia dinámicamente el tipo
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-space-orange focus:border-space-orange transition-colors`}
                  placeholder="••••••••"
                  {...register("password", { required: "A senha é obrigatória" })}
                />

                {/* Botón para ver/ocultar password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-space-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  Verificando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <a href="#" className="font-medium text-space-orange hover:text-orange-700">
              {/* Esqueceu sua senha? */}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}