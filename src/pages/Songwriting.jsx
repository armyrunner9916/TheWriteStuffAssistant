import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, History, Loader2, Sparkles, Send, Download } from "lucide-react";
import AuthActionButtons from "@/components/AuthActionButtons";
import { Helmet } from "react-helmet-async";
import { makeClaudeRequest } from "@/lib/api";
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
import Footer from "@/components/ui/Footer";

const SECTION = "songwriting";
const QUERY_TYPE = "songwriting_unified";
const SECTION_TITLE = "Songwriting Assistant";

const STEP1_OPTIONS = [
  { value: "theme", label: "Theme/Concept" },
  { value: "lyrics", label: "Lyrics & Wordcraft" },
  { value: "melody", label: "Melody & Hook" },
  { value: "structure", label: "Structure/Arrangement" },
  { value: "style", label: "Style/Genre & Performance tips" },
  { value: "all", label: "All of the above" }
];

const fieldConfig = {
  theme: ["genre", "theme", "mood"],
  lyrics: ["genre", "theme", "mood", "structure", "length"],
  melody: ["genre", "theme", "mood", "melody"],
  structure: ["genre", "theme", "structure", "length"],
  style: ["genre", "mood", "performanceContext"],
  all: ["genre", "theme", "mood", "length", "structure", "melody", "performanceContext"],
};

function Songwriting({ onLogout }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleQuery } = useQueries();
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [outputType, setOutputType] = useState("");
  const [formData, setFormData] = useState({
    genre: "",
    theme: "",
    mood: "",
    length: "",
    structure: "",
    melody: "",
    performanceContext: "",
  });
  const [followUp, setFollowUp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    if (conversation.length > 0) {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  useEffect(() => {
    const fetchPrompt = async () => {
      setPromptLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_prompts")
          .select("prompt_text")
          .eq("query_type", QUERY_TYPE)
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

  const buildUserPrompt = () => {
    const selectedOption = STEP1_OPTIONS.find(opt => opt.value === outputType);
    const visibleFields = fieldConfig[outputType] || [];

    let prompt = `[FOCUS AREA: ${selectedOption?.label}]\n\n`;
    prompt += `Generate ${selectedOption?.label || outputType}.`;
    
    const details = [];
    visibleFields.forEach(field => {
      const value = formData[field]?.trim();
      if (value) {
        switch(field) {
          case 'genre': details.push(`Genre: ${value}`); break;
          case 'theme': details.push(`Theme: ${value}`); break;
          case 'mood': details.push(`Mood: ${value}`); break;
          case 'length': details.push(`Length: ${value}`); break;
          case 'structure': details.push(`Structure: ${value}`); break;
          case 'melody': details.push(`Melody idea: ${value}`); break;
          case 'performanceContext': details.push(`Performance context: ${value}`); break;
        }
      }
    });
    
    if (details.length > 0) {
      prompt += `\n\n${details.join('\n')}`;
    }
    
    return prompt;
  };

  const saveToHistory = async (promptMd, responseMd, subcategory, sessionId = null, isFollowUp = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const timestamp = new Date().toISOString();

      if (isFollowUp && sessionId) {
        // Update existing row with new conversation turn
        const { data: existing, error: fetchError } = await supabase
          .from('query_history')
          .select('conversation_history, query_text, response_text')
          .eq('conversation_id', sessionId)
          .eq('user_id', user.id)
          .eq('is_thread_root', true)
          .single();

        if (fetchError) throw fetchError;

        const conversationHistory = existing.conversation_history || [
          { role: 'user', content: existing.query_text, timestamp: existing.created_at },
          { role: 'assistant', content: existing.response_text, timestamp: existing.created_at }
        ];

        conversationHistory.push(
          { role: 'user', content: promptMd, timestamp },
          { role: 'assistant', content: responseMd, timestamp }
        );

        const { data, error } = await supabase
          .from('query_history')
          .update({
            conversation_history: conversationHistory,
            updated_at: timestamp
          })
          .eq('conversation_id', sessionId)
          .eq('user_id', user.id)
          .eq('is_thread_root', true)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new thread
        const newSessionId = sessionId || crypto.randomUUID();
        const { data, error } = await supabase
          .from('query_history')
          .insert({
            user_id: user.id,
            query_type: QUERY_TYPE,
            query_text: promptMd,
            response_text: responseMd,
            conversation_id: newSessionId,
            is_thread_root: true,
            conversation_history: [
              { role: 'user', content: promptMd, timestamp },
              { role: 'assistant', content: responseMd, timestamp }
            ]
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving to history:', error);
      return null;
    }
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
    setSessionId(null);

    const userPrompt = buildUserPrompt();
    const selectedOption = STEP1_OPTIONS.find(opt => opt.value === outputType);

    const queryCheckResult = await handleQuery(QUERY_TYPE, userPrompt, "");
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
      const responseText = await makeClaudeRequest(messagesForApi);
      const newConversation = [
        { role: "user", content: userPrompt },
        { role: "assistant", content: responseText },
      ];
      setConversation(newConversation);

      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      await saveToHistory(userPrompt, responseText, selectedOption?.label || outputType, newSessionId);
      
      toast({
        title: "Success!",
        description: "Your song elements have been generated.",
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
    
    const queryCheckResult = await handleQuery(QUERY_TYPE, followUp, "");
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

      const responseText = await makeClaudeRequest(messagesForApi);
      const newConversation = [...currentConversation, { role: "assistant", content: responseText }];
      setConversation(newConversation);

      await saveToHistory(followUp, responseText, "Follow-up", sessionId, true);

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

  const handleDownload = () => {
    if (conversation.length === 0) return;

    let content = '';
    conversation.forEach((turn, index) => {
      if (turn.role === 'user') {
        content += `**User Query ${Math.floor(index / 2) + 1}:**\n${turn.content}\n\n`;
      } else {
        content += `**Assistant Response:**\n${turn.content}\n\n---\n\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `songwriting-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Downloaded", description: "Conversation downloaded successfully." });
  };

  return (
    <>
      <Helmet>
        <title>Songwriting Assistant | The Write Stuff Assistant</title>
        <meta name="description" content="A unified tool to generate song themes, lyrics, melodies, and more." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://writestuffassistant.com/songwriting" />
      </Helmet>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 z-0">
          <img className="object-cover w-full h-full fixed" alt="" role="presentation" src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f" />
          <div className="absolute inset-0 bg-black/60 fixed"></div>
        </div>
        <div className="relative z-10 text-yellow-400 p-4 sm:p-6 lg:px-10 xl:px-16 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl">
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 lg:mb-8">
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
               <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400 lg:h-10 lg:px-4 lg:text-base">
                  <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-1" /> Back to Categories
               </Button>
               <Button onClick={() => navigate(`/songwriting/history`)} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400 lg:h-10 lg:px-4 lg:text-base">
                  <History className="h-4 w-4 lg:h-5 lg:w-5 mr-1" /> View History
                </Button>
            </div>
            <AuthActionButtons onLogout={onLogout} />
          </header>

          <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 lg:mb-4 text-yellow-400">{SECTION_TITLE}</h1>
          <p className="text-center text-yellow-400/80 mb-8 lg:mb-10 lg:text-lg xl:text-xl">Your all-in-one studio for crafting unforgettable songs.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            <Card className="bg-zinc-900/50 border-yellow-400/30">
              <CardHeader className="lg:p-8">
                <CardTitle className="text-yellow-400 text-2xl lg:text-3xl xl:text-4xl">Create Your Song</CardTitle>
              </CardHeader>
              <CardContent className="lg:px-8 lg:pb-8">
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                  <div>
                    <Label className="text-yellow-400 font-bold text-base">Step 1: What would you like to generate?</Label>
                    <Select onValueChange={(value) => { setOutputType(value); setConversation([]); }} value={outputType}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select an element..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP1_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {outputType && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.2}} className="space-y-4">
                      <Label className="text-yellow-400 font-bold text-base">Step 2: Add optional details</Label>
                      {renderField("genre", "Genre/Style", "e.g., Pop, rock, ballad")}
                      {renderField("theme", "Theme/Concept", "The core idea or message", true)}
                      {renderField("mood", "Tone/Mood", "e.g., Upbeat, melancholic, romantic")}
                      {renderField("length", "Desired length", "e.g., 2 verses, 1 chorus")}
                      {renderField("structure", "Structure hints", "e.g., Verse-Chorus-Verse, AABA")}
                      {renderField("melody", "Melody/hook idea", "e.g., A simple, catchy synth line", true)}
                      {renderField("performanceContext", "Performance context", "e.g., Live acoustic, studio recording")}
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
                <CardHeader className="lg:p-8">
                  <CardTitle className="text-yellow-400 text-2xl lg:text-3xl xl:text-4xl">Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col h-[500px] lg:h-[600px] lg:px-8 lg:pb-8">
                   <div className="flex-grow overflow-y-auto pr-4 space-y-4 lg:text-lg">
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
                         <p>Select an element to generate and your song ideas will appear here.</p>
                       </div>
                     )}
                      <div ref={conversationEndRef} />
                   </div>

                  {conversation.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-yellow-400/20 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="followUp" className="font-bold text-yellow-400">Refine or ask a follow-up</Label>
                        <Button
                          type="button"
                          onClick={handleDownload}
                          variant="outline"
                          size="sm"
                          className="bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border-yellow-400/50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <form onSubmit={handleFollowUp} className="flex items-start gap-2">
                        <Textarea
                          id="followUp"
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          placeholder="e.g., Can you make the chorus more powerful?"
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
        <Footer showSubscription={false} />
        </div>
      </div>
    </>
  );
}

export default Songwriting;