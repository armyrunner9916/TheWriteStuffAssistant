import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function cleanHistoryEntry(queryText, responseText) {
  if (!queryText) {
    return { prompt: "", response: responseText || "" };
  }

  const promptSections = [];
  const followUpSections = [];

  const parts = queryText.split('--- Follow-ups ---');
  const mainPromptPart = parts[0];

  const mainPromptLines = mainPromptPart.split('\n').filter(line => line.trim() !== '');
  
  if (mainPromptLines.length > 0) {
    const cleanedMainPrompt = mainPromptLines.filter(line => 
      !line.startsWith('Output Type Requested:') &&
      !line.startsWith('Creative Parameters:') &&
      !line.startsWith('---')
    ).join('\n');
    promptSections.push(`**Initial Prompt:**\n${cleanedMainPrompt}`);
  }

  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const followUpLines = parts[i].split('\n').filter(line => line.trim() !== '');
      if (followUpLines.length > 0) {
        const userQuery = followUpLines.find(line => line.startsWith('**User:**'));
        const aiResponse = followUpLines.slice(followUpLines.findIndex(line => line.startsWith('**AI Response:**')) + 1).join('\n');
        
        if (userQuery) {
          promptSections.push(`**Follow-up ${i}:**\n${userQuery.replace('**User:**', '').trim()}`);
        }
      }
    }
  }

  const finalPrompt = promptSections.join('\n\n');
  
  // For the response, we just return it as is, since it doesn't contain the prompt metadata
  const finalResponse = responseText || "";

  return {
    prompt: finalPrompt,
    response: finalResponse
  };
}
