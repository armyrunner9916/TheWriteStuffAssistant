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
import Footer from "@/components/ui/Footer";

// Which query_type values belong to each section (legacy + unified)
const SECTION_TO_QUERY_TYPES = {
  prose: [
    'fictional_prose_unified',
    'world_building',
    'character_development',
    'style_enhancement',
    'story_outline',
  ],
  poetry: [
    'poetry_unified',
    'poetry_form_structure',
    'poetry_language_imagery',
    'poetry_rhyme_rhythm',
    'poetry_style_voice',
  ],
  nonfiction: [
    'nonfiction_unified',
    'research_fact_checking',
    'organization_structure',
    'voice_tone_development',
    'clarity_conciseness',
    'engaging_openings_conclusions',
  ],
  content: [
    'content_creation_unified',
    'audience_platform_strategy',
    'content_idea_generation',
    'scripting_storyboarding',
    'filming_production_tips',
    'posting_optimization_growth',
  ],
  songwriting: [
    'songwriting_unified',
    'theme_concept_development',
    'lyrics_wordcraft',
    'melody_hook_creation',
    'song_structure_arrangement',
    'style_genre_performance_tips',
  ],
  stage: [
    'stage_screen_unified',
    'scene_structure_pacing',
    'dialogue_crafting',
    'character_arcs_dynamics',
    'visual_staging_suggestions',
  ],
  // just in case your route uses "stage_screen" instead of "stage"
  stage_screen: [
    'stage_screen_unified',
    'scene_structure_pacing',
    'dialogue_crafting',
    'character_arcs_dynamics',
    'visual_staging_suggestions',
  ],
};

// (Optional) nice labels for grouping in the UI
const QUERYTYPE_TO_LABEL = {
  // Prose
  world_building: 'World Building',
  character_development: 'Character Development',
  style_enhancement: 'Style Enhancement',
  story_outline: 'Story Outline',

  // Poetry
  poetry_form_structure: 'Form & Structure',
  poetry_language_imagery: 'Language & Imagery',
  poetry_rhyme_rhythm: 'Rhyme & Rhythm',
  poetry_style_voice: 'Style & Voice',

  // Nonfiction
  research_fact_checking: 'Research & Fact-Checking',
  organization_structure: 'Organization & Structure',
  voice_tone_development: 'Voice & Tone',
  clarity_conciseness: 'Clarity & Conciseness',
  engaging_openings_conclusions: 'Engaging Openings & Conclusions',

  // Content
  audience_platform_strategy: 'Audience & Platform Strategy',
  content_idea_generation: 'Content Idea Generation',
  scripting_storyboarding: 'Scripting & Storyboarding',
  filming_production_tips: 'Filming & Production Tips',
  posting_optimization_growth: 'Posting, Optimization & Growth',

  // Songwriting
  theme_concept_development: 'Theme & Concept Development',
  lyrics_wordcraft: 'Lyrics & Wordcraft',
  melody_hook_creation: 'Melody & Hook Creation',
  song_structure_arrangement: 'Song Structure & Arrangement',
  style_genre_performance_tips: 'Style, Genre & Performance Tips',

  // Stage & Screen
  scene_structure_pacing: 'Scene Structure & Pacing',
  dialogue_crafting: 'Dialogue Crafting',
  character_arcs_dynamics: 'Character Arcs & Dynamics',
  visual_staging_suggestions: 'Visual & Staging Suggestions',

  // Unified label (shown if you want)
  fictional_prose_unified: 'Unified Prompt',
  poetry_unified: 'Unified Prompt',
  nonfiction_unified: 'Unified Prompt',
  content_creation_unified: 'Unified Prompt',
  songwriting_unified: 'Unified Prompt',
  stage_screen_unified: 'Unified Prompt',
};

const labelFor = qt => QUERYTYPE_TO_LABEL[qt] || qt;

// Clean text function to remove metadata and form labels
function cleanHistoryText(text) {
  if (!text) return '';
  
  return text
    // Convert metadata sections to proper Markdown
    .replace(/^\*\*Output Type Requested:\*\*(.*?)$/gm, '**Request:** $1')
    .replace(/^Output Type Requested:(.*?)$/gm, '**Request:**$1')
    .replace(/^\*\*Creative Parameters:\*\*$/gm, '**Parameters:**')
    .replace(/^Creative Parameters:$/gm, '**Parameters:**')
    
    // Convert bullet points with labels to proper Markdown
    .replace(/^- \*\*([^:]+):\*\* (.+)$/gm, '- **$1:** $2')
    
    // Convert form labels to proper Markdown format
    .replace(/^Genre: (.+)$/gm, '**Genre:** $1')
    .replace(/^Tone: (.+)$/gm, '**Tone:** $1')
    .replace(/^Setting: (.+)$/gm, '**Setting:** $1')
    .replace(/^Theme: (.+)$/gm, '**Theme:** $1')
    .replace(/^Length: (.+)$/gm, '**Length:** $1')
    .replace(/^Format: (.+)$/gm, '**Format:** $1')
    .replace(/^Audience: (.+)$/gm, '**Audience:** $1')
    .replace(/^Platform: (.+)$/gm, '**Platform:** $1')
    .replace(/^Budget: (.+)$/gm, '**Budget:** $1')
    .replace(/^Premise: (.+)$/gm, '**Premise:** $1')
    .replace(/^Character: (.+)$/gm, '**Character:** $1')
    .replace(/^Story idea: (.+)$/gm, '**Story Idea:** $1')
    .replace(/^Story Idea \/ Premise: (.+)$/gm, '**Story Premise:** $1')
    .replace(/^Research question: (.+)$/gm, '**Research Question:** $1')
    .replace(/^Target audience: (.+)$/gm, '**Target Audience:** $1')
    .replace(/^Content theme: (.+)$/gm, '**Content Theme:** $1')
    .replace(/^Rhyme scheme: (.+)$/gm, '**Rhyme Scheme:** $1')
    .replace(/^Poetry style: (.+)$/gm, '**Poetry Style:** $1')
    .replace(/^Meter: (.+)$/gm, '**Meter:** $1')
    .replace(/^Medium: (.+)$/gm, '**Medium:** $1')
    .replace(/^Dialogue style: (.+)$/gm, '**Dialogue Style:** $1')
    .replace(/^Visual preferences: (.+)$/gm, '**Visual Preferences:** $1')
    .replace(/^Main character: (.+)$/gm, '**Main Character:** $1')
    .replace(/^Main Character Traits: (.+)$/gm, '**Main Character Traits:** $1')
    .replace(/^Setting details: (.+)$/gm, '**Setting Details:** $1')
    .replace(/^Desired tone: (.+)$/gm, '**Desired Tone:** $1')
    .replace(/^Target length: (.+)$/gm, '**Target Length:** $1')
    .replace(/^Story premise: (.+)$/gm, '**Story Premise:** $1')
    
    // Convert other bullet points with labels to proper Markdown
    .replace(/^• ([A-Za-z\s]+): (.+)$/gm, '- **$1:** $2')
    
    // Clean up follow-up sections
    .replace(/--- Follow-ups ---[\s\S]*$/g, '')
    
    // Normalize spacing - reduce excessive whitespace but keep proper paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const sectionTitles = {
  'prose': 'Fictional Prose History',
  'poetry': 'Poetry History',
  'nonfiction': 'Nonfiction History',
  'content': 'Content Creation History',
  'songwriting': 'Songwriting History',
  'stage': 'Stage & Screen History',
};

const sectionPaths = {
  'prose': '/prose',
  'poetry': '/poetry',
  'nonfiction': '/nonfiction',
  'content': '/online-content',
  'songwriting': '/songwriting',
  'stage': '/stage-screen',
};

function UnifiedHistory() {
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
        // Pick all query_type values that belong to the current section
        const allowedTypes =
          SECTION_TO_QUERY_TYPES[section] ||
          [section, `${section}_unified`]; // safe fallback

        const { data, error } = await supabase
          .from('query_history')
          .select('id, user_id, query_type, query_text, response_text, created_at, conversation_id, conversation_history, updated_at')
          .eq('user_id', user.id)
          .in('query_type', allowedTypes)
          .or('is_thread_root.eq.true,is_thread_root.is.null')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Normalize into the shape your UI expects
        const rows = (data || []).map((r) => ({
          ...r,
          subcategory: labelFor(r.query_type), // for grouping/labels
          // If your renderer expects prompt_md/response_md, map here:
          prompt_md: cleanHistoryText(r.query_text),
          response_md: cleanHistoryText(r.response_text),
          // Store the full conversation history for display
          fullConversation: r.conversation_history || null,
        }));

        setHistory(rows);
      } catch (error) {
        console.error('History fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch history: ' + error.message,
          variant: 'destructive',
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // include user.id so it refetches when auth changes
  }, [user?.id, section, toast]);

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
    let content = '';

    // If conversation_history exists, use it for the full conversation
    if (entry.fullConversation && entry.fullConversation.length > 0) {
      entry.fullConversation.forEach((turn, index) => {
        if (turn.role === 'user') {
          content += `**User Query ${Math.floor(index / 2) + 1}:**\n${turn.content}\n\n`;
        } else {
          content += `**Assistant Response:**\n${turn.content}\n\n---\n\n`;
        }
      });
    } else {
      // Fallback to old format if conversation_history doesn't exist
      content = `**Prompt:**\n${entry.prompt_md}\n\n**Response:**\n${entry.response_md}`;
    }

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

  const handleBack = () => navigate(sectionPaths[section] || '/dashboard');
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
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 hover:text-yellow-400 border-yellow-400/50 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleHome}
                variant="outline"
                size="sm"
                className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 hover:text-yellow-400 border-yellow-400/50 font-medium"
              >
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
                return (
                  <Card key={item.id} className="bg-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 text-sm">
                        {new Date(item.created_at).toLocaleString()}
                      </CardTitle>
                      <CardDescription className="text-yellow-400/60 line-clamp-3 text-xs">
                        {cleanHistoryText(item.query_text).substring(0, 150) + '...'}
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
                {selectedEntry.fullConversation && selectedEntry.fullConversation.length > 0 ? (
                  // Display full conversation history
                  <div className="space-y-4">
                    {selectedEntry.fullConversation.map((turn, index) => (
                      <div key={index}>
                        {turn.role === 'user' ? (
                          <>
                            <h4 className="font-bold mt-4 mb-2 text-yellow-300">
                              {index === 0 ? 'Initial Prompt:' : `Follow-up ${Math.floor(index / 2)}:`}
                            </h4>
                            <div className="text-sm p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                              <MarkdownRenderer markdownText={cleanHistoryText(turn.content)} />
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="font-bold mt-4 mb-2 text-yellow-300">Response:</h4>
                            <div className="prose prose-sm prose-invert prose-p:text-yellow-400/90 prose-headings:text-yellow-400 prose-strong:text-yellow-300 prose-ul:text-yellow-400/90 prose-ol:text-yellow-400/90 max-w-none p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                              <MarkdownRenderer markdownText={cleanHistoryText(turn.content)} />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback to old format if no conversation_history
                  <>
                    <h4 className="font-bold mt-4 mb-2 text-yellow-300">Prompt:</h4>
                    <div className="text-sm p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                      <MarkdownRenderer markdownText={selectedEntry.prompt_md} />
                    </div>
                    <h4 className="font-bold mt-4 mb-2 text-yellow-300">Response:</h4>
                    <div className="prose prose-sm prose-invert prose-p:text-yellow-400/90 prose-headings:text-yellow-400 prose-strong:text-yellow-300 prose-ul:text-yellow-400/90 prose-ol:text-yellow-400/90 max-w-none p-3 bg-zinc-900 rounded-md border border-yellow-400/20">
                      <MarkdownRenderer markdownText={selectedEntry.response_md} />
                    </div>
                  </>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Footer showSubscription={false} />
      </div>
    </>
  );
}

export default UnifiedHistory;