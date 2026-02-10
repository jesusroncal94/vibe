'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'claude-sonnet-4-5', label: 'Sonnet 4.5', description: 'Fast & capable' },
  { id: 'claude-opus-4-5', label: 'Opus 4.5', description: 'Most intelligent' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', description: 'Fastest' },
] as const;

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  const current = models.find((m) => m.id === model) ?? models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          {current?.label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {models.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => onModelChange(m.id)}
            className="flex flex-col items-start"
          >
            <span className="font-medium">{m.label}</span>
            <span className="text-xs text-muted-foreground">{m.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
