// PCFBoard Design Tokens — TypeScript export
// Generated from tokens.json. Use these in JS/TS code; use tokens.css for stylesheets.

export const color = {
  surface: {
    bg:      '#FFFFFF',
    bg1:     '#FAFBFC',
    bg2:     '#F4F6F8',
    bg3:     '#EEF1F4',
    bgInset: '#F7F9FA',
  },
  border: {
    line:        '#E6E9ED',
    line2:       '#D9DEE3',
    lineStrong:  '#C2C8CF',
    lineSoft:    '#EEF0F3',
  },
  fg: {
    fg:   '#0D1116',
    fg1:  '#1F2630',
    fg2:  '#4A5560',
    fg3:  '#6B7682',
    fg4:  '#94A0AD',
  },
  accent: {
    accent:      '#0F4C5C',
    accentHover: '#0C3E4B',
    accentSoft:  '#E7F1F3',
    accentFg:    '#FFFFFF',
  },
  /** Scope palette — domain-critical. Never reuse for non-Scope purposes. */
  scope: {
    s1:     '#0F4C5C', // Direct emissions
    s1Soft: '#D6E4E8',
    s2:     '#2A9D8F', // Purchased electricity/steam
    s2Soft: '#D8EEEB',
    s3:     '#A7C957', // Value chain
    s3Soft: '#ECF2D6',
  },
  /** Lifecycle palette — sequential, used in Sankey/Treemap/Waterfall. */
  lifecycle: {
    raw:  '#0F4C5C',
    mfg:  '#2A9D8F',
    dist: '#4A90A4',
    use:  '#8AAAB1',
    eol:  '#C2CFB6',
  },
  status: {
    pos:      '#0A7C4A', // emissions DOWN = good
    posSoft:  '#E3F3EB',
    neg:      '#B42318',
    negSoft:  '#FDECEB',
    warn:     '#B25E09',
    warnSoft: '#FBF0E0',
    info:     '#1E5FB4',
    infoSoft: '#E6EEF9',
  },
} as const;

export const type = {
  family: {
    sans: `Pretendard, "IBM Plex Sans KR", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`,
    mono: `"IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`,
    num:  `"IBM Plex Mono", ui-monospace, monospace`,
  },
  size: {
    display: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' },
    h1:      { fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' },
    h2:      { fontSize: 17, fontWeight: 600 },
    h3:      { fontSize: 14, fontWeight: 600 },
    body:    { fontSize: 13, fontWeight: 400 },
    sm:      { fontSize: 12, fontWeight: 400 },
    xs:      { fontSize: 11, fontWeight: 400 },
    micro:   { fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' as const },
    mono:    { fontSize: 12, fontFamily: 'mono' as const },
  },
  featureSettings: `'tnum', 'ss01', 'cv11'`,
} as const;

export const spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s7: 32, s8: 40, s9: 56,
} as const;

export const radius = {
  r1: 4, r2: 6, r3: 8, r4: 10, r5: 14,
} as const;

export const shadow = {
  s1:   '0 1px 0 rgba(15,30,45,0.04)',
  s2:   '0 1px 2px rgba(15,30,45,0.06), 0 1px 0 rgba(15,30,45,0.04)',
  s3:   '0 4px 12px rgba(15,30,45,0.08), 0 1px 2px rgba(15,30,45,0.06)',
  pop:  '0 12px 32px rgba(15,30,45,0.12), 0 2px 6px rgba(15,30,45,0.08)',
  focusRing: '0 0 0 3px rgba(15,76,92,0.15)',
} as const;

export const duration = {
  fast: 120, base: 180, slow: 320,
} as const;

export const control = {
  heightSm: 26, height: 30, heightLg: 34,
} as const;

/** Number formatters — mandatory across the app. */
export const fmt = {
  /** 1234.567 → "1,234.57" */
  n: (v: number | null | undefined, dp = 2) =>
    v == null || Number.isNaN(v) ? '—' :
    Number(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  /** 1234567 → "1,234,567" */
  i: (v: number | null | undefined) =>
    v == null ? '—' : Number(v).toLocaleString('en-US'),
  /** -3.2 → "−3.2%" */
  pct: (v: number | null | undefined, dp = 1) => {
    if (v == null) return '—';
    const sign = v > 0 ? '+' : v < 0 ? '−' : '';
    return `${sign}${Math.abs(v).toFixed(dp)}%`;
  },
  krw: (v: number | null | undefined) =>
    v == null ? '—' : '₩' + Math.round(v).toLocaleString('en-US'),
};

export type ScopeId = 1 | 2 | 3;
export type LifecycleStage = 'raw' | 'mfg' | 'dist' | 'use' | 'eol';
export type StatusKey = 'ok' | 'review' | 'missing';

export const tokens = { color, type, spacing, radius, shadow, duration, control };
export default tokens;
