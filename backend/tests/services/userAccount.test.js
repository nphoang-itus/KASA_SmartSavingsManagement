import { userAccountService } from "../../src/services/UserAccount/userAccount.service";
import { userAccountRepository } from '../../src/repositories/UserAccount/UserAccountRepository.js';
import { hashPassword } from '../../src/middleware/hashing.middleware.js';
import { comparePassword } from '../../src/middleware/comparePass.middleware.js';

jest.mock('../../src/repositories/UserAccount/UserAccountRepository.js');
jest.mock('../../src/middleware/hashing.middleware.js');
jest.mock('../../src/middleware/comparePass.middleware.js');

describe('Service: UserAccount', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUserAccounts', () => {
    it('should return all user accounts', async () => {
      const mockAccounts = [{ userid: 1 }, { userid: 2 }];
      userAccountRepository.findAll.mockResolvedValue(mockAccounts);

      const result = await userAccountService.getAllUserAccounts();
      expect(result).toEqual(mockAccounts);
      expect(userAccountRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserAccountById', () => {
    it('should return user account by id', async () => {
      const mockAccount = { userid: 1 };
      userAccountRepository.findById.mockResolvedValue(mockAccount);

      const result = await userAccountService.getUserAccountById(1);
      expect(result).toEqual(mockAccount);
      expect(userAccountRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error if user not found', async () => {
      userAccountRepository.findById.mockResolvedValue(null);

      await expect(userAccountService.getUserAccountById(1)).rejects.toThrow("User account not found.");
    });
  });

  describe('createUserAccount', () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      roleID: 2,
    };

    it('should throw error if missing required information', async () => {
      await expect(userAccountService.createUserAccount({})).rejects.toThrow("Missing required information.");
    });

    it('should throw error if username or email already exists', async () => {
      userAccountRepository.findByUsernameOrEmail.mockResolvedValue({ userid: 1 });

      await expect(userAccountService.createUserAccount(userData)).rejects.toThrow("Username or email already exists.");
    });

    it('should create user account successfully', async () => {
      userAccountRepository.findByUsernameOrEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashedPassword");
      const mockAccount = { userid: 1, ...userData, password: "hashedPassword" };
      userAccountRepository.create.mockResolvedValue(mockAccount);

      const result = await userAccountService.createUserAccount(userData);

      expect(hashPassword).toHaveBeenCalledWith(userData.password);
      expect(userAccountRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        username: userData.username,
        email: userData.email,
        password: "hashedPassword",
        roleid: userData.roleID,
      }));
      expect(result).toEqual({
        message: "User account created successfully.",
        account: mockAccount,
      });
    });
  });

  describe('updateUserAccount', () => {
    const updates = {
      username: "newuser",
      email: "new@example.com",
      password: "newpassword",
      roleID: 3,
    };

    it('should throw error if user not found', async () => {
      userAccountRepository.findById.mockResolvedValue(null);

      await expect(userAccountService.updateUserAccount(1, updates)).rejects.toThrow("User account not found.");
    });

    it('should update user account without password', async () => {
      const existingAccount = { userid: 1 };
      userAccountRepository.findById.mockResolvedValue(existingAccount);
      userAccountRepository.update.mockResolvedValue({ ...existingAccount, ...updates });

      const result = await userAccountService.updateUserAccount(1, { ...updates, password: undefined });

      expect(userAccountRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        username: updates.username,
        email: updates.email,
        roleid: updates.roleID,
      }));
      expect(result).toEqual({
        message: "User account updated successfully.",
        account: { ...existingAccount, ...updates },
      });
    });

    it('should update user account with new password', async () => {
      const existingAccount = { userid: 1 };
      userAccountRepository.findById.mockResolvedValue(existingAccount);
      hashPassword.mockResolvedValue("hashedNewPassword");
      userAccountRepository.update.mockResolvedValue({ ...existingAccount, ...updates, password: "hashedNewPassword" });

      const result = await userAccountService.updateUserAccount(1, updates);

      expect(hashPassword).toHaveBeenCalledWith(updates.password);
      expect(userAccountRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        password: "hashedNewPassword",
      }));
      expect(result).toEqual({
        message: "User account updated successfully.",
        account: { ...existingAccount, ...updates, password: "hashedNewPassword" },
      });
    });
  });

  describe('deleteUserAccount', () => {
    it('should throw error if user not found', async () => {
      userAccountRepository.findById.mockResolvedValue(null);

      await expect(userAccountService.deleteUserAccount(1)).rejects.toThrow("User account not found.");
    });

    it('should delete user account successfully', async () => {
      userAccountRepository.findById.mockResolvedValue({ userid: 1 });
      userAccountRepository.delete.mockResolvedValue();

      const result = await userAccountService.deleteUserAccount(1);

      expect(userAccountRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "User account deleted successfully." });
    });
  });

  describe('login', () => {
    const loginData = { email: "test@example.com", password: "password123" };

    it('should throw error if missing email or password', async () => {
      await expect(userAccountService.login({ email: "", password: "" })).rejects.toThrow("Email and password are required.");
    });

    it('should throw error if user not found', async () => {
      userAccountRepository.findByEmail.mockResolvedValue(null);

      await expect(userAccountService.login(loginData)).rejects.toThrow("Invalid email or password.");
    });

    it('should throw error if password is invalid', async () => {
      userAccountRepository.findByEmail.mockResolvedValue({ userid: 1, password: "hashedPassword" });
      comparePassword.mockResolvedValue(false);

      await expect(userAccountService.login(loginData)).rejects.toThrow("Invalid email or password.");
    });

    it('should login successfully', async () => {
      const user = {
        userid: 1,
        username: "testuser",
        email: loginData.email,
        password: "hashedPassword",
        roleid: 2,
      };
      userAccountRepository.findByEmail.mockResolvedValue(user);
      comparePassword.mockResolvedValue(true);

      const result = await userAccountService.login(loginData);

      expect(comparePassword).toHaveBeenCalledWith(loginData.password, user.password);
      expect(result).toEqual({
        message: "Login successful.",
        user: {
          id: user.userid,
          username: user.username,
          email: user.email,
          roleid: user.roleid,
        },
      });
    });
  });
});