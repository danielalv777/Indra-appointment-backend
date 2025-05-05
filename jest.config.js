module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json', // Usa tu tsconfig.json para la configuración
    },
  },
};
