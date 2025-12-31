export default {
  testEnvironment: "node",
  transform: {},
  testMatch: [
    //// UNIT TEST
    "**/tests/unit/controllers/*.test.js",
    "**/tests/unit/middleware/*.test.js",
    "**/tests/unit/models/*.test.js",
    "**/tests/unit/services/*.test.js",
    "**/tests/unit/utils/*.test.js",
    
    //// INTEGRATION TEST
    // "**/tests/integration/**/*.test.js",
    // "**/tests/integration/auth/*.test.js",
    // "**/tests/integration/customer/*.test.js",
  ],
  collectCoverageFrom: [
    "src/services/**/*.js",
    "src/models/**/*.js",
    "src/middleware/**/*.js",
    "src/controllers/**/*.js",
    "!src/config/**",
    "!src/index.js",
    "!**/node_modules/**",
    "!src/middleware/logger.middleware.js",
    "!src/services/UserAccount/email.service.js",
    "!src/services/Dashboard/dashboard.service.js",
    "!src/controllers/Dashboard/dashboard.controller.js",
    "!src/controllers/UserAccount/changePassword.controller.js",
  ],
  coverageDirectory: "coverage/integration",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: [
    '<rootDir>/tests/helpers/setup.js',
    '<rootDir>/tests/helpers/teardown.js'
    // '<rootDir>/tests/integration/helpers/setup.js'
  ],
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: ['js', 'mjs'],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
  },
  forceExit: true,
  detectOpenHandles: true,
};