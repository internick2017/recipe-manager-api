const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-static.json');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Exiting.');
    process.exit(1);
  }
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const dbName = (new URL(uri.replace('mongodb+srv://', 'http://'))).pathname.replace('/', '') || 'recipe-manager';
    const db = client.db(dbName || 'recipe-manager');
    app.locals.db = db;
    console.log('Connected to MongoDB');

    // Swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Routes
    app.use('/recipes', require('./routes/recipes'));
    app.use('/users', require('./routes/users'));

    app.get('/', (req, res) => {
      res.json({ message: 'Recipe Manager API', version: '1.0.0' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
