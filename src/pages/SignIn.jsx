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

        <main className="relative z-10 flex flex-col items-center justify-center text-center text-white flex-grow p-4 py-12 sm:py-16">
          <style>
            {`
              @keyframes hero-fade-up {
                from {
                  opacity: 0;
                  transform: translateY(24px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes hero-fade-up-delay {
                from {
                  opacity: 0;
                  transform: translateY(24px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes hero-fade-scale {
                from {
                  opacity: 0;
                  transform: scale(0.96);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes gradient-shift {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }

              .hero-heading {
                animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }

              .hero-subheading {
                animation: hero-fade-up-delay 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
                opacity: 0;
              }

              .hero-buttons {
                animation: hero-fade-scale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards;
                opacity: 0;
              }

              .liquid-glass-spotlight {
                position: relative;
                background: rgba(255, 255, 255, 0.07);
                backdrop-filter: blur(18px) saturate(180%);
                border-radius: 28px;
                box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
              }

              .liquid-glass-spotlight::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 28px;
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
                pointer-events: none;
              }

              .hero-button {
                position: relative;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                background-size: 200% 200%;
              }

              .hero-button:hover {
                transform: scale(1.04);
                box-shadow: 0 0 18px rgba(255, 255, 255, 0.15);
              }

              .hero-button-primary {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
              }

              .hero-button-primary:hover {
                background: linear-gradient(225deg, #fbbf24, #f59e0b);
                animation: gradient-shift 3s ease infinite;
              }
            `}
          </style>

          <div className="liquid-glass-spotlight border border-yellow-400/25 p-6 sm:p-8 max-w-3xl shadow-[0_2px_12px_rgba(255,212,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-400 drop-shadow-lg" style={{ fontFamily: 'cursive, sans-serif' }}>
              Welcome to The Write Stuff
            </h1>
            <p className="hero-subheading mt-4 max-w-2xl text-md sm:text-lg text-yellow-400/90">
              Pick a task, fill a few details, and get focused results—worlds, characters, poems, outlines, and more—that you can then refine with follow-ups.
            </p>

            <p className="hero-subheading mt-6 max-w-2xl text-md sm:text-lg text-yellow-400/90">
              Try it free for 30 days. Then just $5/month. Click below to get started today!
            </p>
          </div>

          <div className="hero-buttons mt-8 flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <AuthDialog />
              <Button
                onClick={() => window.location.href = '/demo'}
                className="hero-button hero-button-primary text-black font-bold px-6 py-3 text-lg"
                size="lg"
              >
                Take A Test Run Now
              </Button>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => window.location.href = '/resources'}
                variant="outline"
                className="bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 font-semibold px-6 py-2"
                size="lg"
              >
                More Resources
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;