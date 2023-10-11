/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/*.js',
    '<rootDir>/build',
    '<rootDir>/examples',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/*.js',
    '<rootDir>/build',
    '<rootDir>/examples',
    '<rootDir>/src/lib',
  ],
};
