import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Feather,
  Clapperboard,
  Newspaper,
  Globe,
  Music,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  History,
  CreditCard,
  X,
} from "lucide-react";

const TOTAL_STEPS = 4;

const categories = [
  {
    title: "Fictional Prose",
    description: "Novels, short stories, and creative fiction",
    icon: BookOpen,
    path: "/prose",
    color: "from-blue-400 to-indigo-600",
  },
  {
    title: "Poetry",
    description: "Verses, forms, and poetic imagery",
    icon: Feather,
    path: "/poetry",
    color: "from-purple-400 to-pink-600",
  },
  {
    title: "Stage & Screen",
    description: "Scripts for theatre, film, and TV",
    icon: Clapperboard,
    path: "/stage-screen",
    color: "from-green-400 to-teal-600",
  },
  {
    title: "Nonfiction Writing",
    description: "Essays, articles, and reports",
    icon: Newspaper,
    path: "/nonfiction",
    color: "from-orange-400 to-red-600",
  },
  {
    title: "Online Content",
    description: "Blogs, social media, and web copy",
    icon: Globe,
    path: "/online-content",
    color: "from-cyan-400 to-blue-600",
  },
  {
    title: "Songwriting",
    description: "Lyrics, structure, and musical ideas",
    icon: Music,
    path: "/songwriting",
    color: "from-yellow-400 to-amber-600",
  },
];

function OnboardingWizard({ isOpen, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleCategoryClick = (path) => {
    onComplete();
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-2" />
            Skip
          </Button>

          <div className="px-8 pt-8 pb-6">
            <div className="flex gap-2 mb-6">
              {[...Array(TOTAL_STEPS)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    index + 1 <= currentStep
                      ? "bg-blue-600"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[400px] flex flex-col justify-center"
                >
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                      Welcome to WriteStuffAssistant
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                      Your AI-powered creative writing companion designed to help writers
                      across all genres and formats.
                    </p>
                    <div className="flex items-center justify-center gap-8 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            10-Day Free Trial
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Full access to all features
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            6 Writing Modules
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            For every type of writer
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Let's take a quick tour to get you started
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[400px]"
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Choose Your Writing Category
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-300">
                        Six specialized AI assistants tailored to different writing styles
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                          <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className="p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-400"
                              onClick={() => handleCategoryClick(category.path)}
                            >
                              <div
                                className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl mb-3`}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                {category.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {category.description}
                              </p>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                      Click any category to jump right in, or continue the tour
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[400px]"
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        How to Generate Content
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-300">
                        Creating with WriteStuffAssistant is simple and intuitive
                      </p>
                    </div>
                    <div className="space-y-6 pt-4">
                      <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xl">
                          1
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Select a Category
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Choose the writing module that matches your project from the
                            dashboard. Each category has specialized tools for that type of
                            writing.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 font-bold text-xl">
                          2
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Enter Your Prompt
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Fill in the form with details about what you want to create.
                            The more specific you are, the better the results. Include genre,
                            tone, characters, setting, or any other relevant details.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 font-bold text-xl">
                          3
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            Generate & Refine
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Click Generate to create your content. You can then ask follow-up
                            questions to refine, expand, or adjust the output. The AI remembers
                            the conversation context.
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">Pro Tip:</span> Use follow-up
                          questions to iterate on your content. Ask for different tones,
                          longer versions, alternative approaches, or specific improvements.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[400px]"
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Resources & Next Steps
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-300">
                        Everything you need to make the most of your experience
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <Card className="p-6 border-2 hover:border-blue-400 transition-all">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl mb-4">
                          <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                          Try Demo Mode
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Want to explore without using your trial? Check out our demo mode
                          with limited queries to test features before diving in.
                        </p>
                      </Card>

                      <Card className="p-6 border-2 hover:border-blue-400 transition-all">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl mb-4">
                          <History className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                          Access Your History
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          All your conversations are saved in the History page. Review,
                          continue, or export previous work anytime.
                        </p>
                      </Card>

                      <Card className="p-6 border-2 hover:border-blue-400 transition-all">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl mb-4">
                          <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                          Manage Subscription
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          View your trial status and subscription details anytime from your
                          dashboard. Upgrade or cancel easily.
                        </p>
                      </Card>

                      <Card className="p-6 border-2 hover:border-blue-400 transition-all">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl mb-4">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                          Visit Resources
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Check out our blog and resources page for writing tips, best
                          practices, and inspiration.
                        </p>
                      </Card>
                    </div>
                    <div className="text-center pt-6">
                      <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                        You're all set! Ready to start creating?
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-8 py-6 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStep} of {TOTAL_STEPS}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === TOTAL_STEPS ? (
                <>
                  Start Writing
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingWizard;
