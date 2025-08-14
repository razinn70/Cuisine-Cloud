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
import { Loader2, Sparkles, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const formSchema = z.object({
  dietaryRestrictions: z
    .string()
    .min(3, "Please describe your dietary needs.")
    .max(200, "Please keep your description under 200 characters."),
   file: z.any().optional(),
});

type SmartRecipeToolProps = {
  recipe: Recipe;
};

// Helper function to read file as Data URI
const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export default function SmartRecipeTool({ recipe }: SmartRecipeToolProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);


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
        let fileDataUri: string | undefined = undefined;
        if (uploadedFile) {
            fileDataUri = await readFileAsDataURI(uploadedFile);
        }

      const recipeText = `Title: ${
        recipe.title
      }\n\nIngredients:\n${recipe.ingredients
        .map((i) => `- ${i.quantity} ${i.name}`)
        .join("\n")}\n\nInstructions:\n${recipe.instructions
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join("\n")}`;

      const response = await smartRecipeTool({
        recipe: recipeText,
        fileDataUri: fileDataUri,
        dietaryRestrictions: values.dietaryRestrictions,
      });

      setResult(response.modifiedRecipe);
    } catch (e: any) {
      setError(e.message || "Sorry, we couldn't generate suggestions at this time. Please try again later.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setUploadedFile(file);
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
          Need to adapt this recipe? Let our AI help you find substitutions. You can even upload an image of another recipe to analyze.
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

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Or Upload a Recipe File</FormLabel>
                    <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file-ai" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    { uploadedFile ? (
                                        <>
                                         <FileText className="w-8 h-8 mb-2 text-primary" />
                                         <p className="font-semibold text-sm text-foreground">{uploadedFile.name}</p>
                                         <p className="text-xs text-muted-foreground">{Math.round(uploadedFile.size / 1024)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                         <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                         <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                         <p className="text-xs text-muted-foreground">PNG, JPG, PDF, SVG</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file-ai" type="file" className="hidden" onChange={handleFileChange} accept="image/png,image/jpeg,image/svg+xml,application/pdf" />
                            </label>
                        </div> 
                    </FormControl>
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
