import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Globe, FileText, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AuthDialog from '@/components/AuthDialog';
import Footer from '@/components/ui/Footer';

function Resources() {
  const navigate = useNavigate();

  const resources = [
    {
      title: 'Helpful Links',
      description: 'Check out these sites for more information on this product and to see what else we have to offer!',
      icon: Globe,
      links: [
        {
          text: 'Visit Our YouTube Channel',
          url: 'https://www.youtube.com/@Armyrunner-Studios',
        },
        {
          text: 'Explore Our Other Products Here',
          url: 'https://armyrunner-studios.com',
        },
      ],
    },
    {
      title: 'Writing Guides',
      description: 'Tips and best practices for getting the most out of each assistant.',
      icon: BookOpen,
      content: [
        'Drop-down menus make the prompting process as simple and user-friendly as possible',
        'Respond to the model using the follow-up dialog to further refine your ideas',
        'Easily combine tools within an assistant to get the most out of your session',
      ],
      useBullets: true,
    },
    {
      title: 'FAQs',
      description: 'Common questions and answers about The Write Stuff Assistant.',
      icon: HelpCircle,
      content: [
        'Q: Is my content private? A: Yes, your content is stored securely and never shared.',
        'Q: How does the free trial work? A: Get 30 days of full access, then just $5/month. Cancel anytime, no penalties.',
        'Q: What payment methods do you accept? A: We accept all major credit cards via Stripe.',
      ],
    },
    {
      title: 'Contact Support',
      description: 'Need help? Our support team is here for you.',
      icon: FileText,
      content: [
        { type: 'emailPart', text: 'Email us at ', email: 'support@armyrunner-studios.com' },
        { type: 'text', text: 'Response time: Usually within 24 hours' },
        { type: 'text', text: 'Include your account email for faster assistance' },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Resources | The Write Stuff Assistant</title>
        <meta name="description" content="Find helpful resources, tutorials, and guides for The Write Stuff Assistant." />
        <link rel="canonical" href="https://writestuffassistant.com/resources" />
      </Helmet>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 z-0">
          <img
            className="object-cover w-full h-full fixed"
            alt="Background bookshelf with warm lighting"
            src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
          />
          <div className="absolute inset-0 bg-black/60 fixed"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-8 flex flex-col min-h-screen pb-24">
          <header className="w-full max-w-6xl mx-auto flex justify-start items-center mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="bg-black text-yellow-400 hover:bg-zinc-800 border-yellow-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
            </Button>
          </header>

          <main className="flex-grow flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl mb-8"
            >
              <h1 className="text-center text-4xl sm:text-5xl font-bold mb-4 text-yellow-400">
                Resources & Support
              </h1>
              <p className="text-center text-yellow-400/80 text-lg mb-8">
                Everything you need to make the most of The Write Stuff Assistant
              </p>
            </motion.div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-zinc-900/50 border-yellow-400/30 hover:border-yellow-400/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <resource.icon className="h-6 w-6 text-yellow-400" />
                        <CardTitle className="text-yellow-400 text-xl">{resource.title}</CardTitle>
                      </div>
                      <CardDescription className="text-yellow-400/70">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {resource.links && (
                        <div className="space-y-2">
                          {resource.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
                            >
                              → {link.text}
                            </a>
                          ))}
                        </div>
                      )}
                      {resource.content && (
                        <div className={`space-y-1.5 text-yellow-400/80 text-sm ${resource.useBullets ? '' : ''}`}>
                          {resource.content.map((item, idx) => {
                            if (typeof item === 'string') {
                              return <div key={idx}>{resource.useBullets ? '• ' : ''}{item}</div>;
                            }
                            if (item.type === 'emailPart') {
                              return (
                                <div key={idx}>
                                  {item.text}<a
                                    href={`mailto:${item.email}`}
                                    className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
                                  >
                                    {item.email}
                                  </a>
                                </div>
                              );
                            }
                            return <div key={idx}>{item.text}</div>;
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <AuthDialog />
                <Button
                  onClick={() => navigate('/demo')}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 py-3 text-lg"
                  size="lg"
                >
                  Try The Demo
                </Button>
              </div>
            </motion.div>
          </main>
        </div>
        <Footer showSubscription={false} />
      </div>
    </>
  );
}

export default Resources;
