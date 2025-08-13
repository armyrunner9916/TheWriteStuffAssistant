import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Home, History, Loader2 } from "lucide-react";
import { makeOpenAIRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useQueries } from "@/lib/hooks/useQueries";
import { useConversation } from "@/lib/hooks/useConversation";
import AuthActionButtons from "@/components/AuthActionButtons";
import ChatInterface from "@/components/ChatInterface";
import { Helmet } from "react-helmet-async";

const QUERY_TYPE = "world_building";
const QUERY_TYPE_LABEL = "World Building";
const UNIFIED_PROMPT_QUERY_TYPE = "fictional_prose_unified";

function WorldBuilding({ onLogout }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { handleQuery } = useQueries();
  const { 
    conversation, 
    addMessageToConversation, 
    startNewConversation
  } = useConversation();

  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(true);
  const [uploadedFileForChat, setUploadedFileForChat] = useState(null);

  useEffect(() => {
    startNewConversation(); 
    const fetchPrompt = async () => {
      setPromptLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_prompts')
          .select('prompt_text')
          .eq('query_type', UNIFIED_PROMPT_QUERY_TYPE)
          .single();

        if (error) throw error;
        if (data) {
          setSystemPrompt(data.prompt_text);
        } else {
          throw new Error('Prompt not found. Please ensure it is added to the database.');
        }
      } catch (error) {
        console.error(`Error fetching prompt for ${UNIFIED_PROMPT_QUERY_TYPE}:`, error);
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
    fetchPrompt();
  }, [toast, startNewConversation]);

  const handleFileUploadForChat = (file) => {
    if (file) {
      setUploadedFileForChat(file);
       toast({
        title: "File Ready",
        description: `${file.name} will be included with your next message.`,
      });
    } else {
      setUploadedFileForChat(null);
    }
  };
  
  const processAndSubmitChatPrompt = async (userPrompt, uploadedFile) => {
    if (!userPrompt.trim() && !uploadedFile) {
      toast({
        title: "Input Required",
        description: "Please enter some text or upload a file.",
        variant: "destructive",
      });
      return;
    }
    if (!systemPrompt && !promptLoading) {
         toast({ title: "Configuration Error", description: "System prompt is missing. Cannot generate.", variant: "destructive" });
         return;
    }

    setIsLoading(true);
    
    const userMessageForDisplay = {
      id: Date.now(),
      sender: "user",
      text: userPrompt,
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : null,
    };
    
    addMessageToConversation(userMessageForDisplay);

    let fileContentForApi = "";
    if (uploadedFile) {
        if (uploadedFile.type.startsWith("text/")) {
             fileContentForApi = await uploadedFile.text();
        } else {
            fileContentForApi = `[Content of file '${uploadedFile.name}' of type '${uploadedFile.type}' is present but not displayed as text.]`;
        }
    }
    
    const conversationHistoryForApi = Array.isArray(conversation) ? conversation.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.file ? `File: ${msg.file.name}\n${msg.text}` : msg.text
    })) : [];
    
    let currentInputForApi = userPrompt;
    if (uploadedFile) {
      currentInputForApi = `Filename: ${uploadedFile.name}\n\n${fileContentForApi ? `File Content:\n${fileContentForApi}\n\n` : ""}User Prompt:\n${userPrompt}`;
    }
    
    const messagesForApi = [
      { role: 'system', content: systemPrompt },
      ...conversationHistoryForApi,
    ];
    if (userPrompt.trim() || uploadedFile) {
        messagesForApi.push({ role: 'user', content: currentInputForApi });
    }

    try {
      const aiResponseText = await makeOpenAIRequest(messagesForApi);
      
      const aiMessageForDisplay = { id: Date.now() + 1, sender: "ai", text: aiResponseText };
      addMessageToConversation(aiMessageForDisplay);
      
      await handleQuery(QUERY_TYPE, userPrompt, aiResponseText, uploadedFile ? uploadedFile.name : null, conversation[0]?.id);

    } catch (error) {
      console.error("Error processing prompt:", error);
      const errorMessage = error.message || "Failed to get response from AI.";
      const aiErrorMessage = { id: Date.now() + 1, sender: "ai", text: `Error: ${errorMessage}` };
      addMessageToConversation(aiErrorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadedFileForChat(null); 
    }
  };

  return (
    <>
      <Helmet>
        <title>World-Building Tool | Fictional Prose | The Write Stuff Assistant</title>
        <meta name="description" content="Create rich, detailed settings for your stories. Craft cultures, geography and history with our world-building tool for writers." />
        <link rel="canonical" href="https://writestuffassistant.com/world-building" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="World-Building Tool | Fictional Prose | The Write Stuff Assistant" />
        <meta property="og:description" content="Create rich, detailed settings for your stories. Craft cultures, geography and history with our world-building tool for writers." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1549643276-f7c816e144d2?q=80&w=1974&auto=format&fit=crop" />
        <meta property="og:image:alt" content="Fantasy world map illustration representing world-building tools" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-black text-yellow-400">
        <header className="p-4 bg-black flex flex-col items-center gap-4 sticky top-0 z-10 border-b border-yellow-400/30">
          <div className="flex gap-2 flex-wrap justify-center items-center">
            <Button onClick={() => navigate('/prose')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fictional Prose
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
            <Button onClick={() => navigate(`/history/${QUERY_TYPE}`)} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400">
              <History className="h-4 w-4 mr-1" /> View History
            </Button>
            <AuthActionButtons onLogout={onLogout} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 text-center">{QUERY_TYPE_LABEL}</h1>
        </header>

        <main className="flex-grow flex flex-col overflow-hidden">
          {promptLoading ? (
            <div className="flex justify-center items-center flex-grow">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
              <p className="ml-3 text-yellow-400">Loading {QUERY_TYPE_LABEL}...</p>
            </div>
          ) : !systemPrompt ? ( 
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
              onPromptSubmit={processAndSubmitChatPrompt}
              isLoading={isLoading}
              initialMessages={conversation}
              queryTypeLabel={QUERY_TYPE_LABEL}
              handleFileUpload={handleFileUploadForChat}
              uploadedFile={uploadedFileForChat}
              setUploadedFile={setUploadedFileForChat}
              showFileUpload={true}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default WorldBuilding;