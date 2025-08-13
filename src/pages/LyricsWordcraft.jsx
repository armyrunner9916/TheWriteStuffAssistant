import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import { Button } from "@/components/ui/button";
    import { useToast } from "@/components/ui/use-toast";
    import { ArrowLeft, Home, History, Loader2 } from "lucide-react";
    import { makeOpenAIRequest } from "@/lib/api";
    import { supabase } from "@/lib/supabase";
    import { useQueries } from "@/lib/hooks/useQueries";
    import { useConversation } from "@/lib/hooks/useConversation";
    import { useAuth } from "@/lib/hooks/useAuth";
    import AuthActionButtons from "@/components/AuthActionButtons";
    import ChatInterface from "@/components/ChatInterface";
    import { Helmet } from "react-helmet-async";

    const QUERY_TYPE = "lyrics_wordcraft";
    const QUERY_TYPE_LABEL = "Lyrics & Wordcraft";

    function LyricsWordcraft() {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [isLoading, setIsLoading] = useState(false);
      const [systemPrompt, setSystemPrompt] = useState("");
      const [uploadedFile, setUploadedFile] = useState(null);
      const [promptLoading, setPromptLoading] = useState(true);

      const { handleQuery } = useQueries();
      const { 
        conversation, 
        addMessageToConversation, 
        startNewConversation,
      } = useConversation(QUERY_TYPE);
      const { user } = useAuth();

      useEffect(() => {
        startNewConversation();
        const fetchPrompt = async () => {
          setPromptLoading(true);
          try {
            const { data, error } = await supabase
              .from('system_prompts')
              .select('prompt_text')
              .eq('query_type', QUERY_TYPE)
              .single();

            if (error) throw error;
            if (data) {
              setSystemPrompt(data.prompt_text);
            } else {
              throw new Error('Prompt not found. Please ensure it is added to the database.');
            }
          } catch (error) {
            console.error(`Error fetching prompt for ${QUERY_TYPE}:`, error);
            toast({
              title: "Error Loading Tool Configuration",
              description: `Could not load essential configuration. ${error.message}`,
              variant: "destructive",
            });
            setSystemPrompt('');
          } finally {
            setPromptLoading(false);
          }
        };
        if (user) {
          fetchPrompt();
        }
      }, [user, toast, startNewConversation]);


      const handleFileUpload = (file) => {
        if (file) {
          setUploadedFile(file);
          toast({ title: "File Ready", description: `${file.name} is ready to be sent with your next message.` });
        }
      };

      const handlePromptSubmit = async (promptText, file) => {
        if (!promptText.trim() && !file) {
          toast({ title: "Input Required", description: "Please enter your text or upload a file.", variant: "destructive" });
          return;
        }
        if (!systemPrompt && !promptLoading) {
          toast({ title: "Configuration Error", description: "System prompt is missing. Cannot generate.", variant: "destructive" });
          return;
        }

        setIsLoading(true);
        
        let fullPrompt = promptText;
        if (file) {
          try {
            const fileContent = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = (e) => reject(e);
              reader.readAsText(file);
            });
            fullPrompt = `File content: """${fileContent}"""\n\nUser prompt: ${promptText}`;
          } catch (error) {
            toast({ title: "File Read Error", description: "Could not read the uploaded file.", variant: "destructive" });
            setIsLoading(false);
            setUploadedFile(null);
            return;
          }
        }
        
        const userMessage = { sender: "user", text: promptText, file: file ? { name: file.name, type: file.type } : null };
        addMessageToConversation(userMessage);

        const queryCheckResult = await handleQuery(QUERY_TYPE, fullPrompt, "");
        if (!queryCheckResult.success) {
          toast({
            title: "Action Denied",
            description: queryCheckResult.reason || "Query limit reached or not subscribed.",
            variant: "destructive",
          });
          setIsLoading(false);
          setUploadedFile(null);
          return;
        }

        const messagesForAPI = [
          { role: "system", content: systemPrompt },
          ...conversation.filter(msg => msg.role !== 'system').map(msg => ({ 
            role: msg.sender === 'user' ? 'user' : 'assistant', 
            content: msg.file ? `File: ${msg.file.name}\n${msg.text}` : msg.text 
          })),
          { role: "user", content: fullPrompt }
        ];

        try {
          const responseText = await makeOpenAIRequest(messagesForAPI);
          addMessageToConversation({ sender: "ai", text: responseText, role: "assistant" });
          await handleQuery(QUERY_TYPE, fullPrompt, responseText, true);
          toast({ title: "AI Response", description: "Lyric suggestions generated." });
        } catch (error) {
          console.error("API Error:", error);
          toast({ title: "Error", description: error.message || "Failed to get suggestions from AI.", variant: "destructive" });
        } finally {
          setIsLoading(false);
          setUploadedFile(null);
        }
      };

      return (
        <>
        <Helmet>
            <title>Lyrics & Wordcraft Tool | Songwriting | The Write Stuff Assistant</title>
            <meta name="description" content="Craft powerful, memorable lyrics. Use our AI-powered tool to explore imagery, refine word choices, and enhance the emotional impact of your songs." />
            <link rel="canonical" href="https://writestuffassistant.com/lyrics-wordcraft" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content="Lyrics & Wordcraft Tool | Songwriting | The Write Stuff Assistant" />
            <meta property="og:description" content="Craft powerful, memorable lyrics. Use our AI-powered tool to explore imagery, refine word choices, and enhance the emotional impact of your songs." />
            <meta property="og:url" content="https://writestuffassistant.com/lyrics-wordcraft" />
            <meta property="og:image" content="https://images.unsplash.com/photo-1589792933541-12df69326f35?q=80&w=2070&auto=format&fit=crop" />
            <meta property="og:image:alt" content="A feather pen writing on parchment, symbolizing lyrics and wordcraft." />
        </Helmet>
        <div className="flex flex-col min-h-screen bg-black text-yellow-400">
           <header className="p-4 bg-black flex flex-col items-center gap-4 sticky top-0 z-50 border-b border-yellow-400/30">
             <div className="flex gap-2 flex-wrap justify-center items-center">
               <Button onClick={() => navigate('/songwriting')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
                 <ArrowLeft className="h-4 w-4 mr-1" /> Back to Songwriting
               </Button>
               <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
                 <Home className="h-4 w-4 mr-1" /> Home
               </Button>
               <Button onClick={() => navigate(`/history/${QUERY_TYPE}`)} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
                 <History className="h-4 w-4 mr-1" /> View History
               </Button>
               <AuthActionButtons />
             </div>
             <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 text-center">{QUERY_TYPE_LABEL}</h1>
           </header>

           <main className="flex-grow flex flex-col overflow-hidden">
            {promptLoading ? (
              <div className="flex justify-center items-center flex-grow">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
                <p className="ml-3 text-yellow-400">Loading {QUERY_TYPE_LABEL}...</p>
              </div>
            ) : !systemPrompt && !promptLoading ? ( 
               <div className="flex flex-col justify-center items-center flex-grow text-center p-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-red-500 mb-3">Tool Configuration Error</h2>
                  <p className="text-red-400/90 text-sm sm:text-base">Could not load the necessary configuration for {QUERY_TYPE_LABEL}.</p>
                  <p className="text-xs sm:text-sm text-yellow-500/70 mt-2">Please ensure the system prompt is correctly set up.</p>
                  <Button onClick={() => navigate('/dashboard')} className="mt-5 bg-yellow-400 text-black hover:bg-yellow-500">
                      Go to Dashboard
                  </Button>
              </div>
            ) : (
              <ChatInterface
                systemPrompt={systemPrompt}
                onPromptSubmit={handlePromptSubmit}
                isLoading={isLoading}
                initialMessages={conversation}
                queryTypeLabel={QUERY_TYPE_LABEL}
                handleFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                showFileUpload={true}
              />
            )}
           </main>
         </div>
         </>
      );
    }

    export default LyricsWordcraft;