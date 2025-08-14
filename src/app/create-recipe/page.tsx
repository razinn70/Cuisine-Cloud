"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createRecipe } from "@/services/recipe";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const recipeFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description is too short."),
  ingredients: z.string().min(1, "Please add at least one ingredient."),
  instructions: z.string().min(1, "Please add instructions."),
  cookTime: z.string().min(1, "Cook time is required."),
  servings: z.string().min(1, "Number of servings is required."),
});

export default function CreateRecipePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof recipeFormSchema>>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
      cookTime: "",
      servings: "",
    },
  });

  async function onSubmit(values: z.infer<typeof recipeFormSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a recipe.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const newRecipe = {
        title: values.title,
        description: values.description,
        cookTime: values.cookTime,
        servings: values.servings,
        ingredients: values.ingredients.split('\n').map(line => {
            const [quantity, ...nameParts] = line.split(' ');
            const name = nameParts.join(' ');
            return { name: name || line, quantity: name ? quantity : '' };
        }),
        instructions: values.instructions.split('\n'),
        imageUrl: 'https://placehold.co/600x400.png',
        nutrition: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fat: 'N/A' }, // Placeholder
        author: user.displayName || "Anonymous",
        authorId: user.uid,
      };
      
      const recipeId = await createRecipe(newRecipe);

      toast({
        title: "Recipe Created!",
        description: "Your delicious recipe has been saved.",
      });
      
      router.push(`/recipe/${recipeId}`);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the recipe. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-headline mb-4">Please Log In</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to create a recipe.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-accent">
            Share Your Culinary Creation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., My Grandma's Famous Lasagna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short and enticing description of your dish."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div> 

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="cookTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cook Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 45 minutes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 4 people" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"List each ingredient on a new line. e.g., '1 cup Flour'"}
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      One ingredient per line, with quantity first (e.g., "1 cup Flour").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide step-by-step instructions."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      One step per line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Recipe
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
