'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { ArrowLeft, Palette, Bot, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUiStore } from '@/lib/stores/ui-store';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-4 pl-7">{children}</div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { layoutMode, setLayoutMode, model, setModel } = useUiStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery(trpc.settings.getAll.queryOptions());
  const settingsData = (settingsQuery.data ?? {}) as Record<string, unknown>;

  const setSettingMutation = useMutation(
    trpc.settings.set.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.settings.getAll.queryKey() });
      },
    }),
  );

  const updateSetting = useCallback(
    (key: string, value: unknown) => {
      setSettingMutation.mutate({ key, value });
    },
    [setSettingMutation],
  );

  const systemPrompt = (settingsData['systemPrompt'] as string) ?? '';

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-8">
          <SettingsSection icon={Palette} title="Appearance">
            <SettingsRow label="Theme" description="Choose light, dark, or system theme">
              <Select value={theme ?? 'system'} onValueChange={setTheme}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow label="Default layout" description="Layout mode for new conversations">
              <Select value={layoutMode} onValueChange={(v) => setLayoutMode(v as 'focus' | 'minimal' | 'productivity')}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </SettingsSection>

          <Separator />

          <SettingsSection icon={Bot} title="Claude Code">
            <SettingsRow label="Default model" description="Model used for new conversations">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-sonnet-4-5">Sonnet 4.5</SelectItem>
                  <SelectItem value="claude-opus-4-5">Opus 4.5</SelectItem>
                  <SelectItem value="claude-haiku-4-5">Haiku 4.5</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>

            <div className="space-y-2">
              <Label>System prompt</Label>
              <p className="text-xs text-muted-foreground">
                Additional instructions prepended to every conversation
              </p>
              <Textarea
                placeholder="e.g., Always respond in Spanish..."
                value={systemPrompt}
                onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </SettingsSection>

          <Separator />

          <SettingsSection icon={Info} title="About">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Vibe Platform</span> v0.1.0
              </p>
              <p>
                Multi-enterprise management platform for vibe coding with Claude Code.
              </p>
              <p className="text-xs">
                Built with Next.js 15, tRPC, SQLite, and Claude Code CLI.
              </p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
