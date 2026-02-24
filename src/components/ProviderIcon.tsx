/**
 * Simple inline SVG logos for LLM providers.
 * These are minimal recognizable marks — not full trademarks.
 */

interface Props {
  provider?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** OpenAI hexagon/pentagon mark */
function OpenAIIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

/** Anthropic "A" mark */
function AnthropicIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M13.827 3.52h3.603L24 20.48h-3.603L13.827 3.52zm-7.258 0h3.767L16.906 20.48h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm1.04 3.781L5.251 13.58h4.716L7.609 7.3z" />
    </svg>
  );
}

/** Google "G" four-color mark simplified */
function GoogleIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/** Venice.ai mark */
function VeniceIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 2L2 22h20L12 2zm0 4.5L18.5 20h-13L12 6.5z" />
    </svg>
  );
}

/** ChainGPT mark */
function ChainGPTIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 1.5a2.5 2.5 0 0 1 2.5 2.5v1.17a7.5 7.5 0 0 1 4.33 4.33H20a2.5 2.5 0 0 1 0 5h-1.17a7.5 7.5 0 0 1-4.33 4.33V20a2.5 2.5 0 0 1-5 0v-1.17A7.5 7.5 0 0 1 5.17 14.5H4a2.5 2.5 0 0 1 0-5h1.17A7.5 7.5 0 0 1 9.5 5.17V4A2.5 2.5 0 0 1 12 1.5zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}

/** ThirdWeb mark */
function ThirdWebIcon({ className, style }: Omit<Props, "provider">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M3 7h4l2 5 2-5h4l2 5 2-5h4l-4 10h-4l-2-5-2 5H7L3 7z" />
    </svg>
  );
}

/** Fallback: first letter in a circle */
function FallbackIcon({ provider, className, style }: Props) {
  const letter = (provider ?? "?").charAt(0).toUpperCase();
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16.5" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">{letter}</text>
    </svg>
  );
}

export default function ProviderIcon({ provider, className = "h-5 w-5", style }: Props) {
  const p = (provider ?? "").toLowerCase();
  if (p === "openai") return <OpenAIIcon className={className} style={style} />;
  if (p === "anthropic") return <AnthropicIcon className={className} style={style} />;
  if (p === "google") return <GoogleIcon className={className} style={style} />;
  if (p === "venice") return <VeniceIcon className={className} style={style} />;
  if (p === "chaingpt") return <ChainGPTIcon className={className} style={style} />;
  if (p === "thirdweb") return <ThirdWebIcon className={className} style={style} />;
  return <FallbackIcon provider={provider} className={className} style={style} />;
}
