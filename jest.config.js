module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    // Only test ts
    '**/__tests__/**/*.[t]s?(x)',
    '**/?(*.)+(spec|test).[t]s?(x)'
  ]
}
