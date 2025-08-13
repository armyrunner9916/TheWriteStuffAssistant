import React, { useState, useEffect, useCallback } from "react";
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

    const QUERY_TYPE = "voice_tone_development";
    const QUERY_TYPE_LABEL = "Voice & Tone Development";

    function VoiceToneDevelopment({ onLogout }) {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [isLoading, setIsLoading] = useState(false);
      const { handleQuery } = useQueries();
      const { 
        conversation, 
        addMessageToConversation, 
        startNewConversation,
        setConversationHistory
      } = useConversation();

      const [systemPrompt, setSystemPrompt] = useState('');
      const [promptLoading, setPromptLoading] = useState(true);
      const [currentSessionMessages, setCurrentSessionMessages] = useState([]);
      const [uploadedFileForChat, setUploadedFileForChat] = useState(null);

      useEffect(() => {
        document.title = `TWS - ${QUERY_TYPE_LABEL}`;
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
      
      useEffect(() => {
        if (Array.isArray(conversation)) {
            setCurrentSessionMessages(conversation);
        }
      }, [conversation]);


      return (
        <div className="min-h-screen flex flex-col p-2 sm:p-4 md:p-6 bg-zinc-900">
          <header className="w-full flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex gap-2 flex-wrap justify-start items-center">
              <Button onClick={() => navigate('/nonfiction')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-black/80 border-yellow-400">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Nonfiction
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-black/80 border-yellow-400">
                <Home className="h-4 w-4 mr-1" /> Home
              </Button>
              <Button onClick={() => navigate(`/history/${QUERY_TYPE}`)} variant="outline" size="sm" className="bg-black text-yellow-400 hover:bg-black/80 border-yellow-400">
                <History className="h-4 w-4 mr-1" /> View History
              </Button>
              <AuthActionButtons />
            </div>
             <div className="flex-grow text-center sm:text-left mt-2 sm:mt-0">
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">{QUERY_TYPE_LABEL}</h1>
             </div>
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
                onPromptSubmit={processAndSubmitChatPrompt}
                isLoading={isLoading}
                initialMessages={conversation}
                queryTypeLabel={QUERY_TYPE_LABEL}
                handleFileUpload={handleFileUploadForChat}
                uploadedFile={uploadedFileForChat}
                setUploadedFile={setUploadedFileForChat}
              />
            )}
          </main>
        </div>
      );
    }

    export default VoiceToneDevelopment;