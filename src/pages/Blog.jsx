import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Footer from '@/components/ui/Footer';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import voiceContent from '@/content/blog/blog-post-1-voice-final.md?raw';
import ethicsContent from '@/content/blog/blog-post-2-ethics-final.md?raw';
import craftContent from '@/content/blog/blog-post-3-craft-final.md?raw';
import jobContent from '@/content/blog/blog-post-4-job-security-final.md?raw';

function Blog() {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 'voice',
      title: 'Your Voice Is a Filter, Not a Faucet',
      content: voiceContent,
    },
    {
      id: 'ethics',
      title: 'The Messy Middle: AI, Copyright, and What Actually Matters',
      content: ethicsContent,
    },
    {
      id: 'craft',
      title: 'The Craft Question: What AI Can\'t Learn From You',
      content: craftContent,
    },
    {
      id: 'job',
      title: 'Will AI Take Your Job? Maybe Not the One That Matters',
      content: jobContent,
    },
  ];


  return (
    <>
      <Helmet>
        <title>Addressing Writers' Concerns About AI – The Write Stuff Assistant</title>
        <meta name="description" content="Real talk from an AI developer about what AI can and can't do for writers. Addressing 4 key concerns: voice, ethics, craft, and job security." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://writestuffassistant.com/blog" />
      </Helmet>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 z-0">
          <img
            className="object-cover w-full h-full fixed"
            alt=""
            role="presentation"
            src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
          />
          <div className="absolute inset-0 bg-black/60 fixed"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-8 flex flex-col min-h-screen pb-24">
          <header className="w-full max-w-6xl mx-auto flex justify-start items-center mb-8">
            <Button
              onClick={() => navigate('/resources')}
              variant="outline"
              size="sm"
              className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400"
              aria-label="Back to resources page"
            >
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Back to Resources
            </Button>
          </header>

          <main className="flex-grow flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl mb-4"
            >
              <div className="bg-zinc-900/80 border border-yellow-400/30 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8">
                <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-script mb-6 text-yellow-400">
                  Your Questions About AI & Writing, Answered
                </h1>
                <p className="text-yellow-400/80 text-base sm:text-lg leading-relaxed mb-4">
                  If you're a writer, you've probably got concerns about AI. Will it replace your voice? Is it ethical? Does your craft still matter? What about your job?
                </p>
                <p className="text-yellow-400/80 text-base sm:text-lg leading-relaxed">
                  Fair questions. Here are some honest answers.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-4xl mb-10"
            >
              <div className="bg-zinc-900/80 border border-yellow-400/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-yellow-400/20">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Deep Dive: Full Articles</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {blogPosts.map((post, index) => (
                    <AccordionItem key={post.id} value={post.id}>
                      <AccordionTrigger className="text-yellow-400 hover:text-yellow-300 text-lg sm:text-xl font-semibold">
                        {post.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-invert prose-yellow max-w-none">
                          <MarkdownRenderer markdownText={post.content} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center mb-8"
            >
              <Button
                onClick={() => navigate('/resources')}
                className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 py-3 text-lg"
                size="lg"
              >
                Back to Resources
              </Button>
            </motion.div>
          </main>
        </div>
        <Footer showSubscription={false} />
      </div>
    </>
  );
}

export default Blog;
