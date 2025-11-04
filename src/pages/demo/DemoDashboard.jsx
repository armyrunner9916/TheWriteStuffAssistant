import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Feather, Clapperboard, Newspaper, Globe, Music } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";
import DemoLayout from "@/components/DemoLayout";
import { canMakeDemoQuery } from "@/lib/demo-api";

function DemoDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    {
      title: "Fictional Prose",
      description: "Tools for novels, short stories, and more.",
      icon: BookOpen,
      path: "/demo/prose",
      color: "bg-gradient-to-br from-blue-400 to-indigo-600",
      active: true,
    },
    {
      title: "Poetry",
      description: "Craft verses, explore forms, and enhance imagery.",
      icon: Feather,
      path: "/demo/poetry",
      color: "bg-gradient-to-br from-purple-400 to-pink-600",
      active: true,
    },
    {
      title: "Stage & Screen",
      description: "Develop scripts for theatre, film, and television.",
      icon: Clapperboard,
      path: "/demo/stage-screen",
      color: "bg-gradient-to-br from-green-400 to-teal-600",
      active: true,
    },
    {
      title: "Nonfiction Writing",
      description: "Essays, articles, reports, and more.",
      icon: Newspaper,
      path: "/demo/nonfiction",
      color: "bg-gradient-to-br from-orange-400 to-red-600",
      active: true,
    },
    {
      title: "Online Content Creation",
      description: "Blogs, social media, web copy.",
      icon: Globe,
      path: "/demo/online-content",
      color: "bg-gradient-to-br from-cyan-400 to-blue-600",
      active: true,
    },
    {
      title: "Songwriting",
      description: "Lyrics, structure, and musical ideas.",
      icon: Music,
      path: "/demo/songwriting",
      color: "bg-gradient-to-br from-yellow-400 to-amber-600",
      active: true,
    },
  ];

  const handleCardClick = (category) => {
    if (!canMakeDemoQuery()) {
      toast({
        title: "Demo Limit Reached",
        description: "Sign up to continue using all features!",
        variant: "destructive",
      });
      return;
    }

    if (category.active && category.path) {
      navigate(category.path);
    } else {
      toast({
        title: "Coming Soon!",
        description: `Tools for ${category.title} are under development.`,
      });
    }
  };

  const renderCategoryCard = (category, index) => (
    <motion.div
      key={category.title}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={`h-full overflow-hidden transition-all duration-300 liquid-glass-card border-yellow-400/30 text-yellow-400 ${
          category.active
            ? "cursor-pointer hover:scale-105 hover:shadow-xl"
            : "opacity-60 cursor-not-allowed"
        }`}
        onClick={() => handleCardClick(category)}
      >
        <CardHeader className="p-4">
          <div className={`flex items-center gap-3 p-3 rounded-md mb-3 ${category.color}`}>
            <category.icon className="h-5 w-5 text-white flex-shrink-0" aria-hidden="true" />
            <CardTitle as="h2" className="text-lg font-bold text-white leading-tight">
              {category.title}
              {!category.active && <span className="text-xs font-normal opacity-80">(Coming Soon)</span>}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-yellow-400/80 pt-0">{category.description}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );

  return (
    <DemoLayout>
      <Helmet>
        <title>Demo – The Write Stuff Assistant</title>
        <meta name="description" content="Try The Write Stuff Assistant in demo mode and explore tools for fiction, poetry, stage & screen, nonfiction, online content, and songwriting." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://writestuffassistant.com/demo" />
      </Helmet>
      <style>
        {`
          .liquid-glass-header {
            position: relative;
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(18px) saturate(180%);
            border-radius: 28px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
          }

          .liquid-glass-header::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 28px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
            pointer-events: none;
          }

          .liquid-glass-card {
            position: relative;
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(18px) saturate(180%);
            border-radius: 28px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
          }

          .liquid-glass-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 28px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
            pointer-events: none;
          }
        `}
      </style>
      <div className="min-h-screen p-4 sm:p-8 flex flex-col">
        <main className="flex-grow flex flex-col items-center mt-[10vh] sm:mt-[12vh]">
          <div className="text-center mb-8 w-full max-w-4xl px-4">
            <div className="liquid-glass-header border border-yellow-400/25 p-6 sm:p-8 shadow-[0_2px_12px_rgba(255,212,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-400 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Demo Mode: Try The Write Stuff Assistant
              </h1>
              <p className="text-yellow-400/80 text-lg">
                Explore all our writing tools - no signup required!
              </p>
            </div>
          </div>

          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) =>
              renderCategoryCard(category, index)
            )}
          </div>
        </main>
      </div>
    </DemoLayout>
  );
}

export default DemoDashboard;