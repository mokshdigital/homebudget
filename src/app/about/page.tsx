
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'About MyHomeBudget',
    description: 'Learn about the mission and story behind MyHomeBudget, the smart and simple way to manage your finances.',
};

function StaticPageHeader() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/">
                    <AppLogo />
                </Link>
                <Button asChild>
                    <Link href="/login">Get Started</Link>
                </Button>
            </div>
        </header>
    );
}

export default function AboutPage() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <StaticPageHeader />
            <main className="container mx-auto px-4 pt-32 pb-16">
                <article className="prose prose-invert lg:prose-xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">About MyHomeBudget</h1>
                    <p className="lead text-muted-foreground">
                        We believe managing your money shouldn't be a chore. It should be empowering, insightful, and maybe even a little fun. MyHomeBudget was born from a simple idea: what if your budget app actually worked for you?
                    </p>
                    
                    <h2>Our Mission</h2>
                    <p>
                        Our mission is to provide you with the tools to master your money game. We're here to demystify your spending, help you set achievable goals, and give you the confidence to build a stronger financial future. We leverage the power of AI to provide personalized insights and suggestions, turning your raw data into actionable advice.
                    </p>
                    
                    <h2>Why We Built This</h2>
                    <p>
                        Like many people, we were tired of complicated spreadsheets and budgeting apps that felt like a second job. We wanted something smart, intuitive, and designed for real life. An app that could understand our spending habits and proactively help us save, not just show us where our money went after the fact.
                    </p>
                    <p>
                        MyHomeBudget is the result. It's the app we always wanted for ourselves, and we're excited to share it with you.
                    </p>

                    <h2>Join Us</h2>
                    <p>
                        Your financial journey is unique, and your tools should be too. Join the MyHomeBudget community and start transforming your relationship with money today.
                    </p>
                </article>
            </main>
        </div>
    );
}
