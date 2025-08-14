import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Download, Trash2, Eye, Home } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cleanHistoryEntry } from "@/lib/utils";

const sectionTitles = {
  'world_building': 'World Building History',
  'character_development': 'Character Development History',
  'style_enhancement': 'Style Enhancement History',
  'story_outline': 'Story Outline History',
  'brainstorming': 'Brainstorming History',
  'fictional_prose_unified': 'Fictional Prose History',
  'poetry_form_structure': 'Poetry Form & Structure History',
  'poetry_language_imagery': 'Poetry Language & Imagery History',
  'poetry_rhyme_rhythm': 'Poetry Rhyme & Rhythm History',
  'poetry_style_voice': 'Poetry Style & Voice History',
  'poetry_revision_clarity': 'Poetry Revision & Clarity History',
  'poetry_unified': 'Poetry History',
  'scene_structure_pacing': 'Scene Structure & Pacing History',
  'dialogue_crafting': 'Dialogue Crafting History',
  'character_arcs_dynamics': 'Character Arcs & Dynamics History',
  'visual_staging_suggestions': 'Visual & Staging Suggestions History',
  'genre_formatting_conventions': 'Genre Formatting & Conventions History',
  'stage_screen_unified': 'Stage & Screen History',
  'research_fact_checking': 'Research & Fact-Checking History',
  'organization_structure': 'Organization & Structure History',
  'voice_tone_development': 'Voice & Tone Development History',
  'clarity_conciseness': 'Clarity & Conciseness History',
  'engaging_openings_conclusions': 'Engaging Openings & Conclusions History',
  'nonfiction_unified': 'Nonfiction History',
  'audience_platform_strategy': 'Audience & Platform Strategy History',
  'content_idea_generation': 'Content Idea Generation History',
  'scripting_storyboarding': 'Scripting & Storyboarding History',
  'filming_production_tips': 'Filming & Production Tips History',
  'posting_optimization_growth': 'Posting, Optimization & Growth History',
  'content_creation_unified': 'Content Creation History',
  'theme_concept_development': 'Theme & Concept Development History',
  'lyrics_wordcraft': 'Lyrics & Wordcraft History',
  'melody_hook_creation': 'Melody & Hook Creation History',
  'song_structure_arrangement': 'Song Structure & Arrangement History',
  'style_genre_performance_tips': 'Style, Genre & Performance Tips History',
  'songwriting_unified': 'Songwriting History',
};

function HistoryPage() {
  const navigate = useNavigate();
  const { section } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('query_history')
          .select('*')
          .eq('user_id', user.id)
          .eq('query_type', section)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        setHistory(data || []);
      } catch (error) {
        console.error('History fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch history: " + error.message,
          variant: "destructive",
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, section, toast]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("query_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({ title: "Success", description: "History entry deleted." });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (entry) => {
    const { prompt, response } = cleanHistoryEntry(entry.query_text, entry.response_text);
    const content = `**Prompt:**\n${prompt}\n\n**Response:**\n${response}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.query_type}_${new Date(entry.created_at).toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: "History entry downloaded successfully." });
  };

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/dashboard');

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center">
        <p>Please sign in to view your history.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{sectionTitles[section] || 'History'} | The Write Stuff</title>
        <meta name="description" content="Review your past generations and conversations." />
      </Helmet>
      <div className="min-h-screen p-4 sm:p-6 bg-black text-yellow-400">
        <div className="container mx-auto max-w-6xl">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button onClick={handleBack} className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border-2 border-yellow-400/50">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button onClick={handleHome} className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border-2 border-yellow-400/50">
                <Home className="h-4 w-4 mr-2" /> Dashboard
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">{sectionTitles[section] || 'History'}</h1>
            <div className="hidden sm:block w-24"></div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
              <p className="ml-3 text-yellow-400">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <Card className="bg-zinc-900/50 border-yellow-400/30">
              <CardContent className="p-8 text-center">
                <p className="text-yellow-400/70 text-lg">No history found for this section yet.</p>
                <p className="text-yellow-400/50 text-sm mt-2">Start using the tools to build your history!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => {
                const { prompt, response } = cleanHistoryEntry(item.query_text, item.response_text);
                const followUpCount = (prompt.match(/Follow-up/g) || []).length;
                const description = prompt.split('\n\n')[0].replace('**Initial Prompt:**\n', '').substring(0, 150) + '...';

                return (
                  <Card key={item.id} className="bg-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 text-sm">
                        {new Date(item.created_at).toLocaleString()}
                      </CardTitle>
                      <CardDescription className="text-yellow-400/60 line-clamp-3 text-xs">
                        {description}
                        {followUpCount > 0 && (
                          <span className="text-yellow-400/80 font-bold block mt-1">
                            (and {followUpCount} follow-up{followUpCount > 1 ? 's' : ''})
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end gap-2 pt-0">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(item)} title="View Details">
                        <Eye className="h-4 w-4 text-yellow-400"/>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} title="Download">
                        <Download className="h-4 w-4 text-yellow-400"/>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black border-yellow-400 text-yellow-400">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-yellow-400/70">
                              This action cannot be undone. This will permanently delete this history entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {selectedEntry && (
          <AlertDialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <AlertDialogContent className="max-w-4xl bg-black text-yellow-400 border-yellow-400/50 max-h-[80vh] overflow-hidden">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-yellow-400">History Details</AlertDialogTitle>
                <AlertDialogDescription className="text-yellow-400/70 pt-2">
                  <span className="font-bold">Date:</span> {new Date(selectedEntry.created_at).toLocaleString()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <h4 className="font-bold mt-4 mb-2 text-yellow-300">Prompt:</h4>
                <div className="text-sm p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                  <MarkdownRenderer markdownText={cleanHistoryEntry(selectedEntry.query_text, selectedEntry.response_text).prompt} />
                </div>
                <h4 className="font-bold mt-4 mb-2 text-yellow-300">Response:</h4>
                <div className="prose prose-sm prose-invert prose-p:text-yellow-400/90 prose-headings:text-yellow-400 prose-strong:text-yellow-300 prose-ul:text-yellow-400/90 prose-ol:text-yellow-400/90 max-w-none p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                  <MarkdownRenderer markdownText={cleanHistoryEntry(selectedEntry.query_text, selectedEntry.response_text).response} />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
}

export default HistoryPage;