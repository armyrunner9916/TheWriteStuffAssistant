import React from "react";
    import { useNavigate, useParams } from "react-router-dom";
    import { Button } from "@/components/ui/button";
    import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
    import { ArrowLeft, Home, Download, Copy } from "lucide-react";
    import { supabase } from "@/lib/supabase";
    import { useToast } from "@/components/ui/use-toast";
    import { useQueries } from "@/lib/hooks/useQueries";
    import SubscriptionDialog from "@/components/SubscriptionDialog";
    import DownloadOutputDialog from "@/components/DownloadOutputDialog";
    import MarkdownRenderer from "@/components/MarkdownRenderer";

    const sectionTitles = {
      'world_building': 'World Building History',
      'character_development': 'Character Development History',
      'style_enhancement': 'Style Enhancement History',
      'story_outline': 'Story Outline History',
      'brainstorming': 'Brainstorming History',
      'poetry_form_structure': 'Poetry Form & Structure History',
      'poetry_language_imagery': 'Poetry Language & Imagery History',
      'poetry_rhyme_rhythm': 'Poetry Rhyme & Rhythm History',
      'poetry_style_voice': 'Poetry Style & Voice History',
      'poetry_revision_clarity': 'Poetry Revision & Clarity History',
      'scene_structure_pacing': 'Scene Structure & Pacing History',
      'dialogue_crafting': 'Dialogue Crafting History',
      'character_arcs_dynamics': 'Character Arcs & Dynamics History',
      'visual_staging_suggestions': 'Visual & Staging Suggestions History',
      'genre_formatting_conventions': 'Genre Formatting & Conventions History',
      'research_fact_checking': 'Research & Fact-Checking History',
      'organization_structure': 'Organization & Structure History',
      'voice_tone_development': 'Voice & Tone Development History',
      'clarity_conciseness': 'Clarity & Conciseness History',
      'engaging_openings_conclusions': 'Engaging Openings & Conclusions History',
      'audience_platform_strategy': 'Audience & Platform Strategy History',
      'content_idea_generation': 'Content Idea Generation History',
      'scripting_storyboarding': 'Scripting & Storyboarding History',
      'filming_production_tips': 'Filming & Production Tips History',
      'posting_optimization_growth': 'Posting, Optimization & Growth History',
      'theme_concept_development': 'Theme & Concept Development History',
      'lyrics_wordcraft': 'Lyrics & Wordcraft History',
      'melody_hook_creation': 'Melody & Hook Creation History',
      'song_structure_arrangement': 'Song Structure & Arrangement History',
      'style_genre_performance_tips': 'Style, Genre & Performance Tips History',
    };

    function HistoryPage() {
      const navigate = useNavigate();
      const { section } = useParams();
      const { toast } = useToast();
      const [history, setHistory] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
      const { isTrialExpired, isSubscribed, isAdmin } = useQueries();
      const [showSubscriptionDialog, setShowSubscriptionDialog] = React.useState(false);
      const [isDownloadDialogOpen, setIsDownloadDialogOpen] = React.useState(false);
      const [selectedHistoryItemContent, setSelectedHistoryItemContent] = React.useState("");
      const [selectedHistoryItemType, setSelectedHistoryItemType] = React.useState("");
      const [selectedHistoryItemDate, setSelectedHistoryItemDate] = React.useState("");


      React.useEffect(() => {
        fetchHistory();
      }, [section, isTrialExpired, isSubscribed, isAdmin]);

      React.useEffect(() => {
        document.title = sectionTitles[section] ? `TWS - ${sectionTitles[section]}` : "TWS - History";
      }, [section]);

      const fetchHistory = async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user found");

          const { data, error } = await supabase
            .from('query_history')
            .select('*')
            .eq('user_id', user.id)
            .eq('query_type', section)
            .order('created_at', { ascending: false });

          if (error) throw error;
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

      const handleBack = () => navigate(-1);
      const handleHome = () => navigate('/dashboard');

      const handleCopyToClipboard = (textToCopy, type = "Full Interaction") => {
        navigator.clipboard.writeText(textToCopy)
          .then(() => toast({ title: "Copied!", description: `${type} copied to clipboard.` }))
          .catch(err => toast({ title: "Error", description: "Failed to copy text.", variant: "destructive" }));
      };

      const openDownloadDialog = (item, contentToDownload, type = "full") => {
        let defaultFilename;
        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        if (type === "prompt") {
            defaultFilename = `${item.query_type}_prompt_${itemDate}.txt`;
            setSelectedHistoryItemContent(`Your Prompt:\n${item.query_text}`);
        } else if (type === "response") {
            defaultFilename = `${item.query_type}_response_${itemDate}.txt`;
            setSelectedHistoryItemContent(`AI Response:\n${item.response_text}`);
        } else { // full
            defaultFilename = `${item.query_type}_interaction_${itemDate}.txt`;
            setSelectedHistoryItemContent(`Your Prompt:\n${item.query_text}\n\nAI Response:\n${item.response_text}`);
        }
        
        setSelectedHistoryItemType(item.query_type);
        setSelectedHistoryItemDate(itemDate); // Store date for potential use in dialog or filename
        setIsDownloadDialogOpen(true);
      };

      if (!isAdmin && isTrialExpired && !isSubscribed) {
        return (
          <SubscriptionDialog 
            open={showSubscriptionDialog} 
            onOpenChange={(isOpen) => {
              setShowSubscriptionDialog(isOpen);
              if (!isOpen) navigate('/dashboard'); 
            }} 
          />
        );
      }

      return (
        <div className="min-h-screen p-4 sm:p-6 bg-zinc-900 text-yellow-300">
          <div className="container mx-auto max-w-4xl">
            <header className="flex justify-between items-center mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button onClick={handleBack} className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border-2 border-yellow-400/50 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleHome} className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border-2 border-yellow-400/50 w-full sm:w-auto">
                  <Home className="h-4 w-4 mr-2" /> Home
                </Button>
              </div>
              <div></div>
            </header>

            <Card className="bg-zinc-800/80 backdrop-blur-sm border-yellow-400/30">
              <CardHeader>
                <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">{sectionTitles[section] || 'History'}</h1>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                     <p className="ml-3 text-yellow-400/80">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-center py-4 text-yellow-400/70">No history found for this section.</p>
                ) : (
                  <div className="space-y-6">
                    {history.map((item) => (
                        <Card key={item.id} className="border-yellow-400/30 bg-zinc-900/70">
                          <CardHeader className="pb-3 flex flex-row justify-between items-center">
                            <p className="text-xs sm:text-sm text-yellow-400/60">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(`Your Prompt:\n${item.query_text}\n\nAI Response:\n${item.response_text}`)} className="h-7 w-7 p-1 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200">
                                    <Copy size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDownloadDialog(item, `Your Prompt:\n${item.query_text}\n\nAI Response:\n${item.response_text}`)} className="h-7 w-7 p-1 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200">
                                    <Download size={14} />
                                </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-yellow-400/20 relative group">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-yellow-500 text-sm mb-1">Your Input:</p>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(item.query_text, "Prompt")} className="h-6 w-6 p-1 text-yellow-400 hover:bg-yellow-500/20">
                                        <Copy size={12} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => openDownloadDialog(item, item.query_text, "prompt")} className="h-6 w-6 p-1 text-yellow-400 hover:bg-yellow-500/20">
                                        <Download size={12} />
                                    </Button>
                                </div>
                              </div>
                              <MarkdownRenderer markdownText={item.query_text} />
                            </div>
                            <div className="bg-zinc-800 p-3 sm:p-4 rounded-lg border border-yellow-400/20 relative group">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-yellow-400 text-sm mb-1">AI Response:</p>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(item.response_text, "AI Response")} className="h-6 w-6 p-1 text-yellow-400 hover:bg-yellow-500/20">
                                        <Copy size={12} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => openDownloadDialog(item, item.response_text, "response")} className="h-6 w-6 p-1 text-yellow-400 hover:bg-yellow-500/20">
                                        <Download size={12} />
                                    </Button>
                                </div>
                              </div>
                              <MarkdownRenderer markdownText={item.response_text} />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {isDownloadDialogOpen && (
            <DownloadOutputDialog
              isOpen={isDownloadDialogOpen}
              onOpenChange={setIsDownloadDialogOpen}
              outputToSave={selectedHistoryItemContent}
              queryType={selectedHistoryItemType}
              defaultFilename={`${selectedHistoryItemType}_${selectedHistoryItemDate}.txt`}
            />
          )}
        </div>
      );
    }

    export default HistoryPage;