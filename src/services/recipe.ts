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
import { Recipe, CreateRecipeData, RecipeSchema } from '@/types';

// FirestoreDataConverter provides type safety for Firestore operations
const recipeConverter: FirestoreDataConverter<Recipe> = {
  toFirestore(recipe: CreateRecipeData): DocumentData {
    return {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: recipe.rating ?? 0, // Default rating
    };
  },
  fromFirestore(snapshot, options): Recipe {
    const data = snapshot.data(options);
    // Zod parsing ensures the data from Firestore matches our schema
    return RecipeSchema.parse({
      id: snapshot.id,
      ...data,
      // Handle Firestore Timestamps which might not be set on creation yet
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : new Timestamp(0, 0),
    });
  },
};

const recipesCollection = collection(db, 'recipes').withConverter(recipeConverter);

const repository = {
  /**
   * Creates a new recipe in Firestore.
   * @param recipeData - The recipe data, conforming to the CreateRecipeData type.
   * @returns The ID of the newly created recipe.
   */
  create: async (recipeData: CreateRecipeData): Promise<string> => {
    try {
      const docRef = await addDoc(recipesCollection, recipeData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating recipe in repository: ', error);
      throw new Error('Could not create recipe.');
    }
  },

  /**
   * Fetches a single recipe by its ID.
   * @param id - The UUID of the recipe.
   * @returns The Recipe object or null if not found.
   */
  findById: async (id: string): Promise<Recipe | null> => {
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
  },

  /**
   * Fetches all recipes.
   * In a real-world app, this would be paginated.
   * @returns An array of all Recipe objects.
   */
  findAll: async (): Promise<Recipe[]> => {
    try {
      const querySnapshot = await getDocs(recipesCollection);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching all recipes from repository: ', error);
      throw new Error('Could not fetch recipes.');
    }
  },

  /**
   * Fetches all recipes created by a specific user.
   * @param userId - The UID of the author.
   * @returns An array of Recipe objects created by the user.
   */
  findByAuthor: async (userId: string): Promise<Recipe[]> => {
    try {
      const q = query(recipesCollection, where("authorId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching user recipes from repository: ", error);
      throw new Error("Could not fetch user recipes.");
    }
  },
};


// These are the service functions that the application will call.
// They use the repository to interact with the database.

export const createRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
  // In a real app, this is where you'd add business logic, validation, etc.
  return repository.create(recipeData);
};

export const getRecipe = async (id: string): Promise<Recipe | null> => {
  return repository.findById(id);
};

export const getRecipes = async (): Promise<Recipe[]> => {
  return repository.findAll();
};

export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
  return repository.findByAuthor(userId);
};
