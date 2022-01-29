import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/src/**/*.ts', '!**/__*__/*.ts', '!**/*.d.ts'],
  clearMocks: true,
  transformIgnorePatterns: ['/node_modules'],
  testPathIgnorePatterns: ['/node_modules'],
};

export default config;
