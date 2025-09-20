const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const recipeSchema = Joi.object({
  name: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).required(),
  instructions: Joi.string().required(),
  prepTime: Joi.number().required(),
  cookTime: Joi.number().required(),
  servings: Joi.number().required(),
  cuisine: Joi.string().required(),
  imageUrl: Joi.string().uri().required()
});

// GET all recipes
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const recipes = await db.collection('recipes').find().toArray();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create recipe
router.post('/', async (req, res) => {
  const { error } = recipeSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const db = req.app.locals.db;
    const result = await db.collection('recipes').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update recipe
router.put('/:id', async (req, res) => {
  const { error } = recipeSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const result = await db.collection('recipes').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE recipe
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const result = await db.collection('recipes').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
