"use client";

/**
 * Hook utilitário para verificação de força de senha
 */
export const usePasswordStrength = (password: string) => {
  const calculateStrength = (): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthLabel = (): { text: string; color: string; bg: string } => {
    const strength = calculateStrength();
    if (strength <= 2) return { text: "Fraca", color: "text-red-500", bg: "bg-red-500" };
    if (strength <= 3) return { text: "Média", color: "text-orange-500", bg: "bg-orange-500" };
    if (strength <= 4) return { text: "Forte", color: "text-blue-500", bg: "bg-blue-500" };
    return { text: "Muito Forte", color: "text-green-500", bg: "bg-green-500" };
  };

  const isValid = (): boolean => {
    return password.length >= 6;
  };

  const strength = calculateStrength();
  const strengthInfo = getStrengthLabel();

  return {
    strength,
    strengthInfo,
    isValid,
    calculateStrength,
    getStrengthLabel,
  };
};