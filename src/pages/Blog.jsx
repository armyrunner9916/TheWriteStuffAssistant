import React, { useState } from 'react';
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

import concernsContent from '@/content/blog/original-4-concerns.md?raw';
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

  const concerns = [
    { number: 1, title: 'Loss of Authentic Voice', description: 'Fear that AI will homogenize their unique writing style and make everything sound generic.' },
    { number: 2, title: 'Ethical/Copyright Issues', description: 'Concerns about AI training on copyrighted work and potential plagiarism.' },
    { number: 3, title: 'Devaluation of Craft', description: 'Worry that relying on AI diminishes the skill they\'ve spent years developing.' },
    { number: 4, title: 'Job Security/Professional Identity', description: 'Anxiety that AI tools will make human writers obsolete.' },
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
              className="w-full max-w-4xl mb-8"
            >
              <div className="bg-zinc-900/80 border border-yellow-400/30 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8">
                <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-yellow-400">
                  Your Questions About AI & Writing, Answered
                </h1>
                <p className="text-center text-yellow-400/90 text-lg sm:text-xl mb-6">
                  Real talk from an AI developer about what AI can and can't do for writers
                </p>
                <p className="text-yellow-400/80 text-base sm:text-lg leading-relaxed">
                  If you're a writer, you've probably got questions about AI. Maybe you're worried about losing your unique voice,
                  concerned about ethics and copyright, wondering if your hard-earned craft still matters, or anxious about job security.
                  These are all valid concerns, and they deserve honest answers. Below, I address each of these four major concerns that
                  writers face when thinking about AI tools.
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-yellow-400/30 backdrop-blur-sm rounded-lg shadow-lg p-6 sm:p-8 mb-8">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6">The 4 Main Concerns</h2>
                <div className="space-y-4">
                  {concerns.map((concern) => (
                    <motion.div
                      key={concern.number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: concern.number * 0.1 }}
                      className="border-l-4 border-yellow-400 pl-4 py-2"
                    >
                      <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                        {concern.number}. {concern.title}
                      </h3>
                      <p className="text-yellow-400/70 text-sm sm:text-base">
                        {concern.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-4xl mb-10"
            >
              <div className="bg-zinc-900/80 border border-yellow-400/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-yellow-400/20">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Deep Dive: Full Articles</h2>
                  <p className="text-yellow-400/70 mt-2">Click on each article to read the full discussion</p>
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
