export const hasStrongPasswordRequirements = (password) => {
  if (!password) {
    return false;
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  return (
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter
  );
};

export const getPasswordValidationMessage = (password) => {
  if (!password) {
    return "";
  }

  if (!hasStrongPasswordRequirements(password)) {
    return "A senha deve ter pelo menos 8 caracteres e incluir uma letra maiuscula, uma minuscula, um numero e um caractere especial.";
  }

  return "";
};
