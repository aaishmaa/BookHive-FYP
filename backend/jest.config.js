export default {
  testEnvironment:        "node",
  transform:              {},
  testMatch:              ["**/*.test.js"],
  testPathIgnorePatterns: ["node_modules"],
  testTimeout:            20000,
  verbose:                true,
  maxWorkers:             1,
};