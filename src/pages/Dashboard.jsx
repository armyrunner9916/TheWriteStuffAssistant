import React from "react";
    import { useNavigate } from "react-router-dom";
    import { Button } from "@/components/ui/button";
    import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
    import { motion } from "framer-motion";
    import { BookOpen, Feather, Clapperboard, Newspaper, Globe, Music } from "lucide-react";
    import SubscriptionStatus from "@/components/SubscriptionStatus";
    import { useQueries } from "@/lib/hooks/useQueries";
    import AuthActionButtons from "@/components/AuthActionButtons";
    import { useToast } from "@/components/ui/use-toast";
    import { Helmet } from "react-helmet-async";
    import Footer from "@/components/ui/Footer";

    function Dashboard({ onLogout }) {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { isSubscribed, subscriptionEndDate } = useQueries();

      const categories = [
        {
          title: "Fictional Prose",
          description: "Tools for novels, short stories, and more.",
          icon: BookOpen,
          path: "/prose",
          color: "bg-gradient-to-br from-blue-400 to-indigo-600",
          active: true,
        },
        {
          title: "Poetry",
          description: "Craft verses, explore forms, and enhance imagery.",
          icon: Feather,
          path: "/poetry",
          color: "bg-gradient-to-br from-purple-400 to-pink-600",
          active: true,
        },
        {
          title: "Stage & Screen",
          description: "Develop scripts for theatre, film, and television.",
          icon: Clapperboard,
          path: "/stage-screen",
          color: "bg-gradient-to-br from-green-400 to-teal-600",
          active: true,
        },
        {
          title: "Nonfiction Writing",
          description: "Essays, articles, reports, and more.",
          icon: Newspaper,
          path: "/nonfiction",
          color: "bg-gradient-to-br from-orange-400 to-red-600",
          active: true,
        },
        {
          title: "Online Content Creation",
          description: "Blogs, social media, web copy.",
          icon: Globe,
          path: "/online-content",
          color: "bg-gradient-to-br from-cyan-400 to-blue-600",
          active: true,
        },
        {
          title: "Songwriting",
          description: "Lyrics, structure, and musical ideas.",
          icon: Music,
          path: "/songwriting",
          color: "bg-gradient-to-br from-yellow-400 to-amber-600",
          active: true,
        },
      ];

      const handleCardClick = (category) => {
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
            className={`h-full overflow-hidden transition-all duration-300 border-yellow-400 bg-black text-yellow-400 ${
              category.active
                ? "cursor-pointer hover:scale-105 hover:shadow-xl"
                : "opacity-60 cursor-not-allowed"
            }`}
            onClick={() => handleCardClick(category)}
          >
            <CardHeader className="p-4">
              <div className={`flex items-center gap-3 p-3 rounded-md mb-3 ${category.color}`}>
                <category.icon className="h-5 w-5 text-white flex-shrink-0" />
                <CardTitle className="text-lg font-bold text-white leading-tight">{category.title} { !category.active && <span className="text-xs font-normal opacity-80">(Coming Soon)</span> }</CardTitle>
              </div>
              <CardDescription className="text-xs text-yellow-400/80 pt-0">{category.description}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      );

      return (
        <>
          <Helmet>
            <title>Dashboard | The Write Stuff Assistant</title>
            <meta name="description" content="Access your dashboard for The Write Stuff Assistant." />
            <meta name="robots" content="noindex,nofollow" />
            <link rel="canonical" href="https://writestuffassistant.com/dashboard" />
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
              <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-8">
                <Button
                  onClick={() => navigate('/resources')}
                  variant="outline"
                  size="sm"
                  className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400"
                  aria-label="Navigate to resources and support page"
                >
                  <BookOpen className="h-4 w-4 mr-1" aria-hidden="true" /> More Resources
                </Button>
                <AuthActionButtons onLogout={onLogout} />
              </header>

              <main className="flex-grow flex flex-col items-center mt-[15vh] sm:mt-[18vh]">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
                  {categories.map((category, index) =>
                    renderCategoryCard(category, index)
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-full max-w-md"
                >
                  <SubscriptionStatus
                    isSubscribed={isSubscribed}
                    subscriptionEndDate={subscriptionEndDate}
                    className="bg-black border-yellow-400 text-yellow-400"
                  />
                </motion.div>
              </main>
            </div>
            <Footer showSubscription={false} />
          </div>
        </>
      );
    }

    export default Dashboard;