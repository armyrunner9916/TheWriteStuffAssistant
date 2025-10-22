import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Sparkles, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { makeClaudeDemoRequest, getSystemPrompt, canMakeDemoQuery, getDemoQueriesRemaining } from "@/lib/demo-api";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import DemoLayout from "@/components/DemoLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

const QUERY_TYPE = "poetry_unified";
const SECTION_TITLE = "Poetry Assistant (Demo)";

const STEP1_OPTIONS = [
  { value: "poem", label: "Poem" },
  { value: "imagery", label: "Imagery suggestions" },
  { value: "rhyme_meter", label: "Rhyme/Meter guidance" },
  { value: "style_tone", label: "Style/Tone suggestions" },
  { value: "all", label: "All of the above" }
];

const fieldConfig = {
  poem: ["premise", "theme", "tone", "length", "rhymeScheme", "poetryStyle", "meter"],
  imagery: ["premise", "theme", "tone"],
  rhyme_meter: ["rhymeScheme", "meter", "poetryStyle", "premise"],
  style_tone: ["tone", "poetryStyle", "premise"],
  all: ["premise", "theme", "tone", "length", "rhymeScheme", "poetryStyle", "meter"],
};

function DemoPoetry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [outputType, setOutputType] = useState("");
  const [formData, setFormData] = useState({
    premise: "",
    theme: "",
    tone: "",
    length: "",
    rhymeScheme: "",
    poetryStyle: "",
    meter: "",
  });
  const [followUp, setFollowUp] = useState("");
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
        const prompt = await getSystemPrompt(QUERY_TYPE);
        setSystemPrompt(prompt);
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
    
    let prompt = `Generate ${selectedOption?.label || outputType}.`;
    
    const details = [];
    visibleFields.forEach(field => {
      const value = formData[field]?.trim();
      if (value) {
        switch(field) {
          case 'premise': details.push(`Premise: ${value}`); break;
          case 'theme': details.push(`Theme: ${value}`); break;
          case 'tone': details.push(`Tone: ${value}`); break;
          case 'length': details.push(`Length: ${value}`); break;
          case 'rhymeScheme': details.push(`Rhyme scheme: ${value}`); break;
          case 'poetryStyle': details.push(`Style: ${value}`); break;
          case 'meter': details.push(`Meter: ${value}`); break;
        }
      }
    });
    
    if (details.length > 0) {
      prompt += `\n\n${details.join('\n')}`;
    }
    
    return prompt;
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

    if (!canMakeDemoQuery()) {
      toast({
        title: "Demo Limit Reached",
        description: "Sign up to continue using all features!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConversation([]);

    const userPrompt = buildUserPrompt();

    try {
      const messagesForApi = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
      const responseText = await makeClaudeDemoRequest(messagesForApi);
      const newConversation = [
        { role: "user", content: userPrompt },
        { role: "assistant", content: responseText },
      ];
      setConversation(newConversation);
      
      toast({
        title: "Success!",
        description: `Your poetry has been generated. ${getDemoQueriesRemaining()} queries remaining.`,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      if (error.message.includes('Demo query limit reached')) {
        toast({
          title: "Demo Limit Reached",
          description: "Sign up to continue using all features!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
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

    if (!canMakeDemoQuery()) {
      toast({
        title: "Demo Limit Reached",
        description: "Sign up to continue using all features!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const currentConversation = [...conversation, { role: "user", content: followUp }];
    setConversation(currentConversation);
    setFollowUp("");

    try {
      const messagesForApi = [
        { role: "system", content: systemPrompt },
        ...currentConversation.map(turn => ({ role: turn.role, content: turn.content })),
      ];

      const responseText = await makeClaudeDemoRequest(messagesForApi);
      const newConversation = [...currentConversation, { role: "assistant", content: responseText }];
      setConversation(newConversation);
      
      toast({ 
        title: "Success!", 
        description: `Follow-up response generated. ${getDemoQueriesRemaining()} queries remaining.` 
      });
    } catch (error) {
      console.error("Error generating follow-up:", error);
      if (error.message.includes('Demo query limit reached')) {
        toast({
          title: "Demo Limit Reached",
          description: "Sign up to continue using all features!",
          variant: "destructive",
        });
      } else {
        toast({ 
          title: "Generation Error", 
          description: error.message || "An unexpected error occurred.", 
          variant: "destructive" 
        });
      }
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
    <DemoLayout>
      <Helmet>
        <title>{SECTION_TITLE} | The Write Stuff</title>
        <meta name="description" content="Try our poetry writing tools - no signup required!" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-black text-yellow-400 p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <Button onClick={() => navigate("/demo")} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Demo
            </Button>
          </header>
          
          <h1 className="text-center text-3xl sm:text-4xl font-bold mb-2 text-yellow-400">{SECTION_TITLE}</h1>
          <p className="text-center text-yellow-400/80 mb-8">Try our modular tool for crafting powerful poetry.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/50 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-2xl">Create Your Poem</CardTitle>
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
                        {STEP1_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {outputType && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.2}} className="space-y-4">
                      <Label className="text-yellow-400 font-bold text-base">Step 2: Add optional details</Label>
                      {renderField("premise", "Premise / Idea", "e.g., A fleeting memory of a childhood summer", true)}
                      {renderField("theme", "Imagery or Theme", "e.g., Nature, love, grief")}
                      {renderField("tone", "Voice or Tone", "e.g., Melancholic, playful, formal")}
                      {renderField("length", "Desired length", "e.g., 14 lines, three stanzas")}
                      {renderField("rhymeScheme", "Rhyme scheme", "e.g., ABAB, AABB, free verse")}
                      {renderField("poetryStyle", "Poetry style/form", "e.g., Sonnet, Haiku, Limerick")}
                      {renderField("meter", "Meter", "e.g., Iambic pentameter, trochaic tetrameter")}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={isLoading || promptLoading || !outputType || !canMakeDemoQuery()} className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50">
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
                        conversation.map((turn, index) => {
                          if (turn.role === 'user') return null;
                          return (
                            <div key={index} className="p-3 rounded-lg bg-transparent">
                              <MarkdownRenderer markdownText={turn.content} />
                            </div>
                          );
                        })
                     ) : isLoading ? (
                       <div className="flex items-center justify-center h-full">
                         <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-full text-center text-yellow-400/60 p-8">
                         <p>Select an element to generate and your poem will appear here.</p>
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
                          placeholder="e.g., Can you make the third stanza more hopeful?"
                          className="flex-grow"
                          minRows={1}
                        />
                        <Button type="submit" disabled={isLoading || !canMakeDemoQuery()} className="bg-yellow-400 text-black hover:bg-yellow-500">
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
    </DemoLayout>
  );
}

export default DemoPoetry;