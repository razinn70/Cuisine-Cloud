"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRecipe, GeneratedRecipe } from "@/ai/flows/generate-recipe-flow";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  ingredients: z.string().min(5, "Please list at least one ingredient."),
  preferences: z.string().optional(),
});

export default function GenerateRecipePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      preferences: "quick and easy",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedRecipe(null);

    try {
      const result = await generateRecipe({
        ingredients: values.ingredients,
        preferences: values.preferences || 'any style',
      });
      setGeneratedRecipe(result);
       toast({
        title: "Recipe Generated!",
        description: "Your new recipe is ready below.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a recipe. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-accent flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              AI Recipe Generator
            </CardTitle>
            <CardDescription>
              Got random ingredients? Let our AI chef whip up a recipe for you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Ingredients</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., chicken breast, rice, broccoli, soy sauce" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferences</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., healthy, vegan, 30-minute meal" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                     <>
                      <ChefHat className="mr-2 h-4 w-4" />
                       Generate Recipe
                     </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
            <Card className="mt-8">
                <CardContent className="p-6">
                   <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="font-medium">Our AI chef is thinking...</p>
                    <p className="text-sm text-center">This can take up to 30 seconds. Please wait.</p>
                   </div>
                </CardContent>
            </Card>
        )}

        {generatedRecipe && (
          <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-accent">{generatedRecipe.title}</CardTitle>
                <CardDescription>{generatedRecipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-around my-4 p-4 bg-secondary rounded-lg">
                    <div className="text-center">
                        <p className="font-bold text-lg">{generatedRecipe.cookTime}</p>
                        <p className="text-sm text-muted-foreground">Cook Time</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg">{generatedRecipe.servings}</p>
                        <p className="text-sm text-muted-foreground">Servings</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-5 gap-8 my-6">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-headline mb-4">Ingredients</h3>
                        <ul className="space-y-2">
                            {generatedRecipe.ingredients.map((ing, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-primary mr-2 mt-1">&#10003;</span>
                                    <div>
                                    <span className="font-semibold">{ing.name}</span>
                                    {ing.quantity && ` - ${ing.quantity}`}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                         <h3 className="text-xl font-headline mb-4">Instructions</h3>
                        <ol className="space-y-4">
                            {generatedRecipe.instructions.map((step, index) => (
                            <li key={index} className="flex">
                                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm flex items-center justify-center font-bold mr-4 flex-shrink-0 mt-1">
                                {index + 1}
                                </span>
                                <p className="flex-1">{step}</p>
                            </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h3 className="text-xl font-headline mb-4">Nutritional Information (Estimated)</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-secondary p-3 rounded-lg">
                            <p className="font-bold text-lg">{generatedRecipe.nutrition.calories}</p>
                            <p className="text-sm text-muted-foreground">Calories</p>
                        </div>
                         <div className="bg-secondary p-3 rounded-lg">
                            <p className="font-bold text-lg">{generatedRecipe.nutrition.protein}</p>
                            <p className="text-sm text-muted-foreground">Protein</p>
                        </div>
                         <div className="bg-secondary p-3 rounded-lg">
                            <p className="font-bold text-lg">{generatedRecipe.nutrition.carbs}</p>
                            <p className="text-sm text-muted-foreground">Carbs</p>
                        </div>
                         <div className="bg-secondary p-3 rounded-lg">
                            <p className="font-bold text-lg">{generatedRecipe.nutrition.fat}</p>
                            <p className="text-sm text-muted-foreground">Fat</p>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
