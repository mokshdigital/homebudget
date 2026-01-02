
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Disclaimer - MyHomeBudget',
    description: 'Disclaimer for MyHomeBudget. The information provided is for general informational purposes only and is not a substitute for professional financial advice.',
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

export default function DisclaimerPage() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <StaticPageHeader />
            <main className="container mx-auto px-4 pt-32 pb-16">
                <article className="prose prose-invert lg:prose-xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight">Disclaimer</h1>
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    
                    <p>The information provided by MyHomeBudget ("we," "us," or "our") on our application is for general informational purposes only. All information on the application is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the application.</p>

                    <h2>Not Financial Advice</h2>
                    <p>
                        The Service cannot and does not contain financial advice. The financial information is provided for general informational and educational purposes only and is not a substitute for professional advice.
                    </p>
                    <p>
                        Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of financial advice. The use or reliance of any information contained on this site is solely at your own risk.
                    </p>
                    
                    <h2>AI-Generated Content</h2>
                    <p>
                        The application uses artificial intelligence to generate budget suggestions and financial insights. This content is generated based on the data you provide and may contain inaccuracies or errors. It should not be considered a substitute for professional financial planning. You are solely responsible for your financial decisions.
                    </p>

                    <h2>External Links Disclaimer</h2>
                    <p>
                        The application may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
                    </p>
                </article>
            </main>
        </div>
    );
}
