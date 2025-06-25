'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateArtAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Copy, X, Paintbrush, Loader2, Sparkles, History, Bot } from 'lucide-react';
import { ArtAnalytics } from './art-analytics';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Please enter a prompt of at least 10 characters.',
  }),
  artisticMovement: z.string().min(1, { message: 'Please select an artistic movement.' }),
  colorMood: z.string().min(1, { message: 'Please select a color mood.' }),
  styleStrength: z.number().optional(),
});

type AnalysisState = {
    textualAnalysis: string;
} | null;

export function ArtGenerator() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [generatedArtUri, setGeneratedArtUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>(null);
  const [currentStyleStrength, setCurrentStyleStrength] = useState(50);
  const [history, setHistory] = useState<string[]>([]);
  const [styleImage, setStyleImage] = useState<{ preview: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      prompt: '',
      artisticMovement: '',
      colorMood: '',
      styleStrength: 50,
    },
  });

  const { isValid } = form.formState;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedArtUri(null);
    setAnalysis(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('prompt', values.prompt);
      if (values.artisticMovement) formData.append('artisticMovement', values.artisticMovement);
      if (values.colorMood) formData.append('colorMood', values.colorMood);
      if (styleImage) {
        formData.append('styleReference', styleImage.data);
        formData.append('styleStrength', currentStyleStrength.toString());
      }

      const result = await generateArtAction(null, formData);

      if (result.success && result.artDataUri) {
        setGeneratedArtUri(result.artDataUri);
        setAnalysis(result.analysis);
        setHistory(prev => [result.artDataUri!, ...prev].slice(0, 5));
      } else {
        const errorMsg = result.error?._server?.[0] || 'Failed to generate art. Please try again.';
        toast({
          variant: 'destructive',
          title: 'Generation Error',
          description: errorMsg,
        });
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setStyleImage({ preview: URL.createObjectURL(file), data: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg transition-shadow duration-300 hover:shadow-glow-primary">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="text-primary"/>
              Create Your Masterpiece
            </CardTitle>
            <CardDescription>Describe the art you want to create and customize its style.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Art Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A cubist painting of a jazz band in a dimly lit room"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="artisticMovement"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Artistic Movement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a movement" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Abstract Expressionism">Abstract Expressionism</SelectItem>
                                <SelectItem value="Cubism">Cubism</SelectItem>
                                <SelectItem value="Surrealism">Surrealism</SelectItem>
                                <SelectItem value="Impressionism">Impressionism</SelectItem>
                                <SelectItem value="Minimalism">Minimalism</SelectItem>
                                <SelectItem value="Futurism">Futurism</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="colorMood"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Color Mood</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a mood" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Vibrant">Vibrant</SelectItem>
                                <SelectItem value="Pastel">Pastel</SelectItem>
                                <SelectItem value="Monochromatic">Monochromatic</SelectItem>
                                <SelectItem value="Earthy">Earthy</SelectItem>
                                <SelectItem value="Neon">Neon</SelectItem>
                                <SelectItem value="Sepia">Sepia</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormItem>
                  <FormLabel className="font-semibold">Style Influence</FormLabel>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  {styleImage ? (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                        <Image src={styleImage.preview} alt="Style reference preview" fill className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => setStyleImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                       <FormField
                        control={form.control}
                        name="styleStrength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Style Strength: {currentStyleStrength}%</FormLabel>
                            <FormControl>
                                <Slider
                                    defaultValue={[50]}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => setCurrentStyleStrength(value[0])}
                                />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2" />
                      Upload Style Image
                    </Button>
                  )}
                </FormItem>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending || !isValid}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                    <Bot className="mr-2"/> Generate Art
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="min-h-[50vh] flex items-center justify-center p-4 shadow-lg transition-shadow duration-300 hover:shadow-glow-primary">
            <div className="w-full aspect-square relative">
              {isPending ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : generatedArtUri ? (
                <Image src={generatedArtUri} alt="Generated abstract art" fill className="object-contain rounded-lg" data-ai-hint="abstract art" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg p-8 text-center">
                  <Paintbrush className="h-16 w-16 mb-4" />
                  <p className="font-semibold text-lg">The canvas awaits your vision.</p>
                  <p className="text-sm mt-1">Describe your idea to bring it to life.</p>
                </div>
              )}
            </div>
          </Card>
          {generatedArtUri && !isPending && (
            <div className="flex justify-center gap-4">
              <a href={generatedArtUri} download="abstract-art.png">
                <Button>
                  <Download className="mr-2" /> Download
                </Button>
              </a>
               <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedArtUri)}>
                  <Copy className="mr-2" /> Copy Data URI
                </Button>
            </div>
          )}
          {analysis && !isPending && (
            <ArtAnalytics analysis={analysis} styleStrength={styleImage ? currentStyleStrength : 0} />
          )}
        </div>
      </div>
      
      {history.length > 0 && (
        <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <History className="text-primary" />
              Your Recent Creations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {history.map((artUri, index) => (
                    <div key={index} className="aspect-square relative group cursor-pointer rounded-lg overflow-hidden shadow-md transition-all hover:shadow-glow-primary hover:scale-105" onClick={() => setGeneratedArtUri(artUri)}>
                        <Image src={artUri} alt={`Generated art ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-semibold">View</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
