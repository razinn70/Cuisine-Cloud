import { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export interface Ingredient {
  name: string;
  quantity: string;
}

// Zod schema for NutritionInfo
export const NutritionInfoSchema = z.object({
  calories: z.string().describe("Estimated calories per serving."),
  protein: z.string().describe("Estimated protein in grams per serving."),
  carbs: z.string().describe("Estimated carbohydrates in grams per serving."),
  fat: z.string().describe("Estimated fat in grams per serving."),
});
export type NutritionInfo = z.infer<typeof NutritionInfoSchema>;

// Zod schema for AnalyzeRecipe flow
export const AnalyzeRecipeInputSchema = z.object({
  title: z.string().describe("The title of the recipe."),
  ingredients: z.array(z.string()).describe("A list of ingredients with quantities."),
  instructions: z.array(z.string()).describe("The cooking instructions."),
});
export type AnalyzeRecipeInput = z.infer<typeof AnalyzeRecipeInputSchema>;


export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cookTime: string;
  servings: string;
  rating: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  author: string;
  authorId: string;
  createdAt?: Timestamp;
}


export interface AnalyticsEvent {
    id: string;
    name: string;
    data: { [key: string]: any };
    createdAt: Timestamp;
}

// Define the schema for the recommendation output
export const RecommendedRecipesSchema = z.object({
  recommendations: z.array(z.object({
    recipeId: z.string().describe("The ID of the recommended recipe."),
    title: z.string().describe("The title of the recipe."),
    reason: z.string().describe("A brief, user-facing explanation for why this recipe was recommended."),
  })).describe("A list of personalized recipe recommendations."),
});
export type RecommendedRecipes = z.infer<typeof RecommendedRecipesSchema>;

// Define the input schema for the recommendation flow
export const RecommendRecipesInputSchema = z.object({
  userId: z.string().describe("The ID of the user to generate recommendations for."),
  count: z.number().int().positive().optional().default(5).describe("The number of recommendations to generate."),
});
export type RecommendRecipesInput = z.infer<typeof RecommendRecipesInputSchema>;


// Define a schema for the generated recipe, which will be our output format.
export const GeneratedRecipeSchema = z.object({
    title: z.string().describe("A creative and appealing title for the recipe."),
    description: z.string().describe("A short, enticing description of the dish."),
    cookTime: z.string().describe("Estimated total cooking time (e.g., '45 minutes')."),
    servings: z.string().describe("The number of servings the recipe makes (e.g., '4 servings')."),
    ingredients: z.array(z.object({
        name: z.string().describe("The name of the ingredient."),
        quantity: z.string().describe("The quantity of the ingredient (e.g., '1 cup', '2 tbsp')."),
    })).describe("A list of ingredients required for the recipe."),
    instructions: z.array(z.string()).describe("Step-by-step instructions for preparing the dish."),
    nutrition: NutritionInfoSchema.describe("Estimated nutritional information per serving."),
});
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;

export const GenerateRecipeInputSchema = z.object({
  ingredients: z.string().describe("A comma-separated list of ingredients the user has."),
  preferences: z.string().describe("User preferences for the recipe (e.g., 'quick and easy', 'healthy', 'vegetarian')."),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;


// Define the structure for a single day's meal plan
const DayPlanSchema = z.object({
  Breakfast: z.string().optional().describe("The name of the recipe for breakfast."),
  Lunch: z.string().optional().describe("The name of the recipe for lunch."),
  Dinner: z.string().optional().describe("The name of the recipe for dinner."),
});

// Define the overall meal plan structure using a record for flexible day names
export const MealPlanSchema = z.object({
  plan: z.record(z.string(), DayPlanSchema).describe("The generated meal plan, with days of the week as keys containing recipe names."),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;


export const GenerateMealPlanInputSchema = z.object({
  prompt: z.string().describe("The user's request for the meal plan (e.g., dietary needs, number of days)."),
  recipes: z.array(z.custom<Pick<Recipe, 'title' | 'description'>>()).describe("A list of available recipes with their titles and descriptions."),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;
