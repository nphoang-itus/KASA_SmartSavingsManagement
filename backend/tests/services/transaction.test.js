import { transactionService } from "../../src/services/Transaction/transaction.service.js";
import { transactionRepository } from "../../src/repositories/Transaction/TransactionRepository.js";
import { savingBookRepository } from "../../src/repositories/SavingBook/SavingBookRepository.js";

jest.mock("../../src/repositories/Transaction/TransactionRepository.js", () => ({
  transactionRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../src/repositories/SavingBook/SavingBookRepository.js", () => ({
  savingBookRepository: {
    findById: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TransactionService: addTransaction", () => {
  it("should create a new transaction successfully", async () => {
    const mockBook = { id: 1, currentbalance: 1000 };
    const mockTransaction = {
      id: 1,
      bookid: 1,
      amount: 500,
      transactiontype: "Deposit",
      tellerid: 2,
    };

    savingBookRepository.findById.mockResolvedValue(mockBook);
    transactionRepository.create.mockResolvedValue(mockTransaction);

    const result = await transactionService.addTransaction({
      bookID: 1,
      amount: 500,
      type: "Deposit",
      tellerid: 2,
    });

    expect(savingBookRepository.findById).toHaveBeenCalledWith(1);
    expect(transactionRepository.create).toHaveBeenCalledWith({
      bookid: 1,
      amount: 500,
      transactiontype: "Deposit",
      note: "",
      tellerid: 2,
    });
    expect(result.message).toBe("Transaction added successfully.");
    expect(result.transaction).toEqual(mockTransaction);
  });

  it("should throw error if required fields are missing", async () => {
    await expect(
      transactionService.addTransaction({
        bookID: 1,
        amount: 500,
        type: "",
        tellerid: 2,
      })
    ).rejects.toThrow("Missing required information.");
  });

  it("should throw error if saving book does not exist", async () => {
    savingBookRepository.findById.mockResolvedValue(null);

    await expect(
      transactionService.addTransaction({
        bookID: 999,
        amount: 500,
        type: "Deposit",
        tellerid: 2,
      })
    ).rejects.toThrow("Account not found.");
  });
});

describe("TransactionService: getAllTransactions", () => {
  it("should return all transactions", async () => {
    const mockTransactions = [
      { id: 1, bookid: 1, amount: 500, transactiontype: "Deposit" },
      { id: 2, bookid: 2, amount: 300, transactiontype: "Withdraw" },
    ];
    transactionRepository.findAll.mockResolvedValue(mockTransactions);

    const result = await transactionService.getAllTransactions();

    expect(transactionRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockTransactions);
  });
});

describe("TransactionService: getTransactionById", () => {
  it("should return a transaction by id", async () => {
    const mockTransaction = {
      id: 1,
      bookid: 1,
      amount: 500,
      transactiontype: "Deposit",
    };
    transactionRepository.findById.mockResolvedValue(mockTransaction);

    const result = await transactionService.getTransactionById(1);

    expect(transactionRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockTransaction);
  });

  it("should throw error if transaction does not exist", async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(transactionService.getTransactionById(999)).rejects.toThrow(
      "Transaction not found."
    );
  });
});

describe("TransactionService: updateTransaction", () => {
  it("should update a transaction successfully", async () => {
    const mockTransaction = {
      id: 1,
      bookid: 1,
      amount: 500,
      transactiontype: "Deposit",
    };
    const mockUpdatedTransaction = {
      id: 1,
      bookid: 1,
      amount: 700,
      transactiontype: "Deposit",
    };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    transactionRepository.update.mockResolvedValue(mockUpdatedTransaction);

    const result = await transactionService.updateTransaction(1, {
      amount: 700,
    });

    expect(transactionRepository.findById).toHaveBeenCalledWith(1);
    expect(transactionRepository.update).toHaveBeenCalledWith(1, {
      amount: 700,
    });
    expect(result.message).toBe("Transaction updated successfully.");
    expect(result.transaction).toEqual(mockUpdatedTransaction);
  });

  it("should throw error if transaction does not exist", async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(
      transactionService.updateTransaction(999, { amount: 700 })
    ).rejects.toThrow("Transaction not found.");
  });
});

describe("TransactionService: deleteTransaction", () => {
  it("should delete a transaction successfully", async () => {
    const mockTransaction = {
      id: 1,
      bookid: 1,
      amount: 500,
      transactiontype: "Deposit",
    };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    transactionRepository.delete.mockResolvedValue();

    const result = await transactionService.deleteTransaction(1);

    expect(transactionRepository.findById).toHaveBeenCalledWith(1);
    expect(transactionRepository.delete).toHaveBeenCalledWith(1);
    expect(result.message).toBe("Transaction deleted successfully.");
  });

  it("should throw error if transaction does not exist", async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(transactionService.deleteTransaction(999)).rejects.toThrow(
      "Transaction not found."
    );
  });
});