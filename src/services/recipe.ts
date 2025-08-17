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
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Recipe, CreateRecipeData, RecipeSchema } from '@/types';

// FirestoreDataConverter provides type safety for Firestore operations.
// It handles the conversion between the raw Firestore document and our typed Recipe object.
const recipeConverter: FirestoreDataConverter<Recipe> = {
  toFirestore(recipe: CreateRecipeData): DocumentData {
    // Data going to Firestore
    return {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: recipe.rating ?? 0, // Default rating
    };
  },
  fromFirestore(snapshot: DocumentSnapshot, options): Recipe {
    const data = snapshot.data(options);
    // Data coming from Firestore
    // We use our Zod schema to parse and validate the data.
    // This ensures that what we use in our app is always type-safe.
    return RecipeSchema.parse({
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  },
};

// Creates a typed collection reference to the 'recipes' collection.
const recipesCollection = collection(db, 'recipes').withConverter(recipeConverter);

// =================================================================
// REPOSITORY LAYER
// This layer is responsible for all direct communication with the database.
// No other part of the application should import from 'firebase/firestore'.
// =================================================================
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
   * Fetches a single recipe by its ID from Firestore.
   * @param id - The UUID of the recipe.
   * @returns The parsed Recipe object or null if not found.
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
   * Fetches all recipes from Firestore.
   * In a real-world app, this would be paginated.
   * @returns An array of all parsed Recipe objects.
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
   * Fetches all recipes created by a specific user from Firestore.
   * @param userId - The UID of the author.
   * @returns An array of parsed Recipe objects created by the user.
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


// =================================================================
// SERVICE LAYER
// This layer contains the business logic. It uses the repository
// to interact with the database and is what the UI components will call.
// =================================================================

/**
 * Service function to create a new recipe.
 * In a real app, this is where you'd add more complex business logic,
 * validation, or calls to other services.
 * @param recipeData - The data for the new recipe.
 * @returns The ID of the created recipe.
 */
export const createRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
  // Business logic could go here. For example, checking for duplicate titles, etc.
  return repository.create(recipeData);
};

/**
 * Service function to get a single recipe by its ID.
 * @param id - The ID of the recipe to fetch.
 * @returns A Recipe object or null if not found.
 */
export const getRecipe = async (id: string): Promise<Recipe | null> => {
  // Business logic can be added here, e.g., checking user permissions.
  return repository.findById(id);
};

/**
 * Service function to get all recipes.
 * @returns An array of all recipes.
 */
export const getRecipes = async (): Promise<Recipe[]> => {
  // Business logic can be added here, e.g., filtering out sensitive recipes for certain users.
  return repository.findAll();
};

/**
 * Service function to get all recipes created by a specific user.
 * @param userId - The user's ID.
 * @returns An array of the user's recipes.
 */
export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
  return repository.findByAuthor(userId);
};
