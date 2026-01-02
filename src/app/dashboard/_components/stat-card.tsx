import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from 'lucide-react';
import { MotionDiv } from "@/components/motion-div";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'destructive';
  className?: string;
  index?: number;
};

export default function StatCard({ title, value, icon: Icon, description, variant = 'default', className, index = 0 }: StatCardProps) {
  const isDestructive = variant === 'destructive';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <MotionDiv
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
    >
        <Card className={cn(
        "transition-all hover:shadow-lg hover:-translate-y-1 text-white border-0",
        isDestructive ? 'bg-red-700/90' : '',
        className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", isDestructive ? 'text-white' : 'text-white/80')} />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", isDestructive && 'text-white')}>{value}</div>
                {description && <p className={cn("text-xs", isDestructive ? 'text-white/90' : 'text-white/80')}>{description}</p>}
            </CardContent>
        </Card>
    </MotionDiv>
  );
}
