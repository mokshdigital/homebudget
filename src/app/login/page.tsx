'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/app-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

const EmailAuthForm = ({
  form,
  onSubmit,
  isLoading,
  buttonText,
  idPrefix
}: {
  form: UseFormReturn<FormValues>,
  onSubmit: (data: FormValues) => void,
  isLoading: boolean,
  buttonText: string,
  idPrefix: string
}) => (
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-email`}>Email</Label>
      <Input id={`${idPrefix}-email`} type="email" placeholder="m@example.com" {...form.register("email")} />
      {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-password`}>Password</Label>
      <Input id={`${idPrefix}-password`} type="password" {...form.register("password")} />
      {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
    </div>
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
    </Button>
  </form>
);


export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const signInForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router, supabase.auth]);

  const handleAuthError = (error: { message?: string; code?: string } | null) => {
    setIsLoading(false);
    if (!error) return;

    const message = error.message || 'An unexpected error occurred. Please try again.';

    if (message.includes('Invalid login credentials')) {
      setAuthError('Invalid email or password. Please try again.');
    } else if (message.includes('User already registered')) {
      setAuthError('An account with this email already exists.');
    } else if (message.includes('Email not confirmed')) {
      setAuthError('Please check your email to confirm your account.');
    } else {
      setAuthError(message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      handleAuthError(error);
    }
  };

  const handleEmailAuth = async (data: FormValues, isSignUp: boolean) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          handleAuthError(error);
        } else {
          // Check if email confirmation is required
          setAuthError(null);
          setIsLoading(false);
          // For now, try to sign in immediately (if email confirmation is disabled)
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError) {
            // Email confirmation might be required
            setAuthError('Account created! Please check your email to confirm, then sign in.');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          handleAuthError(error);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      handleAuthError({ message: 'An unexpected error occurred.' });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    signInForm.clearErrors();
    signUpForm.clearErrors();
    setAuthError(null);
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className='flex justify-center mb-4'>
            <AppLogo />
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <EmailAuthForm
                form={signInForm}
                onSubmit={(data) => handleEmailAuth(data, false)}
                isLoading={isLoading && activeTab === 'signin'}
                buttonText="Sign In"
                idPrefix="signin"
              />
            </TabsContent>
            <TabsContent value="signup">
              <EmailAuthForm
                form={signUpForm}
                onSubmit={(data) => handleEmailAuth(data, true)}
                isLoading={isLoading && activeTab === 'signup'}
                buttonText="Create Account"
                idPrefix="signup"
              />
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full flex items-center justify-center" disabled={isLoading}>
            <GoogleIcon />
            Sign in with Google
          </Button>

          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center text-sm text-destructive mt-4"
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
