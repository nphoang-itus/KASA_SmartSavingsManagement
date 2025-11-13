import { savingBookService } from "../../src/services/SavingBook/savingbook.service.js";
import { savingBookRepository } from "../../src/repositories/SavingBook/SavingBookRepository.js";

jest.mock("../../src/repositories/SavingBook/SavingBookRepository.js", () => ({
  savingBookRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../src/config/database.js', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SavingBookService: addSavingBook", () => {
  it("should create a new saving book successfully", async () => {
    const mockInput = { typeID: 1, customerID: 2, currentBalance: 1000 };
    const mockCreated = { id: 1, ...mockInput };
    savingBookRepository.create.mockResolvedValue(mockCreated);

    const result = await savingBookService.addSavingBook(mockInput);

    expect(savingBookRepository.create).toHaveBeenCalledWith({
      typeid: 1,
      customerid: 2,
      currentbalance: 1000,
    });
    expect(result.message).toBe("Saving book created successfully.");
    expect(result.savingBook).toEqual(mockCreated);
  });

  it("should throw error if required fields are missing", async () => {
    await expect(
      savingBookService.addSavingBook({ typeID: 1, customerID: 2 })
    ).rejects.toThrow("Missing required information.");
  });
});

describe("SavingBookService: updateSavingBook", () => {
  it("should update a saving book successfully", async () => {
    const mockUpdates = {
      status: "closed",
      closeTime: "2023-01-01",
      currentBalance: 2000,
    };
    const mockExistingBook = {
      id: 1,
      typeid: 1,
      customerid: 2,
      currentbalance: 1000,
    };
    const mockUpdatedBook = { id: 1, ...mockExistingBook, ...mockUpdates };

    savingBookRepository.findById.mockResolvedValue(mockExistingBook);
    savingBookRepository.update.mockResolvedValue(mockUpdatedBook);

    const result = await savingBookService.updateSavingBook(1, mockUpdates);

    expect(savingBookRepository.findById).toHaveBeenCalledWith(1);
    expect(savingBookRepository.update).toHaveBeenCalledWith(1, {
      status: "closed",
      closetime: "2023-01-01",
      currentbalance: 2000,
    });
    expect(result.message).toBe("Saving book updated successfully");
    expect(result.savingBook).toEqual(mockUpdatedBook);
  });

  it("should throw error if saving book does not exist", async () => {
    savingBookRepository.findById.mockResolvedValue(null);

    await expect(
      savingBookService.updateSavingBook(999, { status: "closed" })
    ).rejects.toThrow("Saving book not found");
  });
});

describe("SavingBookService: deleteSavingBook", () => {
  it("should delete a saving book successfully", async () => {
    const mockExistingBook = {
      id: 1,
      typeid: 1,
      customerid: 2,
      currentbalance: 1000,
    };

    savingBookRepository.findById.mockResolvedValue(mockExistingBook);
    savingBookRepository.delete.mockResolvedValue();

    const result = await savingBookService.deleteSavingBook(1);

    expect(savingBookRepository.findById).toHaveBeenCalledWith(1);
    expect(savingBookRepository.delete).toHaveBeenCalledWith(1);
    expect(result.message).toBe("Saving book deleted successfully");
  });

  it("should throw error if saving book does not exist", async () => {
    savingBookRepository.findById.mockResolvedValue(null);

    await expect(savingBookService.deleteSavingBook(999)).rejects.toThrow(
      "Saving book not found"
    );
  });
});

describe("SavingBookService: getSavingBookById", () => {
  it("should return a saving book by id", async () => {
    const mockSavingBook = {
      id: 1,
      typeid: 1,
      customerid: 2,
      currentbalance: 1000,
    };
    savingBookRepository.findById.mockResolvedValue(mockSavingBook);

    const result = await savingBookService.getSavingBookById(1);

    expect(savingBookRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSavingBook);
  });

  it("should throw error if saving book does not exist", async () => {
    savingBookRepository.findById.mockResolvedValue(null);

    await expect(savingBookService.getSavingBookById(999)).rejects.toThrow(
      "Saving book not found"
    );
  });
});