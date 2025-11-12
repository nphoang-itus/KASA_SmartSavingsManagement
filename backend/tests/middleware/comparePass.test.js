import { comparePassword } from "../../src/middleware/comparePass.middleware.js";
import bcrypt from "bcrypt";

describe('Middleware: comparePassword', () => {
  const plainPassword = 'SecumySecurePassword123';
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(plainPassword, 10);
  });

  it('should return true for correct password and hash', async () => {
    const result = await comparePassword(plainPassword, passwordHash);
    expect(result).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const result = await comparePassword('WrongPassword', passwordHash);
    expect(result).toBe(false);
  });

  it('should throw error if plainPassword is not a string', async () => {
    await expect(comparePassword(null, passwordHash)).rejects.toThrow();
    await expect(comparePassword(undefined, passwordHash)).rejects.toThrow();
    await expect(comparePassword(12345, passwordHash)).rejects.toThrow();
  });

  it('should throw error if passwordHash is not a string', async () => {
    await expect(comparePassword(plainPassword, null)).rejects.toThrow();
    await expect(comparePassword(plainPassword, undefined)).rejects.toThrow();
    await expect(comparePassword(plainPassword, 12345)).rejects.toThrow();
  });
});