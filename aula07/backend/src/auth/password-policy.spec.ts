import { validatePasswordPolicy } from './password-policy';

describe('validatePasswordPolicy', () => {
  it.each(['12345678', 'abcdefgh', 'senha123', 'Senha123'])(
    'rejects weak password %s',
    (password) => {
      expect(validatePasswordPolicy(password).valid).toBe(false);
    },
  );

  it('accepts a password with length, letter, number and special character', () => {
    expect(validatePasswordPolicy('Ditado@2026').valid).toBe(true);
  });
});
