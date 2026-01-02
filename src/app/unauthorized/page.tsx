
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/app-logo';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            Your session is invalid or has expired. Please sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')} className="w-full">
            Return to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    