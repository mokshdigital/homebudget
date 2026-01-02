
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Terms & Conditions - MyHomeBudget',
    description: 'Read the Terms and Conditions for using the MyHomeBudget application. Your use of the service is subject to these terms.',
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

export default function TermsAndConditionsPage() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <StaticPageHeader />
            <main className="container mx-auto px-4 pt-32 pb-16">
                <article className="prose prose-invert lg:prose-xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the MyHomeBudget application (the "Service") operated by MyHomeBudget ("us", "we", or "our").</p>
                    <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
                    
                    <h2>1. Accounts</h2>
                    <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                    <h2>2. Intellectual Property</h2>
                    <p>The Service and its original content, features, and functionality are and will remain the exclusive property of MyHomeBudget and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

                    <h2>3. Limitation Of Liability</h2>
                    <p>In no event shall MyHomeBudget, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                    <h2>4. Disclaimer</h2>
                    <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied. See our Disclaimer page for more details.</p>

                    <h2>5. Governing Law</h2>
                    <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>

                    <h2>6. Changes</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

                    <h2>Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at: legal@myhomebudget.app</p>
                </article>
            </main>
        </div>
    );
}
