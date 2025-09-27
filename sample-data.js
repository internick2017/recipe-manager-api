
const sampleRecipes = [
  {
    name: "Spaghetti Carbonara",
    ingredients: [
      "200g spaghetti",
      "2 large eggs",
      "100g pancetta",
      "50g parmesan cheese",
      "2 cloves garlic",
      "Black pepper",
      "Salt"
    ],
    instructions: "Cook spaghetti in salted boiling water. Fry pancetta until crispy. Whisk eggs with parmesan. Drain pasta, mix with pancetta, then add egg mixture off heat. Season with black pepper.",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    cuisine: "Italian",
    imageUrl: "https://example.com/carbonara.jpg",
    difficulty: "Medium",
    tags: ["pasta", "italian", "comfort-food"],
    author: "Chef Mario",
    dateCreated: new Date(),
    rating: 4.5
  },
  {
    name: "Chicken Tikka Masala",
    ingredients: [
      "500g chicken breast",
      "400ml coconut milk",
      "2 tbsp tomato paste",
      "1 onion",
      "3 cloves garlic",
      "1 inch ginger",
      "2 tsp garam masala",
      "1 tsp turmeric",
      "1 tsp cumin",
      "Basmati rice"
    ],
    instructions: "Marinate chicken in yogurt and spices. Cook onions until golden. Add garlic, ginger, and spices. Add chicken and cook until done. Add coconut milk and simmer. Serve with basmati rice.",
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    cuisine: "Indian",
    imageUrl: "https://example.com/tikka-masala.jpg",
    difficulty: "Medium",
    tags: ["curry", "indian", "spicy"],
    author: "Chef Priya",
    dateCreated: new Date(),
    rating: 4.8
  },
  {
    name: "Chocolate Chip Cookies",
    ingredients: [
      "2 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter",
      "3/4 cup brown sugar",
      "1/2 cup white sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips"
    ],
    instructions: "Preheat oven to 375°F. Mix dry ingredients. Cream butter and sugars. Add eggs and vanilla. Combine wet and dry ingredients. Fold in chocolate chips. Bake for 9-11 minutes.",
    prepTime: 15,
    cookTime: 10,
    servings: 24,
    cuisine: "American",
    imageUrl: "https://example.com/cookies.jpg",
    difficulty: "Easy",
    tags: ["dessert", "baking", "sweet"],
    author: "Chef Sarah",
    dateCreated: new Date(),
    rating: 4.7
  }
];

const sampleUsers = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "password123", // This will be hashed
    favoriteRecipes: []
  },
  {
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "password456", // This will be hashed
    favoriteRecipes: []
  },
  {
    username: "chef_mario",
    email: "mario@example.com",
    password: "chefpassword", // This will be hashed
    favoriteRecipes: []
  }
];

module.exports = {
  sampleRecipes,
  sampleUsers
};
