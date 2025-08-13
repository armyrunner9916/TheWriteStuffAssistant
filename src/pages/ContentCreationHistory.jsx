import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Download, Trash2, Eye } from "lucide-react";
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
import { saveAsDocx } from '@/lib/docx';
import { cleanHistoryEntry } from "@/lib/utils";

const ContentCreationHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const contentCreationCategories = [
    'audience_platform_strategy',
    'content_idea_generation',
    'scripting_storyboarding',
    'filming_production_tips',
    'posting_optimization_growth',
    'content_creation_unified'
  ];
  const categoryLabels = {
    audience_platform_strategy: 'Audience & Platform Strategy',
    content_idea_generation: 'Content Idea Generation',
    scripting_storyboarding: 'Scripting & Storyboarding',
    filming_production_tips: 'Filming & Production Tips',
    posting_optimization_growth: 'Posting, Optimization & Growth',
    content_creation_unified: 'Content Creation Assistant'
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("query_history")
          .select("*")
          .in("query_type", contentCreationCategories)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const grouped = data.reduce((acc, item) => {
          const category = item.query_type;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});
        
        setHistory(grouped);

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, toast]);
  
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("query_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
      
      const newHistory = { ...history };
      for (const category in newHistory) {
         if (Array.isArray(newHistory[category])) {
            newHistory[category] = newHistory[category].filter(item => item.id !== id);
            if (newHistory[category].length === 0) {
                delete newHistory[category];
            }
        }
      }
      setHistory(newHistory);
      toast({ title: "Success", description: "History entry deleted." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = (entry) => {
    const { prompt, response } = cleanHistoryEntry(entry.query_text, entry.response_text);
    const content = `**Prompt:**\n${prompt}\n\n**Response:**\n${response}`;
    const title = `ContentCreation_${new Date(entry.created_at).toLocaleDateString()}`;
    saveAsDocx(content, title);
  };

  const renderHistory = (items) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
         const isUnified = item.query_type === 'content_creation_unified';
         const { prompt } = cleanHistoryEntry(item.query_text, item.response_text);
         const followUpCount = (prompt.match(/Follow-up/g) || []).length;
         const description = prompt.split('\n\n')[0].replace('**Initial Prompt:**\n', '');

         return (
          <Card key={item.id} className="bg-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-yellow-400 truncate">
                {isUnified ? 'Conversation' : 'Query'} from {new Date(item.created_at).toLocaleString()}
              </CardTitle>
              <CardDescription className="text-yellow-400/60 line-clamp-2 pt-2">
                {description}
                {followUpCount > 0 && <span className="text-yellow-400/80 font-bold block mt-1">
                    (and {followUpCount} follow-up{followUpCount > 1 ? 's' : ''})
                </span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(item)}>
                <Eye className="h-4 w-4 text-yellow-400"/>
              </Button>
               <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                <Download className="h-4 w-4 text-yellow-400"/>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this history entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
      )})}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Content Creation History | The Write Stuff</title>
        <meta name="description" content="Review your past generations from the Content Creation tools." />
      </Helmet>
      <div className="min-h-screen bg-black text-yellow-400 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <Button onClick={() => navigate("/online-content")} variant="outline" className="bg-black text-yellow-400 border-yellow-400 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Creation Tool
            </Button>
            <h1 className="text-3xl font-bold text-yellow-400">Content Creation History</h1>
            <div />
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
            </div>
          ) : Object.keys(history).length === 0 ? (
            <div className="text-center text-yellow-400/70">
              <p>You have no history for the Content Creation section yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(history).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-2xl font-semibold text-yellow-300 mb-4 border-b border-yellow-400/30 pb-2">{categoryLabels[category]}</h2>
                  {renderHistory(items)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <AlertDialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <AlertDialogContent className="max-w-3xl bg-black text-yellow-400 border-yellow-400/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-yellow-400">History Details</AlertDialogTitle>
                     <AlertDialogDescription className="text-yellow-400/70 pt-2">
                        <span className="font-bold">Date:</span> {new Date(selectedEntry.created_at).toLocaleString()}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <h4 className="font-bold mt-4 mb-2 text-yellow-300">Prompt:</h4>
                    <div className="text-sm p-3 bg-zinc-900 rounded-md whitespace-pre-wrap">
                      <MarkdownRenderer markdownText={cleanHistoryEntry(selectedEntry.query_text, selectedEntry.response_text).prompt} />
                    </div>
                    <h4 className="font-bold mt-4 mb-2 text-yellow-300">Response:</h4>
                    <div className="prose prose-sm prose-invert prose-p:text-yellow-400/90 prose-headings:text-yellow-400 prose-strong:text-yellow-300 prose-ul:text-yellow-400/90 prose-ol:text-yellow-400/90 max-w-none">
                         <MarkdownRenderer markdownText={cleanHistoryEntry(selectedEntry.query_text, selectedEntry.response_text).response} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ContentCreationHistory;
