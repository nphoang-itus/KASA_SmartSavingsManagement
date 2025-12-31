export const TEST_USERS = {
  admin: {
    username: "admin@test.com",
    password: "admin123",
    employeeId: 1001,
  },
  teller: {
    username: "teller@test.com",
    password: "teller123",
    employeeId: 1002,
  },
  accountant: {
    username: "accountant@test.com",
    password: "accountant123",
    employeeId: 1003,
  },
};

export const TEST_CUSTOMERS = {
  customer1: {
    fullName: "Test Customer 1",
    citizenId: "001234567890",
    street: "Test Street 1",
    district: "Test District 1",
    province: "HCM",
  },
  customer2: {
    fullName: "Test Customer 2",
    citizenId: "001234567891",
    street: "Test Street 2",
    district: "Test District 2",
    province: "HCM",
  },
};

export const TEST_SAVING_BOOKS = {
  noTerm: {
    typeSavingID: 1,
    initialDeposit: 1000000,
    citizenID: "001234567890",
  },
  term3Months: {
    typeSavingID: 2,
    initialDeposit: 5000000,
    citizenID: "001234567890",
  },
};

export const TEST_TRANSACTIONS = {
  deposit: {
    amount: 500000,
    type: "Deposit",
  },
  withdraw: {
    amount: 200000,
    type: "WithDraw",
  },
};
