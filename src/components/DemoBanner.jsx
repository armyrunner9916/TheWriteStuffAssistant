import React from 'react';
import { Button } from '@/components/ui/button';
import { getDemoQueriesRemaining } from '@/lib/demo-api';
import { TestTube, ArrowRight } from 'lucide-react';

function DemoBanner() {
  const queriesRemaining = getDemoQueriesRemaining();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center text-sm font-medium">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          <span>Demo Mode: {queriesRemaining} queries remaining</span>
        </div>
        <div className="flex items-center gap-2 text-xs opacity-90">
          <span>Results not saved • Navigate away to lose progress</span>
        </div>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600 text-xs px-3 py-1"
        >
          Sign Up for Full Access
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default DemoBanner;