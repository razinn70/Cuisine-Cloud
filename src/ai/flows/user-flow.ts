'use server';

/**
 * @fileOverview Manages user authentication flows, including user creation and login.
 * This file will be expanded to include more complex user management features.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock database for users
const users: any[] = [];

// Schema for creating a new user
const CreateUserInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

const CreateUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

// Schema for user login
const LoginUserInputSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginUserInput = z.infer<typeof LoginUserInputSchema>;

const LoginUserOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    user: z.object({ id: z.string(), name: z.string(), email: z.string() }).optional(),
});
export type LoginUserOutput = z.infer<typeof LoginUserOutputSchema>;


/**
 * Creates a new user.
 * In a real application, this would involve password hashing and database interaction.
 */
const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    // Check if user already exists
    if (users.find(u => u.email === input.email)) {
      return { success: false, message: 'User with this email already exists.' };
    }
    
    // In a real app, you would hash the password here. e.g. using bcrypt
    const newUser = {
      id: `user_${Date.now()}`,
      name: input.name,
      email: input.email,
      password: input.password, // Storing plaintext password for this example ONLY.
    };
    
    users.push(newUser);
    console.log('Users:', users);

    return { success: true, message: 'User created successfully.', userId: newUser.id };
  }
);

/**
 * Logs a user in.
 * In a real application, this would involve password comparison and session management (e.g., JWT).
 */
const loginUserFlow = ai.defineFlow(
    {
        name: 'loginUserFlow',
        inputSchema: LoginUserInputSchema,
        outputSchema: LoginUserOutputSchema,
    },
    async (input) => {
        const user = users.find(u => u.email === input.email);

        if (!user || user.password !== input.password) {
            return { success: false, message: 'Invalid email or password.' };
        }
        
        // Don't send password to the client
        const { password, ...userWithoutPassword } = user;

        return { success: true, message: 'Login successful.', user: userWithoutPassword };
    }
);


// Exported functions to be called from the frontend
export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  return createUserFlow(input);
}

export async function loginUser(input: LoginUserInput): Promise<LoginUserOutput> {
    return loginUserFlow(input);
}
