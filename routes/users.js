const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  favoriteRecipes: Joi.array().items(Joi.string())
});

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               favoriteRecipes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *                 description: Array of recipe IDs
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const db = req.app.locals.db;
    // Check if user already exists
    const existing = await db.collection('users').findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { ...req.body, password: hashedPassword };
    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid email or password' });
    // For demonstration, return user info (omit password)
    const { password: pw, ...userInfo } = user;
    res.json({ message: 'Login successful', user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe_updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe.updated@example.com"
 *               favoriteRecipes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *                 description: Array of recipe IDs
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', (req, res, next) => {
  req.app.locals.ensureAuthenticated(req, res, next);
}, async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', (req, res, next) => {
  req.app.locals.ensureAuthenticated(req, res, next);
}, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
