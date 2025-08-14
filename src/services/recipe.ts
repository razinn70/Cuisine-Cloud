import { db } from "@/lib/firebase";
import { Recipe } from "@/types";
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, query, where } from "firebase/firestore";

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

export const getRecipes = async (): Promise<Recipe[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        const recipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        return recipes;
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
            return { id: docSnap.id, ...docSnap.data() } as Recipe;
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
        const recipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        return recipes;
    } catch (error) {
        console.error("Error fetching user recipes: ", error);
        throw new Error("Could not fetch user recipes.");
    }
};