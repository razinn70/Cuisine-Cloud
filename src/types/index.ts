import { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

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
