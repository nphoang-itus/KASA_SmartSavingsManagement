import { hashPassword } from "../../src/middleware/hashing.middleware.js";
import bcrypt from "bcrypt";

describe('Middleware: hashPassword', () => {
  const plainPassword = 'SecumySecurePassword123';

  it('should hash the password correctly', async () => {
    const hashed = await hashPassword(plainPassword);
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(plainPassword);
    // Kiểm tra hash có hợp lệ với bcrypt
    const isMatch = await bcrypt.compare(plainPassword, hashed);
    expect(isMatch).toBe(true);
  });

  it('should produce different hashes for the same password', async () => {
    const hash1 = await hashPassword(plainPassword);
    const hash2 = await hashPassword(plainPassword);
    expect(hash1).not.toBe(hash2);
  });

  it('should throw error if password is empty', async () => {
    await expect(hashPassword('')).rejects.toThrow();
  });

  it('should throw error if password is not a string', async () => {
    await expect(hashPassword(null)).rejects.toThrow();
    await expect(hashPassword(undefined)).rejects.toThrow();
    await expect(hashPassword(12345)).rejects.toThrow();
  });
});