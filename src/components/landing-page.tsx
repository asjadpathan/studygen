'use client';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Sparkles,
  Users,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  Rocket,
  Star,
  ChevronRight,
  Bookmark,
  Lightbulb,
  Shield,
  Globe,
  Heart,
  Zap,
  BookText,
  NotebookPen,
  Brain,
  Bot,
  MessageSquare,
  TrendingUp,
  Calendar,
  Award,
  Search,
  Library,
  Puzzle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

// Reusable Feature Card
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
  color = 'blue'
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
}) => {
  const colorMap = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
    pink: 'from-pink-500 to-rose-500',
    indigo: 'from-indigo-500 to-blue-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, amount: 0.8 }}
      className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-start overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <div className="relative z-10">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorMap[color]} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold font-headline mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Stats Component
const StatCard = ({ number, label, icon, delay }: { number: string; label: string; icon: React.ReactNode; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0"
  >
    <div className="flex justify-center mb-3">
      <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">{number}</div>
    <p className="text-gray-600 dark:text-gray-400 font-medium">{label}</p>
  </motion.div>
);

// Testimonial Component
const TestimonialCard = ({ name, role, content, delay }: { name: string; role: string; content: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-0"
  >
    <div className="flex items-center mb-4">
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{content}"</p>
    <div>
      <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
    </div>
  </motion.div>
);

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              StudyGen
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6">
                  Discover Personalized Learning with{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    StudyGen
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                  Our platform uses cutting-edge AI to create personalized roadmaps, quizzes, and resources to accelerate your learning journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    <Link href="/signup">
                      Start Your Journey <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-gray-300 dark:border-gray-700">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">10K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">24/7</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">AI Support</div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-0">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25"></div>
                    <div className="relative bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"></div>
                        <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-1/2"></div>
                      </div>
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-center">
                        AI Roadmap Generated!
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Goal Achieved</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border-0">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">+87% Progress</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="50K+" label="Active Learners" icon={<Users size={24} />} delay={0.1} />
              <StatCard number="200K+" label="Study Hours" icon={<Clock size={24} />} delay={0.2} />
              <StatCard number="95%" label="Success Rate" icon={<Target size={24} />} delay={0.3} />
              <StatCard number="24/7" label="AI Support" icon={<Zap size={24} />} delay={0.4} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Why Choose StudyGen?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                Transform Your Learning Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We combine artificial intelligence with educational expertise to create personalized learning journeys that actually work.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BrainCircuit size={24} />}
                title="Personalized Roadmaps"
                description="AI-tailored learning paths to match your current skills and future goals."
                delay={0.1}
                color="blue"
              />
              <FeatureCard
                icon={<BookOpen size={24} />}
                title="Material Processing"
                description="Upload your study guides to generate summaries, quizzes, and flashcards."
                delay={0.2}
                color="purple"
              />
              <FeatureCard
                icon={<Sparkles size={24} />}
                title="Dynamic Quizzing"
                description="Reinforce concepts with adaptive quizzes and instant feedback."
                delay={0.3}
                color="green"
              />
              <FeatureCard
                icon={<Users size={24} />}
                title="Learning Community"
                description="Join thousands of learners and collaborate in real-time discussion zones."
                delay={0.4}
                color="orange"
              />
              <FeatureCard
                icon={<Search size={24} />}
                title="Resource Discovery"
                description="Always stay ahead with curated articles, insights, and AI-powered updates."
                delay={0.5}
                color="pink"
              />
              <FeatureCard
                icon={<BarChart3 size={24} />}
                title="Progress Tracking"
                description="Monitor your journey with analytics, streaks, and achievement goals."
                delay={0.6}
                color="indigo"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                What Our Learners Say
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Join thousands of students who have transformed their learning journey with StudyGen.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Sarah Johnson"
                role="Medical Student"
                content="StudyGen completely transformed how I prepare for exams. The personalized roadmaps helped me focus on exactly what I needed to learn."
                delay={0.1}
              />
              <TestimonialCard
                name="Michael Chen"
                role="Software Engineer"
                content="The AI-powered quizzes are incredible. They adapt to my learning pace and help me retain information much better than traditional methods."
                delay={0.2}
              />
              <TestimonialCard
                name="Emily Rodriguez"
                role="University Student"
                content="I've tried many learning platforms, but StudyGen's community features and personalized approach are unmatched. Highly recommend!"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-5"></div>
          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">
                Ready to Start Learning Smarter?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Join thousands who are already mastering new skills with StudyGen. Take your first step today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Link href="/signup">
                    Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-gray-300 dark:border-gray-700">
                  <Link href="/login">Login to Account</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold">StudyGen</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Transforming education with AI-powered personalized learning experiences.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Legal</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} StudyGen. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}