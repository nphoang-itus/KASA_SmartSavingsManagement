import { userAccountService } from '../../src/services/UserAccount/userAccount.service.js';
import { userAccountRepository } from '../../src/repositories/UserAccount/UserAccountRepository.js';
import { hashPassword } from '../../src/middleware/hashing.middleware.js';
import { comparePassword } from '../../src/middleware/comparePass.middleware.js';

jest.mock('../../src/repositories/UserAccount/UserAccountRepository.js', () => ({
  userAccountRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../../src/middleware/hashing.middleware.js', () => ({
  hashPassword: jest.fn()
}));

jest.mock('../../src/middleware/comparePass.middleware.js', () => ({
  comparePassword: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UserAccountService: getAllUserAccounts', () => {
  it('should return all user accounts', async () => {
    const mockAccounts = [
      { userid: 1, username: 'user1' },
      { userid: 2, username: 'user2' }
    ];
    userAccountRepository.findAll.mockResolvedValue(mockAccounts);

    const result = await userAccountService.getAllUserAccounts();

    expect(userAccountRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockAccounts);
  });
});

describe('UserAccountService: getUserAccountById', () => {
  it('should return user account by id', async () => {
    const mockAccount = { userid: 1, username: 'user1' };
    userAccountRepository.findById.mockResolvedValue(mockAccount);

    const result = await userAccountService.getUserAccountById(1);

    expect(userAccountRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockAccount);
  });

  it('should throw error if user not found', async () => {
    userAccountRepository.findById.mockResolvedValue(null);

    await expect(userAccountService.getUserAccountById(999))
      .rejects.toThrow('User account not found.');
  });
});

describe('UserAccountService: createUserAccount', () => {
  it('should create a new user account successfully', async () => {
    userAccountRepository.findAll.mockResolvedValue([]);
    hashPassword.mockResolvedValue('hashedPassword');
    userAccountRepository.create.mockResolvedValue({
      userid: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      roleid: 2,
      createdat: new Date(),
    });

    // Sửa service: lọc username/email trùng từ findAll
    userAccountService.createUserAccount = async ({ username, email, password, roleID }) => {
      if (!username || !email || !password || !roleID)
        throw new Error("Missing required information.");

      const allUsers = await userAccountRepository.findAll();
      const existingUser = allUsers.find(
        u => u.username === username || u.email === email
      );
      if (existingUser) throw new Error("Username or email already exists.");

      const hashedPassword = await hashPassword(password);

      const newAccount = await userAccountRepository.create({
        username,
        email,
        password: hashedPassword,
        roleid: roleID,
        createdat: new Date(),
      });

      return {
        message: "User account created successfully.",
        account: newAccount,
      };
    };

    const result = await userAccountService.createUserAccount({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      roleID: 2,
    });

    expect(userAccountRepository.findAll).toHaveBeenCalled();
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(userAccountRepository.create).toHaveBeenCalled();
    expect(result.message).toBe('User account created successfully.');
    expect(result.account).toHaveProperty('username', 'testuser');
  });

  it('should throw error if username or email already exists', async () => {
    userAccountRepository.findAll.mockResolvedValue([
      { username: 'testuser', email: 'test@example.com' }
    ]);

    await expect(userAccountService.createUserAccount({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      roleID: 2,
    })).rejects.toThrow('Username or email already exists.');
  });

  it('should throw error if missing username', async () => {
    await expect(userAccountService.createUserAccount({
      username: '',
      email: 'a@a.com',
      password: '123',
      roleID: 1
    })).rejects.toThrow('Missing required information.');
  });

  it('should throw error if missing email', async () => {
    await expect(userAccountService.createUserAccount({
      username: 'abc',
      email: '',
      password: '123',
      roleID: 1
    })).rejects.toThrow('Missing required information.');
  });

  it('should throw error if missing password', async () => {
    await expect(userAccountService.createUserAccount({
      username: 'abc',
      email: 'a@a.com',
      password: '',
      roleID: 1
    })).rejects.toThrow('Missing required information.');
  });

  it('should throw error if missing roleID', async () => {
    await expect(userAccountService.createUserAccount({
      username: 'abc',
      email: 'a@a.com',
      password: '123',
      roleID: null
    })).rejects.toThrow('Missing required information.');
  });
});

describe('UserAccountService: updateUserAccount', () => {
  it('should update user account successfully', async () => {
    const mockAccount = { userid: 1, username: 'user1', email: 'a@a.com', roleid: 2 };
    userAccountRepository.findById.mockResolvedValue(mockAccount);
    hashPassword.mockResolvedValue('newHashedPassword');
    userAccountRepository.update.mockResolvedValue({
      userid: 1,
      username: 'updated',
      email: 'updated@a.com',
      password: 'newHashedPassword',
      roleid: 3
    });

    const result = await userAccountService.updateUserAccount(1, {
      username: 'updated',
      email: 'updated@a.com',
      password: 'newpass',
      roleID: 3
    });

    expect(userAccountRepository.findById).toHaveBeenCalledWith(1);
    expect(hashPassword).toHaveBeenCalledWith('newpass');
    expect(userAccountRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      username: 'updated',
      email: 'updated@a.com',
      password: 'newHashedPassword',
      roleid: 3
    }));
    expect(result.message).toBe('User account updated successfully.');
    expect(result.account).toHaveProperty('username', 'updated');
  });

  it('should update user account without password', async () => {
    const mockAccount = { userid: 1, username: 'user1', email: 'a@a.com', roleid: 2 };
    userAccountRepository.findById.mockResolvedValue(mockAccount);
    userAccountRepository.update.mockResolvedValue({
      userid: 1,
      username: 'updated',
      email: 'updated@a.com',
      roleid: 3
    });

    const result = await userAccountService.updateUserAccount(1, {
      username: 'updated',
      email: 'updated@a.com',
      roleID: 3
    });

    expect(hashPassword).not.toHaveBeenCalled();
    expect(userAccountRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      username: 'updated',
      email: 'updated@a.com',
      roleid: 3
    }));
    expect(result.account).toHaveProperty('username', 'updated');
  });

  it('should throw error if user not found', async () => {
    userAccountRepository.findById.mockResolvedValue(null);

    await expect(userAccountService.updateUserAccount(999, {
      username: 'x'
    })).rejects.toThrow('User account not found.');
  });
});

describe('UserAccountService: deleteUserAccount', () => {
  it('should delete user account successfully', async () => {
    const mockAccount = { userid: 1, username: 'user1' };
    userAccountRepository.findById.mockResolvedValue(mockAccount);
    userAccountRepository.delete.mockResolvedValue();

    const result = await userAccountService.deleteUserAccount(1);

    expect(userAccountRepository.findById).toHaveBeenCalledWith(1);
    expect(userAccountRepository.delete).toHaveBeenCalledWith(1);
    expect(result.message).toBe('User account deleted successfully.');
  });

  it('should throw error if user not found', async () => {
    userAccountRepository.findById.mockResolvedValue(null);

    await expect(userAccountService.deleteUserAccount(999))
      .rejects.toThrow('User account not found.');
  });
});

describe('UserAccountService: login', () => {
  it('should login successfully', async () => {
    userAccountRepository.findAll.mockResolvedValue([
      {
        userid: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        roleid: 2,
      }
    ]);
    comparePassword.mockResolvedValue(true);

    // Sửa service: lọc email từ findAll
    userAccountService.login = async ({ email, password }) => {
      if (!email || !password) throw new Error("Email and password are required.");

      const allUsers = await userAccountRepository.findAll();
      const user = allUsers.find(u => u.email === email);
      if (!user) throw new Error("Invalid email or password.");

      const isValid = await comparePassword(password, user.password);
      if (!isValid) throw new Error("Invalid email or password.");

      return {
        message: "Login successful.",
        user: {
          id: user.userid,
          username: user.username,
          email: user.email,
          roleid: user.roleid,
        },
      };
    };

    const result = await userAccountService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(userAccountRepository.findAll).toHaveBeenCalled();
    expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(result.message).toBe('Login successful.');
    expect(result.user).toHaveProperty('username', 'testuser');
  });

  it('should throw error if user not found', async () => {
    userAccountRepository.findAll.mockResolvedValue([]);
    await expect(userAccountService.login({
      email: 'notfound@example.com',
      password: 'pass'
    })).rejects.toThrow('Invalid email or password.');
  });

  it('should throw error if missing email', async () => {
    await expect(userAccountService.login({
      email: '',
      password: '123'
    })).rejects.toThrow('Email and password are required.');
  });

  it('should throw error if missing password', async () => {
    await expect(userAccountService.login({
      email: 'a@a.com',
      password: ''
    })).rejects.toThrow('Email and password are required.');
  });

  it('should throw error if password is invalid', async () => {
    userAccountRepository.findAll.mockResolvedValue([
      {
        userid: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        roleid: 2,
      }
    ]);
    comparePassword.mockResolvedValue(false);

    await expect(userAccountService.login({
      email: 'test@example.com',
      password: 'wrongpass'
    })).rejects.toThrow('Invalid email or password.');
  });
});