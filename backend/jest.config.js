module.exports = {
  testEnvironment: 'node',
  globalSetup: './jest.globalSetup.js',
  globalTeardown: './jest.globalTeardown.js',
  testTimeout: 15000,
  // Run test files serially to avoid parallel DB deadlocks
  maxWorkers: 1,
  testPathIgnorePatterns: ['/node_modules/', '__tests__/helpers\\.js'],
};
