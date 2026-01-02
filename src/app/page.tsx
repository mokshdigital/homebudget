
'use client';

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { DollarSign, BarChart, Zap, UserPlus, ArrowRight, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { MotionDiv } from "@/components/motion-div";
import Image from "next/image";
import Link from "next/link";
import { Bot, FileText, ArrowLeftRight } from 'lucide-react';


const features = [
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Track Your Vibe",
      description: "Log expenses faster than you can say 'avocado toast.' See where your money really goes.",
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI Budget Buddy",
      description: "Our AI suggests budgets that actually make sense for your lifestyle. No more guessing games.",
    },
    {
        icon: <Zap className="h-8 w-8 text-primary" />,
        title: "Receipt Scanner",
        description: "Just snap a pic of your receipt. We'll digitize the details so you don't have to.",
      },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Visual Reports",
      description: "Glow up your finances with charts that are actually easy to understand. See your spending habits at a glance.",
    },
];

const howItWorks = [
    {
        icon: <UserPlus className="h-10 w-10 text-accent" />,
        title: "Sign Up Fast",
        description: "Create your account in seconds. All you need is an email.",
    },
    {
        icon: <ArrowLeftRight className="h-10 w-10 text-accent" />,
        title: "Log Your Spending",
        description: "Quickly add expenses, income, and savings as they happen.",
    },
    {
        icon: <BarChart className="h-10 w-10 text-accent" />,
        title: "Get Smart Insights",
        description: "Let our AI analyze your habits and give you personalized tips to save.",
    }
]

function LandingHeader() {
    const router = useRouter();
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <AppLogo />
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => router.push('/login')}>Sign In</Button>
                    <Button onClick={() => router.push('/login')} className="bg-primary hover:bg-primary/90">Get Started</Button>
                </div>
            </div>
        </header>
    );
}

function LandingFooter() {
    return (
        <footer className="w-full border-t border-border/50 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} MyHomeBudget. Level up your money game.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <Link href="/about" className="hover:text-primary">About</Link>
                    <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="hover:text-primary">Terms & Conditions</Link>
                    <Link href="/disclaimer" className="hover:text-primary">Disclaimer</Link>
                </div>
            </div>
        </footer>
    )
}

export default function LandingPage() {
    const router = useRouter();
    const cardVariants = {
        offscreen: { y: 50, opacity: 0 },
        onscreen: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                bounce: 0.4,
                duration: 0.8
            }
        }
    };
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
        <LandingHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center pt-40 pb-20 text-center overflow-hidden">
        <div 
            className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob"
            style={{ animationDelay: '0s' }}
        ></div>
        <div 
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-blob"
            style={{ animationDelay: '2s' }}
        ></div>
          <div className="container px-4 z-10">
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Master Your Money Game.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              MyHomeBudget is the smart, simple, and seriously good-looking way to track expenses, crush budgets, and actually save money.
            </p>
            <div className="mt-10">
              <Button size="lg" onClick={() => router.push('/login')} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
                Start for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="howitworks" className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold">Get Your Finances Sorted in 3 Easy Steps</h2>
                    <p className="text-muted-foreground mt-4 max-w-xl mx-auto">It’s easier than deciding what to watch on Netflix.</p>
                </div>
                <div className="grid gap-12 md:grid-cols-3">
                    {howItWorks.map((step, index) => (
                        <MotionDiv 
                            key={index}
                            className="text-center"
                            initial="offscreen"
                            whileInView="onscreen"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={{...cardVariants, onscreen: {...cardVariants.onscreen, transition: {...cardVariants.onscreen.transition, delay: index * 0.2}}}}
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mx-auto mb-6 border border-border">
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-semibold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">This App Actually Slaps</h2>
              <p className="text-muted-foreground mt-4">Features that make adulting a little less painful.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <MotionDiv 
                  key={index} 
                  className="bg-background/50 p-6 rounded-lg border border-border/80 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2"
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={{...cardVariants, onscreen: {...cardVariants.onscreen, transition: {...cardVariants.onscreen.transition, delay: index * 0.1}}}}
                >
                  <div className="flex items-center justify-center rounded-lg bg-secondary mb-5 h-14 w-14">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold">Ready to Stop Being Broke?</h2>
                <p className="text-muted-foreground mt-4 mb-8 max-w-lg mx-auto">Start your journey to financial clarity. Your future self will thank you.</p>
                <Button size="lg" onClick={() => router.push('/login')} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Sign Up - It's Free
                </Button>
            </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
