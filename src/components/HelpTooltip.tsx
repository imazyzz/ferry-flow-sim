import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  title: string;
  content: string;
}

export function HelpTooltip({ title, content }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
