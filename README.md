# Recipe Manager API

A Node.js REST API for managing recipes and users.

## Features
- CRUD operations for recipes and users
- MongoDB integration
- Data validation and error handling
- Swagger API documentation
- Ready for deployment to Render

## Collections
- **recipes**: name, ingredients, instructions, prepTime, cookTime, servings, cuisine, imageUrl
- **users**: username, email, favoriteRecipes

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/recipe-manager?retryWrites=true&w=majority
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

### 4. Start the Server
```bash
npm start
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api-docs`

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