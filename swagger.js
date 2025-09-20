const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Recipe Manager API',
    description: 'REST API for managing recipes and users',
    version: '1.0.0'
  },
  host: process.env.HOST || 'localhost:3000',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
