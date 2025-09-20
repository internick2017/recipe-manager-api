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
/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *               - instructions
 *               - prepTime
 *               - cookTime
 *               - servings
 *               - cuisine
 *               - imageUrl
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Spaghetti Carbonara"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["200g spaghetti", "2 eggs", "100g pancetta"]
 *               instructions:
 *                 type: string
 *                 example: "Cook spaghetti. Fry pancetta. Mix eggs and cheese."
 *               prepTime:
 *                 type: number
 *                 example: 10
 *               cookTime:
 *                 type: number
 *                 example: 15
 *               servings:
 *                 type: number
 *                 example: 4
 *               cuisine:
 *                 type: string
 *                 example: "Italian"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/recipe.jpg"
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *               - instructions
 *               - prepTime
 *               - cookTime
 *               - servings
 *               - cuisine
 *               - imageUrl
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Spaghetti Carbonara"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["250g spaghetti", "3 eggs", "120g pancetta"]
 *               instructions:
 *                 type: string
 *                 example: "Updated cooking instructions."
 *               prepTime:
 *                 type: number
 *                 example: 12
 *               cookTime:
 *                 type: number
 *                 example: 18
 *               servings:
 *                 type: number
 *                 example: 6
 *               cuisine:
 *                 type: string
 *                 example: "Italian"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/updated-recipe.jpg"
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
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
