import React, { useState, useRef, useEffect, useCallback } from "react";
    import { Button } from "@/components/ui/button";
    import TextareaAutosize from "react-textarea-autosize";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { Loader2, Send, Paperclip, X, ChevronDown, Copy, Download } from "lucide-react";
    import MarkdownRenderer from "@/components/MarkdownRenderer";
    import { motion, AnimatePresence } from "framer-motion";
    import DownloadOutputDialog from "@/components/DownloadOutputDialog";
    import { useToast } from "@/components/ui/use-toast";

    const ChatInterface = ({
      systemPrompt,
      onPromptSubmit,
      isLoading,
      initialMessages = [],
      queryTypeLabel = "Tool",
      handleFileUpload,
      uploadedFile,
      setUploadedFile,
      showFileUpload = true
    }) => {
      const [inputMessage, setInputMessage] = useState("");
      const [messages, setMessages] = useState(initialMessages);
      const scrollAreaRef = useRef(null);
      const viewportRef = useRef(null);
      const fileInputRef = useRef(null);
      const [showScrollToBottom, setShowScrollToBottom] = useState(false);
      const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
      const [selectedMessageForDownload, setSelectedMessageForDownload] = useState(null);
      const { toast } = useToast();

      const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (viewportRef.current) {
          viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior });
        }
      }, []);

      useEffect(() => {
        setMessages(initialMessages);
        setTimeout(() => scrollToBottom('auto'), 0);
      }, [initialMessages, scrollToBottom]);

      useEffect(() => {
        if (messages.length > 0) {
         setTimeout(() => scrollToBottom(), 100); 
        }
      }, [messages, scrollToBottom]);
      
      const handleScroll = () => {
        if (viewportRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
          setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > 100);
        }
      };

      useEffect(() => {
        const currentViewport = viewportRef.current;
        if (currentViewport) {
          currentViewport.addEventListener('scroll', handleScroll);
          return () => currentViewport.removeEventListener('scroll', handleScroll);
        }
      }, []);


      const handleSubmit = async () => {
        if (inputMessage.trim() === "" && !uploadedFile) return;

        const userMsgObject = {
          id: Date.now(),
          sender: "user",
          text: inputMessage,
          file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : null,
        };
        setMessages(prev => [...prev, userMsgObject]);
        
        await onPromptSubmit(inputMessage, uploadedFile); 
        
        setInputMessage("");
        if (setUploadedFile) setUploadedFile(null); 
        if (fileInputRef.current) fileInputRef.current.value = null; 
      };

      const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSubmit();
        }
      };

      const onFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && handleFileUpload) {
          handleFileUpload(file); 
        }
      };
      
      const removeFile = () => {
        if (setUploadedFile) setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      }

      const handleCopyToClipboard = (textToCopy) => {
        if (!textToCopy) {
            toast({ title: "Nothing to copy", description: "The message is empty.", variant: "destructive" });
            return;
        }
        navigator.clipboard.writeText(textToCopy)
          .then(() => toast({ title: "Copied!", description: "AI response copied to clipboard." }))
          .catch(err => toast({ title: "Error", description: "Failed to copy text.", variant: "destructive" }));
      };

      const openDownloadDialog = (messageContent) => {
        if (!messageContent) {
             toast({ title: "Nothing to download", description: "The message is empty.", variant: "destructive" });
             return;
        }
        setSelectedMessageForDownload(messageContent);
        setIsDownloadDialogOpen(true);
      };

      return (
        <div className="flex flex-col h-full bg-zinc-900 text-gray-200 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-grow" viewportRef={viewportRef}>
            <div className="p-4 sm:p-6 space-y-4 pb-32 sm:pb-36">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  if (msg.sender === "system") {
                      return null;
                  }
                  return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative group max-w-[80%] md:max-w-[70%] p-3 rounded-2xl shadow-md ${
                        msg.sender === "user"
                          ? "bg-zinc-700 text-yellow-300 self-end ml-10" 
                          : "bg-zinc-800 text-yellow-300 self-start mr-10" 
                      }`}
                    >
                      {msg.sender === "ai" && msg.text && <MarkdownRenderer markdownText={msg.text} />}
                      {msg.sender === "user" && msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      {msg.file && (
                        <div className="mt-2 p-2 bg-black/30 rounded-md text-xs text-yellow-200/80 border border-yellow-400/20">
                          Attached: {msg.file.name} ({msg.file.type})
                        </div>
                      )}
                      {msg.sender === "ai" && msg.text && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-1 bg-zinc-700 hover:bg-zinc-600 text-yellow-300 rounded-full"
                            onClick={() => handleCopyToClipboard(msg.text)}
                            title="Copy response"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-1 bg-zinc-700 hover:bg-zinc-600 text-yellow-300 rounded-full"
                            onClick={() => openDownloadDialog(msg.text)}
                            title="Download response"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )})}
                {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
                  <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[70%] p-3 rounded-2xl shadow-md bg-zinc-800 text-yellow-300 flex items-center self-start mr-10">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Thinking...</span>
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
          
          {showScrollToBottom && (
            <Button
              onClick={() => scrollToBottom()}
              variant="outline"
              size="icon"
              className="fixed bottom-32 sm:bottom-36 right-6 sm:right-10 z-50 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg border-black/20"
              title="Scroll to bottom"
            >
              <ChevronDown size={24} />
            </Button>
          )}

          <div className="p-3 sm:p-4 border-t border-zinc-700 bg-zinc-900 pb-20 sm:pb-24">
            {uploadedFile && setUploadedFile && (
              <div className="mb-2 flex items-center justify-between p-2 bg-zinc-800 rounded-md text-sm text-yellow-300">
                <span>File: {uploadedFile.name}</span>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-6 w-6 text-yellow-400 hover:text-red-500">
                  <X size={16} />
                </Button>
              </div>
            )}
            <div className="flex items-end gap-2 sm:gap-3">
              {showFileUpload && handleFileUpload && (
                <Button
                  variant="outline"
                  size="icon"
                  className="border-zinc-700 bg-zinc-800 text-gray-400 hover:text-yellow-400 hover:bg-zinc-700 h-12 w-12 flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title="Upload File"
                >
                  <Paperclip size={20} />
                </Button>
              )}
              <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept=".txt,.md,.docx,.pdf" />
              <TextareaAutosize
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="flex-grow resize-none bg-zinc-800 border-zinc-700 text-yellow-300 placeholder:text-gray-500 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg p-3 min-h-[48px] max-h-[200px] overflow-y-auto"
                minRows={1}
                maxRows={6}
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (inputMessage.trim() === "" && !uploadedFile)}
                className="bg-yellow-400 text-black hover:bg-yellow-500 transition-colors h-12 w-12 flex-shrink-0 p-0"
                size="icon"
                title="Send Message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
          </div>
          {selectedMessageForDownload && (
            <DownloadOutputDialog
              isOpen={isDownloadDialogOpen}
              onOpenChange={setIsDownloadDialogOpen}
              outputToSave={selectedMessageForDownload}
              queryType={queryTypeLabel.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}
              defaultFilename={`${queryTypeLabel.replace(/\s/g, '_')}_response.txt`}
            />
          )}
        </div>
      );
    };

    export default ChatInterface;