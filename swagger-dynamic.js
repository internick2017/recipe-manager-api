const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe Manager API',
      version: '1.0.0',
      description: 'REST API for managing recipes and users with OAuth authentication',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `https://${process.env.RENDER_EXTERNAL_URL || 'your-app.onrender.com'}`
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        githubOAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://github.com/login/oauth/authorize',
              tokenUrl: 'https://github.com/login/oauth/access_token',
              scopes: {
                'user:email': 'Access user email address',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
