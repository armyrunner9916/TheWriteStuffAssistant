import React from "react";
import { ExternalLink } from "lucide-react";

function HeaderCTA() {
  return (
    <div className="bg-yellow-400 text-black py-2 px-4 text-center text-sm font-medium">
      <a 
        href="https://editstuffassistant.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:underline"
      >
        Need edits on existing work? Visit EditStuffAssistant.com
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

export default HeaderCTA;