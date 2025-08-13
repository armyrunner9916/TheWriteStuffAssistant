import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

function BrainstormingForm({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState("");

  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Horror",
    "Literary Fiction",
    "Historical Fiction",
    "General"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrompt = selectedGenre 
      ? `Genre: ${selectedGenre}\nBrainstorming prompt: ${prompt}`
      : prompt;
    onSubmit(finalPrompt);
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            type="button"
            onClick={() => setSelectedGenre(genre)}
            className={`${
              selectedGenre === genre 
                ? "bg-yellow-400 text-black hover:bg-yellow-500" 
                : "bg-black text-yellow-400 hover:bg-black/80 border-2 border-yellow-400"
            } text-xs sm:text-sm py-1 h-auto min-h-[2.5rem]`}
          >
            {genre}
          </Button>
        ))}
      </div>
      <Textarea
        placeholder="Enter your brainstorming prompt (e.g., 'Help me develop a unique magic system' or 'I need ideas for a plot twist')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px] text-sm sm:text-base"
      />
      <Button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-sm sm:text-base py-2 h-auto"
      >
        {isLoading ? "Generating Ideas..." : "Generate Ideas"}
      </Button>
    </form>
  );
}

export default BrainstormingForm;