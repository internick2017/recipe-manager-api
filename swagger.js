const swaggerAutogen = require('swagger-autogen')();

const doc = {
  swagger: '2.0',
  info: {
    title: 'Recipe Manager API',
    description: 'REST API for managing recipes and users',
    version: '1.0.0'
  },
  host: process.env.HOST || 'localhost:3000',
  basePath: '/',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
  paths: {
    '/': {
      get: {
        summary: 'API Root',
        responses: {
          200: {
            description: 'API information',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Recipe Manager API' },
                version: { type: 'string', example: '1.0.0' }
              }
            }
          }
        }
      }
    },
    '/recipes': {
      get: {
        summary: 'Get all recipes',
        responses: {
          200: {
            description: 'List of recipes',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/Recipe' }
            }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      post: {
        summary: 'Create a new recipe',
        consumes: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'recipe',
            required: true,
            schema: { $ref: '#/definitions/Recipe' }
          }
        ],
        responses: {
          201: {
            description: 'Recipe created successfully',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' }
              }
            }
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      }
    },
    '/recipes/{id}': {
      get: {
        summary: 'Get recipe by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          }
        ],
        responses: {
          200: {
            description: 'Recipe found',
            schema: { $ref: '#/definitions/Recipe' }
          },
          404: {
            description: 'Recipe not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      put: {
        summary: 'Update a recipe',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          },
          {
            in: 'body',
            name: 'recipe',
            required: true,
            schema: { $ref: '#/definitions/Recipe' }
          }
        ],
        responses: {
          200: {
            description: 'Recipe updated successfully',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Recipe updated successfully' }
              }
            }
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/Error' }
          },
          404: {
            description: 'Recipe not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      delete: {
        summary: 'Delete a recipe',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          }
        ],
        responses: {
          200: {
            description: 'Recipe deleted successfully',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Recipe deleted successfully' }
              }
            }
          },
          404: {
            description: 'Recipe not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Get all users',
        responses: {
          200: {
            description: 'List of users',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/User' }
            }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      post: {
        summary: 'Create a new user',
        parameters: [
          {
            in: 'body',
            name: 'user',
            required: true,
            schema: { $ref: '#/definitions/User' }
          }
        ],
        responses: {
          201: {
            description: 'User created successfully',
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' }
              }
            }
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      }
    },
    '/users/{id}': {
      get: {
        summary: 'Get user by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'User found',
            schema: { $ref: '#/definitions/User' }
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      put: {
        summary: 'Update a user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          },
          {
            in: 'body',
            name: 'user',
            required: true,
            schema: { $ref: '#/definitions/User' }
          }
        ],
        responses: {
          200: {
            description: 'User updated successfully',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'User updated successfully' }
              }
            }
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/Error' }
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      },
      delete: {
        summary: 'Delete a user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'User deleted successfully' }
              }
            }
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/Error' }
          },
          500: {
            description: 'Server error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      }
    }
  },
  definitions: {
    Recipe: {
      type: 'object',
      required: ['name', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'cuisine', 'imageUrl'],
      properties: {
        name: { type: 'string', example: 'Spaghetti Carbonara' },
        ingredients: {
          type: 'array',
          items: { type: 'string' },
          example: ['200g spaghetti', '2 eggs', '100g pancetta', '50g parmesan cheese', 'Black pepper']
        },
        instructions: { type: 'string', example: 'Cook spaghetti in salted boiling water. Fry pancetta until crispy. Whisk eggs with parmesan. Drain pasta, mix with pancetta, then add egg mixture off heat. Season with black pepper.' },
        prepTime: { type: 'number', example: 10 },
        cookTime: { type: 'number', example: 15 },
        servings: { type: 'number', example: 4 },
        cuisine: { type: 'string', example: 'Italian' },
        imageUrl: { type: 'string', format: 'uri', example: 'https://example.com/spaghetti-carbonara.jpg' }
      }
    },
    User: {
      type: 'object',
      required: ['username', 'email'],
      properties: {
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        favoriteRecipes: {
          type: 'array',
          items: { type: 'string' },
          example: [],
          description: 'Array of recipe IDs'
        }
      }
    },
    Error: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Error message description' }
      }
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = []; // Empty array since we're defining everything manually

swaggerAutogen(outputFile, endpointsFiles, doc);
