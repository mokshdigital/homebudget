
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Privacy Policy - MyHomeBudget',
    description: 'Read the Privacy Policy for MyHomeBudget to understand how we collect, use, and protect your personal and financial data.',
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

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <StaticPageHeader />
            <main className="container mx-auto px-4 pt-32 pb-16">
                <article className="prose prose-invert lg:prose-xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <p>
                        MyHomeBudget ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect via the Application includes:
                    </p>
                    <ul>
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Application.</li>
                        <li><strong>Financial Data:</strong> Financial information, such as data related to your expenses, income, budgets, and transactions, that you voluntarily enter into the Application. We do not store bank account numbers or credit card numbers. All financial data you provide is encrypted and stored securely.</li>
                        <li><strong>Data from Social Networks:</strong> User information from social networking sites, such as Google, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.</li>
                    </ul>

                    <h2>2. Use of Your Information</h2>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
                    </p>
                    <ul>
                        <li>Create and manage your account.</li>
                        <li>Generate personalized financial insights and budget suggestions.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                        <li>Anonymously compile statistical data for our internal use or with third parties.</li>
                    </ul>

                    <h2>3. Security of Your Information</h2>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h2>4. Policy for Children</h2>
                    <p>
                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                    </p>

                    <h2>5. Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at: privacy@myhomebudget.app
                    </p>
                </article>
            </main>
        </div>
    );
}
