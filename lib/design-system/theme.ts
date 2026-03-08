export type UiState = "idle" | "loading" | "success" | "error";

export interface ThemeTokens {
  color: {
    brand: string;
    accent: string;
    danger: string;
    warning: string;
    success: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  typography: {
    display: string;
    body: string;
    mono: string;
  };
  spacing: Record<"xs" | "sm" | "md" | "lg" | "xl", string>;
  radius: Record<"sm" | "md" | "lg" | "xl", string>;
  shadow: Record<"soft" | "glow" | "intense", string>;
  motion: {
    fast: string;
    normal: string;
    slow: string;
    ease: string;
  };
}

export interface SemanticTokens {
  bg: {
    app: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const themeTokens: ThemeTokens = {
  color: {
    brand: "#ffcf30",
    accent: "#13d7ff",
    danger: "#ff4d87",
    warning: "#ff8a3d",
    success: "#00d58f",
    background: "#0d0f19",
    surface: "#141a2a",
    text: "#f5f7ff",
    muted: "#9ca4bf",
    border: "#2a3558",
  },
  typography: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    mono: "var(--font-mono)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  shadow: {
    soft: "0 10px 30px rgba(6, 10, 24, 0.35)",
    glow:
      "0 0 0 1px rgba(255, 207, 48, 0.25), 0 16px 40px rgba(255, 207, 48, 0.2)",
    intense:
      "0 0 0 1px rgba(19, 215, 255, 0.35), 0 24px 60px rgba(19, 215, 255, 0.3)",
  },
  motion: {
    fast: "120ms",
    normal: "240ms",
    slow: "420ms",
    ease: "cubic-bezier(0.2, 0.65, 0.2, 1)",
  },
};

export const semanticTokens: SemanticTokens = {
  bg: {
    app: "var(--bg-app)",
    surface: "var(--bg-surface)",
    elevated: "var(--bg-elevated)",
  },
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    muted: "var(--text-muted)",
  },
  status: {
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    error: "var(--status-error)",
    info: "var(--status-info)",
  },
};
