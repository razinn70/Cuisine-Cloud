import { Timestamp } from "firebase/firestore";

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
