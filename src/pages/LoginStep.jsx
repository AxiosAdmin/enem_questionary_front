import { useState } from "react";
import { post } from "../helpers/FecthApi";
import { saveAuthSession } from "../helpers/auth";

const LoginStep = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await post("login", {
        email: identifier,
        nickname: identifier,
        password,
      });

      if (!response?.access_token) {
        throw new Error("A resposta do login nao contem um token.");
      }

      saveAuthSession(response);
      onLoginSuccess(response?.data || null);
    } catch (requestError) {
      setError("Nao foi possivel entrar. Verifique suas credenciais e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="screen-card fade-in login-card">
      <div className="screen-header">
        <span className="eyebrow">Etapa 0</span>
        <h1>Login</h1>
        <p>
          Entre antes de acessar as materias. Depois disso, o token sera salvo
          e enviado automaticamente nas proximas requisicoes.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email ou nickname</span>
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Digite seu email ou nickname"
            autoComplete="username"
            required
          />
        </label>

        <label className="form-field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="status-text status-text--error">{error}</p> : null}

        <button type="submit" className="primary-button login-button" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
};

export default LoginStep;
