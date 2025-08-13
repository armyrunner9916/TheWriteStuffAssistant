import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, History, Loader2, Sparkles, Send } from "lucide-react";
import AuthActionButtons from "@/components/AuthActionButtons";
import { Helmet } from "react-helmet-async";
import { makeOpenAIRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useQueries } from "@/lib/hooks/useQueries";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

const UNIFIED_PROMPT_QUERY_TYPE = "stage_screen_unified";
const QUERY_TYPE_LABEL = "Stage & Screen Assistant";

const fieldConfig = {
  structure: ["premise", "medium", "genre", "structure", "characters"],
  dialogue: ["premise", "genre", "tone", "characters", "dialogueStyle"],
  characters: ["premise", "genre", "characters"],
  visuals: ["premise", "medium", "genre", "tone", "visuals"],
  all: ["premise", "medium", "genre", "tone", "characters", "structure", "dialogueStyle", "visuals"],
};

function StageScreen({ onLogout }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleQuery } = useQueries();
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [outputType, setOutputType] = useState("");
  const [formData, setFormData] = useState({
    premise: "",
    medium: "",
    genre: "",
    tone: "",
    characters: "",
    structure: "",
    dialogueStyle: "",
    visuals: "",
  });
  const [followUp, setFollowUp] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const conversationEndRef = useRef(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    const fetchPrompt = async () => {
      setPromptLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_prompts")
          .select("prompt_text")
          .eq("query_type", UNIFIED_PROMPT_QUERY_TYPE)
          .single();
        if (error) throw error;
        setSystemPrompt(data.prompt_text);
      } catch (error) {
        console.error("Error fetching system prompt:", error);
        toast({
          title: "Error Loading Tool",
          description: "Could not load the required configuration.",
          variant: "destructive",
        });
      } finally {
        setPromptLoading(false);
      }
    };
    fetchPrompt();
  }, [toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const getFullPromptText = () => {
    const visibleFields = fieldConfig[outputType] || [];
    const promptDetails = visibleFields
      .map(field => {
        const value = formData[field]?.trim();
        if (value) {
          let fieldLabel = '';
          switch(field) {
            case 'premise': fieldLabel = 'Premise/Logline'; break;
            case 'medium': fieldLabel = 'Medium'; break;
            case 'genre': fieldLabel = 'Genre/Style'; break;
            case 'tone': fieldLabel = 'Tone/Mood'; break;
            case 'characters': fieldLabel = 'Primary Characters & Relationships'; break;
            case 'structure': fieldLabel = 'Desired Structure'; break;
            case 'dialogueStyle': fieldLabel = 'Dialogue Style'; break;
            case 'visuals': fieldLabel = 'Visual/Staging Preferences'; break;
            default: fieldLabel = field;
          }
          return `- **${fieldLabel}:** ${value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    return `
      **Output Type Requested:** ${outputType}

      **Creative Parameters:**
      ${promptDetails || "No specific parameters provided. Please use your expertise to generate compelling content."}
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!outputType) {
      toast({
        title: "Selection Required",
        description: "Please select what you would like to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConversation([]);
    setConversationId(null);

    const userPrompt = getFullPromptText();
    setInitialPrompt(userPrompt);

    const queryCheckResult = await handleQuery(UNIFIED_PROMPT_QUERY_TYPE, userPrompt, "");
    if (!queryCheckResult.success) {
      toast({
        title: "Action Denied",
        description: queryCheckResult.reason || "Query limit reached or not subscribed.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const messagesForApi = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
      const responseText = await makeOpenAIRequest(messagesForApi);
      const newConversation = [
        { role: "user", content: userPrompt },
        { role: "assistant", content: responseText },
      ];
      setConversation(newConversation);

      const { data: historyEntry, error } = await handleQuery(UNIFIED_PROMPT_QUERY_TYPE, userPrompt, responseText, true);
      if(error) throw error;
      if (historyEntry) {
        setConversationId(historyEntry.id);
      }
      toast({
        title: "Success!",
        description: "Your script elements have been generated.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUp.trim()) {
      toast({ title: "Input Required", description: "Please enter a follow-up question.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const queryCheckResult = await handleQuery(UNIFIED_PROMPT_QUERY_TYPE, followUp, "");
    if (!queryCheckResult.success) {
      toast({
        title: "Action Denied",
        description: queryCheckResult.reason || "Query limit reached or not subscribed.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const currentConversation = [...conversation, { role: "user", content: followUp }];
    setConversation(currentConversation);
    setFollowUp("");

    try {
      const messagesForApi = [
        { role: "system", content: systemPrompt },
         ...currentConversation.map(turn => ({ role: turn.role, content: turn.content })),
      ];

      const responseText = await makeOpenAIRequest(messagesForApi);
      const newConversation = [...currentConversation, { role: "assistant", content: responseText }];
      setConversation(newConversation);
      
      const fullQueryText = initialPrompt + "\n\n--- Follow-ups ---\n" + newConversation.slice(1).map(c => `${c.role}: ${c.content}`).join('\n');
      const fullResponseText = newConversation.filter(c => c.role === 'assistant').map(c => c.content).join('\n\n---\n\n');

      await handleQuery(UNIFIED_PROMPT_QUERY_TYPE, fullQueryText, fullResponseText, true, conversationId);
      
      toast({ title: "Success!", description: "Follow-up response generated." });
    } catch (error) {
      console.error("Error generating follow-up:", error);
      toast({ title: "Generation Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const renderField = (id, label, placeholder, isTextarea = false) => {
    const isVisible = outputType && (fieldConfig[outputType]?.includes(id) ?? false);
    const Component = isTextarea ? Textarea : Input;
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor={id} className="text-yellow-400">{label}</Label>
            <Component id={id} placeholder={placeholder} value={formData[id]} onChange={handleInputChange} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <Helmet>
        <title>Stage & Screen Assistant | The Write Stuff</title>
        <meta name="description" content="A unified tool for scriptwriting, from scene structure to character arcs." />
        <link rel="canonical" href="https://writestuffassistant.com/stage-screen" />
      </Helmet>
      <div className="min-h-screen bg-black text-yellow-400 p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
               <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Categories
               </Button>
               <Button onClick={() => navigate(`/history/stage-screen`)} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
                  <History className="h-4 w-4 mr-1" /> View History
                </Button>
            </div>
            <AuthActionButtons onLogout={onLogout} />
          </header>
          
          <h1 className="text-center text-3xl sm:text-4xl font-bold mb-2 text-yellow-400">{QUERY_TYPE_LABEL}</h1>
          <p className="text-center text-yellow-400/80 mb-8">Your all-in-one tool for crafting compelling scripts.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/50 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-2xl">Develop Your Script</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-yellow-400 font-bold text-base">Step 1: What would you like to generate?</Label>
                    <Select onValueChange={(value) => { setOutputType(value); setConversation([]); }} value={outputType}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select an element..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="structure">Scene Structure & Pacing</SelectItem>
                        <SelectItem value="dialogue">Dialogue Crafting</SelectItem>
                        <SelectItem value="characters">Character Arcs & Dynamics</SelectItem>
                        <SelectItem value="visuals">Visual & Staging Suggestions</SelectItem>
                        <SelectItem value="all">All of the Above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {outputType && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.2}} className="space-y-4">
                      <Label className="text-yellow-400 font-bold text-base">Step 2: Add optional details</Label>
                      {renderField("premise", "Premise/Logline", "e.g., A detective must solve a murder on a space station.", true)}
                      {renderField("medium", "Medium", "e.g., Theatre, Film, TV Series")}
                      {renderField("genre", "Genre/Style", "e.g., Drama, Comedy, Thriller")}
                      {renderField("tone", "Tone/Mood", "e.g., Lighthearted, Gritty, Suspenseful")}
                      {renderField("characters", "Primary Characters & Relationships", "e.g., Protagonist, Antagonist, Ensemble details", true)}
                      {renderField("structure", "Desired Structure", "e.g., Three-act, Five-act, Episodic")}
                      {renderField("dialogueStyle", "Dialogue Style", "e.g., Naturalistic, Witty, Stylized")}
                      {renderField("visuals", "Visual/Staging Preferences", "e.g., Minimalist, Elaborate, Modern", true)}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={isLoading || promptLoading || !outputType} className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50">
                    {isLoading && conversation.length === 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Selected Elements
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex flex-col">
              <Card className="flex-grow bg-zinc-900/50 border-yellow-400/30 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-2xl">Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col h-[500px]">
                   <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                     {conversation.length > 0 ? (
                       conversation.filter(turn => turn.role === 'assistant').map((turn, index) => (
                         <div key={index} className="p-3 rounded-lg bg-transparent">
                           <MarkdownRenderer markdownText={turn.content} />
                         </div>
                       ))
                     ) : isLoading ? (
                       <div className="flex items-center justify-center h-full">
                         <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-full text-center text-yellow-400/60 p-8">
                         <p>Select an element to generate and your script ideas will appear here.</p>
                       </div>
                     )}
                      <div ref={conversationEndRef} />
                   </div>

                  {conversation.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-yellow-400/20">
                      <Label htmlFor="followUp" className="font-bold text-yellow-400">Refine or ask a follow-up</Label>
                      <form onSubmit={handleFollowUp} className="flex items-start gap-2 mt-2">
                        <Textarea 
                          id="followUp"
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          placeholder="e.g., Can you write the opening scene's dialogue?"
                          className="flex-grow"
                          minRows={1}
                        />
                        <Button type="submit" disabled={isLoading} className="bg-yellow-400 text-black hover:bg-yellow-500">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          <span className="sr-only">Ask Follow-Up</span>
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StageScreen;