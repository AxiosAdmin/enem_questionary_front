import { useState } from "react";
import { post } from "../helpers/FecthApi";
import { getPasswordValidationMessage } from "../helpers/passwordValidation";

const Register = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    nickname: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordValidationMessage = getPasswordValidationMessage(formData.password);

  const handleChange = (fieldName) => (event) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (passwordValidationMessage) {
      setError(passwordValidationMessage);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await post("register", formData);
      setSuccessMessage("Cadastro realizado com sucesso. Faca login para continuar.");
      setFormData({
        name: "",
        email: "",
        cpf: "",
        nickname: "",
        password: "",
      });
    } catch (requestError) {
      setError("Nao foi possivel criar sua conta. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in login-card">
        <div className="screen-header">
          <h1>Cadastro</h1>
          <p>
            Crie sua conta para acessar as materias, topicos e gerar questoes
            personalizadas.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nome</span>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Digite seu nome completo"
              autoComplete="name"
              required
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Digite seu email"
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span>CPF</span>
            <input
              type="text"
              value={formData.cpf}
              onChange={handleChange("cpf")}
              placeholder="Digite seu CPF"
              autoComplete="off"
              required
            />
          </label>

          <label className="form-field">
            <span>Nickname</span>
            <input
              type="text"
              value={formData.nickname}
              onChange={handleChange("nickname")}
              placeholder="Escolha um nickname"
              autoComplete="username"
              required
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Crie uma senha"
              autoComplete="new-password"
              required
            />
          </label>

          {error ? <p className="status-text status-text--error">{error}</p> : null}
          {successMessage ? <p className="status-text status-text--success">{successMessage}</p> : null}

          <button
            type="submit"
            className="primary-button login-button"
            disabled={isLoading}
          >
            {isLoading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <div className="auth-switch">
          <span>Ja tem uma conta?</span>
          <button
            type="button"
            className="secondary-button"
            onClick={onNavigateToLogin}
          >
            Voltar para login
          </button>
        </div>
      </section>
    </main>
  );
};

export default Register;
