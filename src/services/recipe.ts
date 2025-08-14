import { db } from "@/lib/firebase";
import { Recipe, RecipeSchema } from "@/types";
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, query, where, DocumentData } from "firebase/firestore";

type CreateRecipeData = Omit<Recipe, "id" | "createdAt" | "rating">;

// Helper to convert Firestore doc to a validated Recipe object
const toRecipe = (doc: DocumentData): Recipe => {
    const data = doc.data();
    // Add default values for fields that might be missing in older documents
    const validatedData = {
        id: doc.id,
        ...data,
        rating: data.rating || 0,
        difficulty: data.difficulty || 'Intermediate',
        tags: data.tags || [],
    };
    return RecipeSchema.parse(validatedData);
}

export const createRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "recipes"), {
            ...recipeData,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Initial random rating between 3.0 and 5.0
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating recipe: ", error);
        throw new Error("Could not create recipe.");
    }
};

export const getRecipes = async (): Promise<Recipe[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        // Safely parse each document
        return querySnapshot.docs.map(toRecipe);
    } catch (error) {
        console.error("Error fetching recipes: ", error);
        throw new Error("Could not fetch recipes.");
    }
}

export const getRecipe = async (id: string): Promise<Recipe | null> => {
    try {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return toRecipe(docSnap);
        } else {
            console.warn(`Recipe with id ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching recipe: ", error);
        throw new Error("Could not fetch recipe.");
    }
};

export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
    try {
        const q = query(collection(db, "recipes"), where("authorId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(toRecipe);
    } catch (error) {
        console.error("Error fetching user recipes: ", error);
        throw new Error("Could not fetch user recipes.");
    }
};
