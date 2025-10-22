import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';
import { ExternalLink } from 'lucide-react';

function SignIn() {
  return (
    <>
      <Helmet>
        <title>The Write Stuff Assistant – AI‑Powered Tools for Writers</title>
        <meta name="description" content="Discover AI‑powered tools to enhance your creative writing. Perfect for authors, poets, screenwriters, nonfiction writers, content creators and songwriters." />
        <link rel="canonical" href="https://writestuffassistant.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The Write Stuff Assistant – AI‑Powered Tools for Writers" />
        <meta property="og:description" content="Discover AI‑powered tools to enhance your creative writing. Perfect for authors, poets, screenwriters, nonfiction writers, content creators and songwriters." />
        <meta property="og:url" content="https://writestuffassistant.com/" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f" />
        <meta property="og:image:alt" content="Background image of a bookshelf filled with books under warm lighting" />
      </Helmet>
      <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="object-cover w-full h-full"
            alt="Background image of a bookshelf filled with books under warm lighting"
           src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 bg-yellow-400 text-black py-2 px-4 text-center text-sm font-medium">
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

        <main className="relative z-10 flex flex-col items-center justify-center text-center text-white flex-grow p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/50 backdrop-blur-[20px] backdrop-saturate-[180%] border border-yellow-400/25 rounded-[24px] p-6 sm:p-8 max-w-3xl shadow-[0_12px_48px_rgba(0,0,0,0.7),0_24px_96px_rgba(0,0,0,0.5),0_2px_12px_rgba(255,212,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-400 drop-shadow-lg" style={{ fontFamily: 'cursive, sans-serif' }}>
              Welcome to The Write Stuff
            </h1>
            <p className="mt-4 max-w-2xl text-md sm:text-lg text-yellow-400/90">
              Pick a task, fill a few details, and get focused results—worlds, characters, poems, outlines, and more—that you can then refine with follow-ups.
            </p>

            <p className="mt-6 max-w-2xl text-md sm:text-lg text-yellow-400/90">
              Try it free for 30 days. Then just $5/month. Click below to get started today!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <AuthDialog />
              <Button
                onClick={() => window.location.href = '/demo'}
                className="bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 text-lg"
                size="lg"
              >
                Take A Test Run Now
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
              <a href="https://youtu.be/fHXTLOqXb30?si=ja1qCphUY62mcCB5" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-transform hover:scale-105 group">
                <div className="w-64 h-36 rounded-lg overflow-hidden border-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors">
                  <img  className="w-full h-full object-cover" alt="Official YouTube thumbnail for The Write Stuff video" src="https://img.youtube.com/vi/fHXTLOqXb30/hqdefault.jpg" />
                </div>
                <p className="mt-2 text-sm font-semibold">Watch on YouTube</p>
              </a>
              <a href="https://youtu.be/e501z70QMpk?si=oQeijFjAAk7igE4j" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-transform hover:scale-105 group">
                 <div className="w-64 h-36 rounded-lg overflow-hidden border-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors">
                  <img  className="w-full h-full object-cover" alt="Official YouTube thumbnail for The Write Stuff video" src="https://img.youtube.com/vi/e501z70QMpk/hqdefault.jpg" />
                </div>
                <p className="mt-2 text-sm font-semibold">Watch on YouTube</p>
              </a>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default SignIn;