'use client';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true, amount: 0.8 }}
    className="bg-card p-6 rounded-2xl border border-border/10 shadow-lg hover:shadow-primary/10 transition-shadow"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary/90 hover:bg-primary">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container relative grid lg:grid-cols-2 items-center justify-center gap-12 py-24 md:py-32">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tighter">
              Unlock Your Potential with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                StudyGenius
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Your personal AI-powered learning companion. Create dynamic
              roadmaps, master concepts with interactive quizzes, and connect
              with a vibrant community of learners.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Learning for Free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            <Image
              src="https://placehold.co/600x400.png"
              alt="StudyGenius Dashboard"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
              data-ai-hint="app dashboard"
            />
            <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-bold">New Skill Mastered!</p>
                  <p className="text-sm text-muted-foreground">
                    Calculus Fundamentals
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                A Smarter Way to Learn
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                StudyGenius combines cutting-edge AI with proven learning
                techniques to create a personalized educational experience.
              </p>
            </div>
            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BrainCircuit size={24} />}
                title="AI-Powered Roadmaps"
                description="Generate personalized learning plans tailored to your goals, expertise, and schedule."
                delay={0.1}
              />
              <FeatureCard
                icon={<BookOpen size={24} />}
                title="Interactive Learning"
                description="Get detailed explanations for any concept and test your knowledge with AI-generated quizzes."
                delay={0.2}
              />
              <FeatureCard
                icon={<Sparkles size={24} />}
                title="Smart Material Processing"
                description="Upload your documents and instantly get summaries, quizzes, and flashcards."
                delay={0.3}
              />
              <FeatureCard
                icon={<Users size={24} />}
                title="Community Study Zone"
                description="Collaborate with peers, ask questions, and share insights in real-time discussion channels."
                delay={0.4}
              />
              <FeatureCard
                icon={<GraduationCap size={24} />}
                title="Progress Tracking"
                description="Monitor your study streaks, skills mastered, and overall progress on your personal dashboard."
                delay={0.5}
              />
              <FeatureCard
                icon={<Sparkles size={24} />}
                title="Resource Discovery"
                description="Find curated articles, videos, and news based on your fields of interest to stay ahead."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners who are achieving their educational
              goals faster and more effectively with StudyGenius.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up Now for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-card/50 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-primary">
              Features
            </Link>
            <Link href="#" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary">
              Terms of Service
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudyGenius. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
