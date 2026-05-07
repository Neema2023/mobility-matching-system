module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    testMatch: ['**/tests/**/*.test.ts'],

    moduleFileExtensions: ['ts', 'js', 'json'],

    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: false }],
    },

    clearMocks: true,
    setupFiles: ['<rootDir>/jest.setup.ts'],

    transformIgnorePatterns: [
        'node_modules/(?!(uuid)/)'
    ],

    detectOpenHandles: true,
    forceExit: true,
};