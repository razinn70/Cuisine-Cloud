// src/app/create-recipe/page.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createRecipe } from "@/services/recipe";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreateRecipeFormSchema, CreateRecipeFormData, RecipeDifficulty, CuisineType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

// Mock dependency, will be replaced by actual service
const analyzeRecipeNutrition = async (data: any) => {
    return { calories: 350, protein: 30, carbs: 25, fat: 15 };
}

export default function CreateRecipePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateRecipeFormData>({
    resolver: zodResolver(CreateRecipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: RecipeDifficulty.Intermediate,
      cuisine: CuisineType.American,
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      tags: [],
      ingredients: [{ id: uuidv4(), name: "", quantity: 1, unit: "cup" }],
      instructions: ["First step..."],
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  async function onSubmit(values: CreateRecipeFormData) {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }
    setIsLoading(true);

    try {
      // In a real app, this would call a nutrition service
      const calculatedNutrition = await analyzeRecipeNutrition(values);
      
      const newRecipeData = {
        ...values,
        authorId: user.uid,
        nutrition: calculatedNutrition,
        // In a real app, image would be uploaded and URL would be set here
        imageUrl: "https://placehold.co/600x400.png",
      };
      
      const recipeId = await createRecipe(newRecipeData);
      
      toast({ title: "Recipe Created!", description: "Your recipe has been saved." });
      router.push(`/recipe/${recipeId}`);

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-headline mb-4">Please Log In</h1>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-accent">Create a New Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="difficulty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(RecipeDifficulty).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                 <FormField control={form.control} name="cuisine" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(CuisineType).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField control={form.control} name="prepTimeMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="cookTimeMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (min)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="servings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div>
                <FormLabel>Ingredients</FormLabel>
                <div className="space-y-4 mt-2">
                  {ingredientFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField control={form.control} name={`ingredients.${index}.name`} render={({ field }) => (
                        <FormItem className="flex-1"><FormControl><Input placeholder="Ingredient Name" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => (
                        <FormItem className="w-24"><FormControl><Input type="number" placeholder="Qty" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name={`ingredients.${index}.unit`} render={({ field }) => (
                        <FormItem className="w-32"><FormControl><Input placeholder="Unit" {...field} /></FormControl></FormItem>
                      )} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeIngredient(index)}><Trash2 /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ id: uuidv4(), name: "", quantity: 1, unit: "" })}>
                    <PlusCircle className="mr-2" /> Add Ingredient
                  </Button>
                </div>
              </div>
              
              <div>
                <FormLabel>Instructions</FormLabel>
                <div className="space-y-4 mt-2">
                  {instructionFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField control={form.control} name={`instructions.${index}`} render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl><Textarea placeholder={`Step ${index + 1}`} {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeInstruction(index)}><Trash2 /></Button>
                    </div>
                  ))}
                   <Button type="button" variant="outline" size="sm" onClick={() => appendInstruction("")}>
                    <PlusCircle className="mr-2" /> Add Step
                  </Button>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? 'Creating...' : 'Create Recipe'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
