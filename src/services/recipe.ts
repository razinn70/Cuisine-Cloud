import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  where,
  DocumentData,
  FirestoreDataConverter,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Recipe, RecipeSchema } from '@/types';

type CreateRecipeData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;

// FirestoreDataConverter provides type safety for Firestore operations
const recipeConverter: FirestoreDataConverter<Recipe> = {
  toFirestore(recipe: Omit<Recipe, 'id'>): DocumentData {
    return {
      ...recipe,
      createdAt: recipe.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options): Recipe {
    const data = snapshot.data(options);
    // Zod parsing ensures the data from Firestore matches our schema
    return RecipeSchema.parse({
      id: snapshot.id,
      ...data,
      // Handle Firestore Timestamps
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : new Timestamp(0, 0),
    });
  },
};

const recipesCollection = collection(db, 'recipes').withConverter(recipeConverter);

/**
 * Creates a new recipe in Firestore.
 * @param recipeData - The recipe data, conforming to the CreateRecipeData type.
 * @returns The ID of the newly created recipe.
 */
export const createRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
  try {
    const docRef = await addDoc(recipesCollection, {
      ...recipeData,
      rating: 0, // Initial rating
      createdAt: null, // Will be replaced by serverTimestamp in converter
      updatedAt: null, // Will be replaced by serverTimestamp in converter
    } as Omit<Recipe, 'id'>);
    return docRef.id;
  } catch (error) {
    console.error('Error creating recipe in repository: ', error);
    // In a real app, you might log this to a more sophisticated service
    throw new Error('Could not create recipe.');
  }
};

/**
 * Fetches a single recipe by its ID.
 * @param id - The UUID of the recipe.
 * @returns The Recipe object or null if not found.
 */
export const getRecipe = async (id: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(recipesCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn(`Recipe with id ${id} not found.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching recipe from repository: ', error);
    throw new Error('Could not fetch recipe.');
  }
};

/**
 * Fetches all recipes.
 * In a real-world app, this would be paginated.
 * @returns An array of all Recipe objects.
 */
export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const querySnapshot = await getDocs(recipesCollection);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching all recipes from repository: ', error);
    throw new Error('Could not fetch recipes.');
  }
};

/**
 * Fetches all recipes created by a specific user.
 * @param userId - The UID of the author.
 * @returns An array of Recipe objects created by the user.
 */
export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
    try {
        const q = query(recipesCollection, where("authorId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching user recipes from repository: ", error);
        throw new Error("Could not fetch user recipes.");
    }
};
