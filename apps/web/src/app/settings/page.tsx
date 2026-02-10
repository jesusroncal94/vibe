import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Settings coming in Phase 1</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Theme, model defaults, allowed tools, and more.
        </p>
      </div>
    </div>
  );
}
