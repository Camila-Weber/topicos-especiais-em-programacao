export type PasswordPolicyResult = {
  valid: boolean;
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
};

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const checks = {
    minLength: password.length >= 8,
    hasLetter: /[A-Za-zÀ-ÿ]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-zÀ-ÿ0-9]/.test(password),
  };

  return {
    valid: Object.values(checks).every(Boolean),
    checks,
  };
}
