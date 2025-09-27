# Recipe Manager API

A Node.js REST API for managing recipes and users with OAuth authentication.

## Features
- CRUD operations for recipes and users
- MongoDB integration with 2 collections
- Data validation and error handling using Joi
- Swagger API documentation
- GitHub OAuth authentication
- Protected routes for authenticated users
- Ready for deployment to Render

## Collections
- **recipes**: name, ingredients, instructions, prepTime, cookTime, servings, cuisine, imageUrl, difficulty, tags, author, dateCreated, rating (13+ fields)
- **users**: username, email, password, favoriteRecipes (4+ fields)

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/recipe-manager?retryWrites=true&w=majority

# Session Secret
SESSION_SECRET=your-super-secret-session-key-here

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Server Configuration
PORT=3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Swagger Documentation
```bash
node swagger.js
```

### 4. Populate Database (Optional)
```bash
node populate-db.js
```

### 5. Start the Server
```bash
npm start
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api-docs`

## Authentication

### GitHub OAuth
- `GET /auth/github` - Start GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /logout` - Logout user
- `GET /protected` - Protected route (requires authentication)

### Protected Routes
The following routes require authentication:
- `POST /recipes` - Create recipe
- `PUT /recipes/:id` - Update recipe  
- `DELETE /recipes/:id` - Delete recipe
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## API Endpoints

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/:id` - Get recipe by ID
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user