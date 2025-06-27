import { ArtGenerator } from '@/components/art-generator';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <>
      <header className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </header>
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Imaginoir</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Unleash your creativity. Transform simple text prompts into stunning, one-of-a-kind abstract art with the power of generative AI.
          </p>
        </div>
        <ArtGenerator />
      </main>
    </>
  );
}
