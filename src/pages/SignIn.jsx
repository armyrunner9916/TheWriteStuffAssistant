import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Footer from '@/components/ui/Footer';

function SignIn() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>The Write Stuff Assistant – AI‑Powered Writing Tools</title>
        <meta name="description" content="Pick a task, fill a few details, and get tailored writing results—worlds, characters, poems, outlines, and more. Start your 10-day full-featured trial today." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://writestuffassistant.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The Write Stuff Assistant – AI‑Powered Writing Tools" />
        <meta property="og:description" content="Pick a task, fill a few details, and get tailored writing results—worlds, characters, poems, outlines, and more. Start your 10-day full-featured trial today." />
        <meta property="og:url" content="https://writestuffassistant.com/" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f" />
        <meta property="og:image:alt" content="Background image of a bookshelf filled with books under warm lighting" />
      </Helmet>
      <div className="relative min-h-screen w-full flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            className="object-cover w-full h-full fixed"
            alt="Background image of a bookshelf filled with books under warm lighting"
           src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f" />
          <div className="absolute inset-0 bg-black/60 fixed"></div>
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

        <main className="relative z-10 flex flex-col items-center justify-center text-center text-white flex-grow p-4 py-12 sm:py-16 lg:px-10 xl:px-16">
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

          <div className="liquid-glass-spotlight border border-yellow-400/25 p-6 sm:p-8 lg:p-10 xl:p-12 max-w-3xl lg:max-w-5xl xl:max-w-6xl shadow-[0_2px_12px_rgba(255,212,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]" role="main">
            <h1 className="hero-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-yellow-400 drop-shadow-lg lg:leading-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Your AI-powered writing companion for every creative need.
            </h1>
            <p className="hero-subheading mt-6 lg:mt-8 xl:mt-10 max-w-2xl lg:max-w-4xl text-sm sm:text-base lg:text-lg xl:text-xl text-yellow-400/90 mx-auto">
              Pick a task, fill in a few details, and get focused results — worlds, characters, poems, scripts, outlines and more. Start a 10-day full-access trial; then just $5/month.
            </p>

            <p className="hero-subheading mt-6 lg:mt-8 max-w-2xl lg:max-w-4xl text-sm sm:text-md lg:text-base xl:text-lg text-yellow-400/80 italic mx-auto">
              Six specialized modules: Fiction, Poetry, Stage & Screen, Nonfiction, Online Content Creation, and Songwriting.
            </p>
          </div>

          <div className="hero-buttons mt-8 lg:mt-12 flex flex-col items-center gap-6 lg:gap-8">
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-center">
              <Button
                onClick={() => navigate('/auth')}
                className="hero-button hero-button-primary bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 lg:px-8 lg:py-4 text-lg lg:text-xl"
                size="lg"
              >
                Sign Up/Sign In
              </Button>
              <Button
                onClick={() => navigate('/demo')}
                className="hero-button hero-button-primary bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 lg:px-8 lg:py-4 text-lg lg:text-xl"
                size="lg"
              >
                Try a Test Run
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-center">
              <Button
                onClick={() => navigate('/resources')}
                className="hero-button hero-button-primary bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 lg:px-8 lg:py-4 text-lg lg:text-xl"
                size="lg"
              >
                Resources
              </Button>
              <Button
                onClick={() => navigate('/blog')}
                className="hero-button hero-button-primary bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 lg:px-8 lg:py-4 text-lg lg:text-xl"
                size="lg"
              >
                Blog
              </Button>
            </div>
          </div>
        </main>
        <Footer showSubscription={false} />
      </div>
    </>
  );
}

export default SignIn;