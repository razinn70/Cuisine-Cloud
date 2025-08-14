import { db } from "@/lib/firebase";
import { Recipe } from "@/types";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type CreateRecipeData = Omit<Recipe, "id" | "createdAt" | "rating">;

export const createRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "recipes"), {
            ...recipeData,
            rating: 0, // Initial rating
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating recipe: ", error);
        throw new Error("Could not create recipe.");
    }
};
