import { THEME_INIT_SCRIPT } from "@/lib/theme/apply-theme";

/** Inline FOUC prevention — runs before React hydration. */
export function ThemeInitScript() {
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
