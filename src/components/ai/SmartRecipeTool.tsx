"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { smartRecipeTool } from "@/ai/flows/smart-recipe-tool";
import type { Recipe } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const formSchema = z.object({
  dietaryRestrictions: z
    .string()
    .min(3, "Please describe your dietary needs.")
    .max(200, "Please keep your description under 200 characters."),
});

type SmartRecipeToolProps = {
  recipe: Recipe;
};

export default function SmartRecipeTool({ recipe }: SmartRecipeToolProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryRestrictions: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const recipeText = `Title: ${
        recipe.title
      }\n\nIngredients:\n${recipe.ingredients
        .map((i) => `- ${i.quantity} ${i.name}`)
        .join("\n")}\n\nInstructions:\n${recipe.instructions
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join("\n")}`;

      const response = await smartRecipeTool({
        recipe: recipeText,
        dietaryRestrictions: values.dietaryRestrictions,
      });

      setResult(response.modifiedRecipe);
    } catch (e) {
      setError("Sorry, we couldn't generate suggestions at this time. Please try again later.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Sparkles className="w-6 h-6 text-primary" />
          Smart Recipe Tool
        </CardTitle>
        <CardDescription>
          Need to adapt this recipe? Let our AI help you find substitutions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Needs / Available Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., vegan, gluten-free, or 'I only have chicken thighs'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Get Suggestions"
              )}
            </Button>
          </form>
        </Form>

        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="font-headline text-lg mb-2">AI Suggestions:</h3>
            <div className="prose prose-sm max-w-none bg-background/50 rounded-md p-4 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
