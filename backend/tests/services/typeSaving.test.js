import { typeSavingService } from "../../src/services/TypeSaving/typeSaving.service";
import { typeSavingRepository } from "../../src/repositories/TypeSaving/TypeSavingRepository.js";

jest.mock("../../src/repositories/TypeSaving/TypeSavingRepository.js", () => ({
  typeSavingRepository: {
    getAllTypeSavings: jest.fn(),
    getTypeSavingById: jest.fn(),
    createTypeSaving: jest.fn(),
    updateTypeSaving: jest.fn(),
    deleteTypeSaving: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TypeSavingService: getAllTypeSavings", () => {
  it("should return all type savings", async () => {
    const mockData = [
      { id: 1, termperiod: 6, interest: 5.5 },
      { id: 2, termperiod: 12, interest: 6.2 },
    ];
    typeSavingRepository.getAllTypeSavings.mockResolvedValue(mockData);

    const result = await typeSavingService.getAllTypeSavings();

    expect(typeSavingRepository.getAllTypeSavings).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
});

describe("TypeSavingService: getTypeSavingById", () => {
  it("should return type saving by id", async () => {
    const mockType = { id: 1, termperiod: 6, interest: 5.5 };
    typeSavingRepository.getTypeSavingById.mockResolvedValue(mockType);

    const result = await typeSavingService.getTypeSavingById(1);

    expect(typeSavingRepository.getTypeSavingById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockType);
  });

  it("should return null if id does not exist", async () => {
    typeSavingRepository.getTypeSavingById.mockResolvedValue(null);

    const result = await typeSavingService.getTypeSavingById(999);

    expect(typeSavingRepository.getTypeSavingById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it("should throw error if id is missing", async () => {
    await expect(typeSavingService.getTypeSavingById(null)).rejects.toThrow("ID is required");
  });
});

describe("TypeSavingService: createTypeSaving", () => {
  it("should create a new type saving successfully", async () => {
    const mockInput = { termperiod: 12, interest: 6.2 };
    const mockCreated = { id: 2, ...mockInput };
    typeSavingRepository.createTypeSaving.mockResolvedValue(mockCreated);

    const result = await typeSavingService.createTypeSaving(mockInput);

    expect(typeSavingRepository.createTypeSaving).toHaveBeenCalledWith(mockInput);
    expect(result).toEqual(mockCreated);
  });

  it("should throw error if termperiod is missing", async () => {
    await expect(typeSavingService.createTypeSaving({ interest: 5.5 }))
      .rejects.toThrow("Missing required fields");
  });

  it("should throw error if interest is missing", async () => {
    await expect(typeSavingService.createTypeSaving({ termperiod: 6 }))
      .rejects.toThrow("Missing required fields");
  });

  it("should throw error if both fields are missing", async () => {
    await expect(typeSavingService.createTypeSaving({}))
      .rejects.toThrow("Missing required fields");
  });
});

describe("TypeSavingService: updateTypeSaving", () => {
  it("should update type saving successfully", async () => {
    const mockUpdate = { termperiod: 24, interest: 7.0 };
    const mockResult = { id: 1, ...mockUpdate };
    typeSavingRepository.updateTypeSaving.mockResolvedValue(mockResult);

    const result = await typeSavingService.updateTypeSaving(1, mockUpdate);

    expect(typeSavingRepository.updateTypeSaving).toHaveBeenCalledWith(1, mockUpdate);
    expect(result).toEqual(mockResult);
  });

  it("should return null if id does not exist", async () => {
    typeSavingRepository.updateTypeSaving.mockResolvedValue(null);

    const result = await typeSavingService.updateTypeSaving(999, { termperiod: 12, interest: 6.2 });

    expect(typeSavingRepository.updateTypeSaving).toHaveBeenCalledWith(999, { termperiod: 12, interest: 6.2 });
    expect(result).toBeNull();
  });

  it("should throw error if id is missing", async () => {
    await expect(typeSavingService.updateTypeSaving(null, { termperiod: 12, interest: 6.2 }))
      .rejects.toThrow("ID is required");
  });
});

describe("TypeSavingService: deleteTypeSaving", () => {
  it("should delete type saving successfully", async () => {
    typeSavingRepository.deleteTypeSaving.mockResolvedValue({ success: true });

    const result = await typeSavingService.deleteTypeSaving(1);

    expect(typeSavingRepository.deleteTypeSaving).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true });
  });

  it("should return null if id does not exist", async () => {
    typeSavingRepository.deleteTypeSaving.mockResolvedValue(null);

    const result = await typeSavingService.deleteTypeSaving(999);

    expect(typeSavingRepository.deleteTypeSaving).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it("should throw error if id is missing", async () => {
    await expect(typeSavingService.deleteTypeSaving(undefined))
      .rejects.toThrow("ID is required");
  });
});