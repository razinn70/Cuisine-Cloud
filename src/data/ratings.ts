/**
 * This file contains sample user rating data to simulate a real database.
 * In a production system, this data would be stored in a 'recipe_ratings' table
 * and would be the "training data" for a machine learning model.
 *
 * The user's ID corresponds to their Firebase Auth UID.
 * You can find the user UIDs by logging in as different users and checking
 * the browser's local storage for the logged-in user details.
 */
type UserRatings = {
  [userId: string]: {
    [recipeId: string]: number; // Rating from 1 to 5
  };
};

// Key: Firebase User UID
// Value: Map of Recipe ID to Rating
export const sampleRatings: UserRatings = {
  // Example for a user who likes savory, easy meals
  "a4g...": { // NOTE: Replace with a real user ID from your app
    "recipe-1": 5, // Assuming recipe-1 is "Grandma's Lasagna"
    "recipe-2": 4, // Assuming recipe-2 is "Quick Chicken Stir-fry"
    "recipe-3": 2, // Assuming recipe-3 is "Vegan Lentil Soup" (disliked)
    "recipe-4": 5, // Assuming recipe-4 is "Spicy Tacos"
  },
  // Example for a user who prefers healthy, vegetarian options
  "b5h...": { // NOTE: Replace with a real user ID from your app
    "recipe-1": 2, // Disliked "Grandma's Lasagna"
    "recipe-3": 5, // Loved "Vegan Lentil Soup"
    "recipe-5": 4, // Assuming recipe-5 is "Quinoa Salad"
    "recipe-6": 5, // Assuming recipe-6 is "Roasted Vegetable Medley"
  }
};
