import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

function DemoNavigation({ showBackButton = false }) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-[100px] left-4 z-50 flex gap-2">
      <Button
        onClick={() => navigate('/')}
        variant="outline"
        size="icon"
        className="bg-black/70 backdrop-blur-md text-yellow-400 hover:bg-black/90 border-yellow-400/50 shadow-lg h-10 w-10"
        title="Go to Home"
      >
        <Home className="h-5 w-5" />
      </Button>
      {showBackButton && (
        <Button
          onClick={() => navigate('/demo')}
          variant="outline"
          size="icon"
          className="bg-black/70 backdrop-blur-md text-yellow-400 hover:bg-black/90 border-yellow-400/50 shadow-lg h-10 w-10"
          title="Back to Demo Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default DemoNavigation;
