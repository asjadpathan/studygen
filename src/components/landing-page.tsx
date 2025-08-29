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
  Star,
  Zap,
  Globe,
  MessageSquare,
  Heart,
  Brain,
  TrendingUp,
  Search,
  Shield,
  BookText
} from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

// Reusable Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
  color = 'blue',
  comingSoon = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
  comingSoon?: boolean;
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
      className={`group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center transform hover:-translate-y-2 ${comingSoon ? 'opacity-75' : ''}`}
    >
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs px-3 py-1 rounded-full font-medium">
          Coming Soon
        </div>
      )}
      
      <div className={`p-4 rounded-xl bg-gradient-to-r ${colorMap[color]} text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      
      {!comingSoon && (
        <Button variant="ghost" className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Learn More <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
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
    className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-center mb-4">
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
    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 mx-0.5" />
      ))}
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{content}"</p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <Logo />
          </Link>
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
        <section className="relative overflow-hidden py-16 md:py-24">
          {/* Background Elements */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6">
                  Transform Your Learning with{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    AI-Powered Intelligence
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
                  Personalized roadmaps, intelligent assessments, and collaborative study zones that adapt to your unique learning style.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    <Link href="/signup">
                      Launch StudyGen <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-gray-300 dark:border-gray-700">
                    <Link href="#demo">Watch Demo</Link>
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>No Credit Card Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free Forever Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Setup in 2 Minutes</span>
                  </div>
                </motion.div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.9/5</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
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
                className="relative flex justify-center"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl max-w-md">
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
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg animate-float">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Goal Achieved</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg animate-float animation-delay-2000">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">+87% Progress</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="50K+" label="Active Learners" icon={<Users size={24} />} delay={0.1} />
              <StatCard number="200K+" label="Study Hours" icon={<Clock size={24} />} delay={0.2} />
              <StatCard number="95%" label="Success Rate" icon={<Target size={24} />} delay={0.3} />
              <StatCard number="24/7" label="AI Support" icon={<Zap size={24} />} delay={0.4} />
            </div>
          </div>
        </section>

        {/* Problem-Solution Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Problem Statement */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                  Traditional Learning Holds You Back
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                  {[
                    { icon: "😵‍💫", title: "One-Size-Fits-All", desc: "Generic courses ignore your unique learning style" },
                    { icon: "📚", title: "Information Overload", desc: "Too many resources, no clear learning path" },
                    { icon: "😴", title: "Boring Content", desc: "Static materials that don't engage or stick" },
                    { icon: "🏝️", title: "Learning Isolation", desc: "No community support or peer interaction" }
                  ].map((problem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30"
                    >
                      <div className="text-3xl mb-3">{problem.icon}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{problem.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{problem.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-full mb-6">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">StudyGen Solution</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Meet Your AI Learning Companion
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Our intelligent platform adapts to your learning style, creates personalized roadmaps, 
                  and connects you with a thriving community of learners.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-24 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  See StudyGen in Action
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Watch how our AI creates a personalized learning roadmap in seconds
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Demo Steps */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {[
                    { step: "1", title: "Tell us your goals", desc: "Share what you want to learn and your current skill level", icon: <Target className="h-6 w-6" /> },
                    { step: "2", title: "AI analyzes & creates", desc: "Our AI generates a personalized learning roadmap instantly", icon: <BrainCircuit className="h-6 w-6" /> },
                    { step: "3", title: "Learn & progress", desc: "Follow your custom path with interactive content and community support", icon: <TrendingUp className="h-6 w-6" /> }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button size="lg" className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Try Interactive Demo
                  </Button>
                </motion.div>

                {/* Animated Demo Visual */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">AI Roadmap Generator</h4>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse animation-delay-300"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse animation-delay-600"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">JavaScript Fundamentals</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 border-2 border-blue-500 rounded-full animate-spin"></div>
                          <span className="text-sm">React Components</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 border border-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-400">Advanced Hooks</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg text-center">
                        <div className="text-sm opacity-90">Next Recommended:</div>
                        <div className="font-semibold">Interactive Quiz on State Management</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Why Choose StudyGen?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Transform Your Learning Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We combine artificial intelligence with educational expertise to create personalized learning journeys that actually work.
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BrainCircuit size={24} />}
                title="AI-Powered Roadmaps"
                description="Personalized learning paths that adapt to your current skills, goals, and learning pace."
                delay={0.1}
                color="blue"
              />
              <FeatureCard
                icon={<BookOpen size={24} />}
                title="Smart Content Processing"
                description="Upload any document to instantly generate summaries, quizzes, and interactive flashcards."
                delay={0.2}
                color="purple"
              />
              <FeatureCard
                icon={<Sparkles size={24} />}
                title="Adaptive Assessments"
                description="Dynamic quizzes that evolve with your progress and provide instant, personalized feedback."
                delay={0.3}
                color="green"
              />
              <FeatureCard
                icon={<Users size={24} />}
                title="Community Learning"
                description="Join study zones, collaborate in real-time, and learn from thousands of active peers."
                delay={0.4}
                color="orange"
              />
              <FeatureCard
                icon={<Search size={24} />}
                title="Global Resource Discovery"
                description="AI-curated articles, insights, and learning materials tailored to your interests."
                delay={0.5}
                color="pink"
              />
              <FeatureCard
                icon={<BarChart3 size={24} />}
                title="Progress Intelligence"
                description="Comprehensive analytics with study streaks, skill mastery tracking, and achievement goals."
                delay={0.6}
                color="indigo"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Learners Say
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Join thousands of students who have transformed their learning journey with StudyGen.
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Sarah Johnson"
                role="Medical Student"
                content="StudyGen completely transformed how I prepare for exams. The AI-generated roadmaps helped me focus on exactly what I needed to learn, and I saw a 40% improvement in my test scores."
                delay={0.1}
              />
              <TestimonialCard
                name="Michael Chen"
                role="Software Engineer"
                content="The AI-powered quizzes are incredible. They adapt to my learning pace and help me retain information much better than traditional methods. The community features are also amazing!"
                delay={0.2}
              />
              <TestimonialCard
                name="Emily Rodriguez"
                role="University Student"
                content="I've tried many learning platforms, but StudyGen's personalized approach and collaborative features are unmatched. It's like having a personal tutor and study group combined."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Limited Time: Free Forever Plan</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Transform Your Learning Journey
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Starting Today
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Join over 50,000 learners who've accelerated their education with AI-powered personalization. 
                No credit card required, setup in under 2 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg px-8 py-4">
                  <Link href="/signup">
                    Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-gray-300 dark:border-gray-700 text-lg px-8 py-4">
                  <Link href="#demo">Watch 2-Min Demo</Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.9/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <Link href="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <Logo />
              </Link>
              <p className="text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} StudyGen. All rights reserved.
              </p>
            </div>
            
            <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                <Link href="#features" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Features</Link>
                <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Login</Link>
                <Link href="/signup" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Sign Up</Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Contact</Link>
            </nav>

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
