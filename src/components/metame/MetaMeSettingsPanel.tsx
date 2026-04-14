/**
 * MetaMeSettingsPanel — shared settings form for the metaMe Runtime.
 * Persists to localStorage under METAME_SETTINGS_KEY.
 */
import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const METAME_SETTINGS_KEY = "metame_alpha_settings";

export interface MetaMeSettings {
  guardianMode: boolean;
  leadAgent: string;
  budgetPosture: "low" | "medium" | "high";
  receiptVisibility: boolean;
  curatedSkillsOnly: boolean;
  explanationFirst: boolean;
}

export const METAME_ALPHA_DEFAULTS: MetaMeSettings = {
  guardianMode: true,
  leadAgent: "aigent-kn0w1",
  budgetPosture: "low",
  receiptVisibility: true,
  curatedSkillsOnly: true,
  explanationFirst: true,
};

export function loadMetaMeSettings(): MetaMeSettings {
  try {
    const raw = localStorage.getItem(METAME_SETTINGS_KEY);
    if (raw) return { ...METAME_ALPHA_DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...METAME_ALPHA_DEFAULTS };
}

export function saveMetaMeSettings(settings: MetaMeSettings) {
  localStorage.setItem(METAME_SETTINGS_KEY, JSON.stringify(settings));
}

export default function MetaMeSettingsPanel() {
  const [settings, setSettings] = useState<MetaMeSettings>(loadMetaMeSettings);

  const update = useCallback(<K extends keyof MetaMeSettings>(key: K, value: MetaMeSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveMetaMeSettings(next);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Guardian Mode */}
      <SettingRow
        label="Guardian Mode"
        description="Require approval before agents take actions on your behalf."
      >
        <Switch
          checked={settings.guardianMode}
          onCheckedChange={(v) => update("guardianMode", v)}
        />
      </SettingRow>

      {/* Lead Agent */}
      <SettingRow
        label="Lead Agent"
        description="Primary agent that handles your requests."
      >
        <Select value={settings.leadAgent} onValueChange={(v) => update("leadAgent", v)}>
          <SelectTrigger className="w-40 h-8 text-xs" style={{ backgroundColor: 'var(--mm-surface-2)', borderColor: 'var(--mm-line-soft)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: 'var(--mm-surface-1)' }}>
            <SelectItem value="aigent-kn0w1">Aigent Kn0w1</SelectItem>
            <SelectItem value="aigent-z">Aigent Z</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      {/* Spend Autonomy */}
      <SettingRow
        label="Spend Autonomy"
        description="How much agents can spend without asking."
      >
        <Select value={settings.budgetPosture} onValueChange={(v) => update("budgetPosture", v as MetaMeSettings["budgetPosture"])}>
          <SelectTrigger className="w-28 h-8 text-xs" style={{ backgroundColor: 'var(--mm-surface-2)', borderColor: 'var(--mm-line-soft)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: 'var(--mm-surface-1)' }}>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      {/* Receipt Visibility */}
      <SettingRow
        label="Show Receipts"
        description="Display transaction receipts after agent actions."
      >
        <Switch
          checked={settings.receiptVisibility}
          onCheckedChange={(v) => update("receiptVisibility", v)}
        />
      </SettingRow>

      {/* Curated Skills Only */}
      <SettingRow
        label="Curated Skills Only"
        description="Restrict agents to pre-approved skill sets."
      >
        <Switch
          checked={settings.curatedSkillsOnly}
          onCheckedChange={(v) => update("curatedSkillsOnly", v)}
        />
      </SettingRow>

      {/* Explanation First */}
      <SettingRow
        label="Explain Before Acting"
        description="Agents explain their plan before executing."
      >
        <Switch
          checked={settings.explanationFirst}
          onCheckedChange={(v) => update("explanationFirst", v)}
        />
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium" style={{ color: 'var(--mm-ink-primary)' }}>{label}</Label>
        <p className="text-xs mt-0.5" style={{ color: 'var(--mm-ink-muted)' }}>{description}</p>
      </div>
      {children}
    </div>
  );
}
