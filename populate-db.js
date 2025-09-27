const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { sampleRecipes, sampleUsers } = require('./sample-data');
require('dotenv').config();

async function populateDatabase() {
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
    
    console.log('Connected to MongoDB');

    await db.collection('recipes').deleteMany({});
    await db.collection('users').deleteMany({});
    console.log('Cleared existing data');

    const recipeResult = await db.collection('recipes').insertMany(sampleRecipes);
    console.log(`Inserted ${recipeResult.insertedCount} recipes`);

    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    
    const userResult = await db.collection('users').insertMany(hashedUsers);
    console.log(`Inserted ${userResult.insertedCount} users`);

    const recipes = await db.collection('recipes').find().toArray();
    if (recipes.length > 0) {
      await db.collection('users').updateOne(
        { username: 'john_doe' },
        { $set: { favoriteRecipes: [recipes[0]._id.toString()] } }
      );
      await db.collection('users').updateOne(
        { username: 'jane_smith' },
        { $set: { favoriteRecipes: [recipes[0]._id.toString(), recipes[1]._id.toString()] } }
      );
      console.log('Updated users with favorite recipes');
    }

    console.log('Database populated successfully!');
    console.log(`Total recipes: ${await db.collection('recipes').countDocuments()}`);
    console.log(`Total users: ${await db.collection('users').countDocuments()}`);
    
    await client.close();
  } catch (err) {
    console.error('Error populating database:', err);
    process.exit(1);
  }
}

populateDatabase();
