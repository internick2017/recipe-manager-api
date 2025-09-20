const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Recipe Manager API',
    description: 'REST API for managing recipes and users',
    version: '1.0.0'
  },
  host: process.env.HOST || 'localhost:3000',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
  definitions: {
    Recipe: {
      type: 'object',
      required: ['name', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'cuisine', 'imageUrl'],
      properties: {
        name: { type: 'string', example: 'Spaghetti Carbonara' },
        ingredients: { type: 'array', items: { type: 'string' }, example: ['200g spaghetti', '2 eggs', '100g pancetta'] },
        instructions: { type: 'string', example: 'Cook spaghetti. Fry pancetta. Mix eggs and cheese.' },
        prepTime: { type: 'number', example: 10 },
        cookTime: { type: 'number', example: 15 },
        servings: { type: 'number', example: 4 },
        cuisine: { type: 'string', example: 'Italian' },
        imageUrl: { type: 'string', format: 'uri', example: 'https://example.com/recipe.jpg' }
      }
    },
    User: {
      type: 'object',
      required: ['username', 'email'],
      properties: {
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        favoriteRecipes: { type: 'array', items: { type: 'string' }, example: [] }
      }
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
