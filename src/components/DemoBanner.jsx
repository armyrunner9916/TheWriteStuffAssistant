import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getDemoQueriesRemaining } from '@/lib/demo-api';
import { TestTube, ArrowRight, Home, ArrowLeft } from 'lucide-react';

function DemoBanner({ showBackButton = false }) {
  const queriesRemaining = getDemoQueriesRemaining();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-sm font-medium relative">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="icon"
            className="bg-black/30 backdrop-blur-sm text-yellow-400 hover:bg-black/50 border-yellow-400/30 shadow-md h-10 w-10"
            title="Go to Home"
          >
            <Home className="h-5 w-5" />
          </Button>
          {showBackButton && (
            <Button
              onClick={() => navigate('/demo')}
              variant="outline"
              size="icon"
              className="bg-black/30 backdrop-blur-sm text-yellow-400 hover:bg-black/50 border-yellow-400/30 shadow-md h-10 w-10"
              title="Back to Demo Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 flex-1">
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

        <div className="w-[88px] sm:w-[44px]"></div>
      </div>
    </div>
  );
}

export default DemoBanner;