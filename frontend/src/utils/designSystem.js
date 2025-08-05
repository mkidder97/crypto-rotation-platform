import { clsx } from 'clsx';

// Tesla-inspired Enterprise Design System Colors
export const colors = {
  // Into the Cryptoverse inspired professional palette
  background: {
    primary: '#010b16',      // Deep navy primary background
    secondary: '#0a1525',    // Slightly lighter navy
    tertiary: '#162030',     // Card backgrounds
    surface: '#1e2b3d',      // Surface elements
    elevated: '#242f42',     // Elevated surfaces
  },
  
  accent: {
    primary: '#007aff',      // Tesla-inspired electric blue
    secondary: '#0066d6',    // Darker blue for hover states
    tertiary: '#004499',     // Deep blue for active states
    gradient: 'linear-gradient(135deg, #007aff 0%, #0066d6 100%)',
  },
  
  text: {
    primary: '#ffffff',      // Pure white for primary text
    secondary: '#e5e5e5',    // Light gray for secondary text
    tertiary: '#b0b8c4',     // Medium gray for tertiary text
    muted: '#8892a0',        // Muted text
    inverse: '#010b16',      // Dark text on light backgrounds
  },
  
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',     // Subtle white borders
    accent: 'rgba(0, 122, 255, 0.3)',         // Accent borders
    hover: 'rgba(255, 255, 255, 0.12)',       // Hover state borders
    focus: 'rgba(0, 122, 255, 0.5)',          // Focus state borders
  },
  
  status: {
    success: '#00d4aa',      // Success green
    warning: '#ff9f0a',      // Warning orange
    danger: '#ff453a',       // Danger red
    info: '#007aff',         // Info blue
    neutral: '#8e8e93',      // Neutral gray
  },
  
  crypto: {
    bitcoin: '#f7931a',      // Bitcoin orange
    ethereum: '#627eea',     // Ethereum blue
    profit: '#00d4aa',       // Profit green
    loss: '#ff453a',         // Loss red
  },
  
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    accent: 'rgba(0, 122, 255, 0.08)',
  }
};

// Tesla-inspired Professional Gradients
export const gradients = {
  // Phase-specific gradients with Tesla-like electric aesthetics
  bitcoin: `linear-gradient(135deg, ${colors.crypto.bitcoin} 0%, #e67e22 100%)`,
  ethereum: `linear-gradient(135deg, ${colors.crypto.ethereum} 0%, #4a69bd 100%)`,
  altseason: `linear-gradient(135deg, ${colors.status.success} 0%, #00a085 100%)`,
  cash: `linear-gradient(135deg, ${colors.status.danger} 0%, #c0392b 100%)`,
  
  // Tesla-inspired electric gradients
  primary: colors.accent.gradient,
  electric: 'linear-gradient(135deg, #007aff 0%, #00d4aa 100%)',
  neural: 'linear-gradient(135deg, #162030 0%, #1e2b3d 100%)',
  
  // Professional glass effects
  glass: `backdrop-blur-xl bg-gradient-to-br from-${colors.glass.medium} to-${colors.glass.light}`,
  glassDark: `backdrop-blur-xl bg-gradient-to-br from-${colors.background.tertiary} to-${colors.background.surface}`,
};

// Enterprise Glassmorphism System
export const glass = (intensity = 'medium', accent = false) => {
  const baseIntensities = {
    light: `backdrop-blur-sm bg-gradient-to-br from-${colors.glass.light} to-transparent`,
    medium: `backdrop-blur-md bg-gradient-to-br from-${colors.glass.medium} to-${colors.glass.light}`,
    strong: `backdrop-blur-lg bg-gradient-to-br from-${colors.glass.strong} to-${colors.glass.medium}`,
    ultra: `backdrop-blur-xl bg-gradient-to-br from-${colors.glass.strong} via-${colors.glass.medium} to-${colors.glass.light}`,
  };
  
  const accentIntensities = {
    light: `backdrop-blur-sm bg-gradient-to-br from-${colors.glass.accent} to-transparent`,
    medium: `backdrop-blur-md bg-gradient-to-br from-${colors.glass.accent} to-${colors.glass.light}`,
    strong: `backdrop-blur-lg bg-gradient-to-br from-${colors.glass.accent} to-${colors.glass.medium}`,
    ultra: `backdrop-blur-xl bg-gradient-to-br from-${colors.glass.accent} via-${colors.glass.medium} to-${colors.glass.light}`,
  };
  
  return accent ? accentIntensities[intensity] : baseIntensities[intensity];
};

// Tesla-inspired Professional Shadows
export const shadows = {
  // Subtle professional shadows
  card: 'shadow-2xl shadow-black/20',
  cardHover: 'shadow-3xl shadow-black/30',
  
  // Electric glow effects inspired by Tesla UI
  glow: `shadow-2xl shadow-[${colors.accent.primary}]/25`,
  glowStrong: `shadow-3xl shadow-[${colors.accent.primary}]/40`,
  
  // Crypto-specific glows
  glowBitcoin: `shadow-2xl shadow-[${colors.crypto.bitcoin}]/25`,
  glowEthereum: `shadow-2xl shadow-[${colors.crypto.ethereum}]/25`,
  glowSuccess: `shadow-2xl shadow-[${colors.status.success}]/25`,
  glowDanger: `shadow-2xl shadow-[${colors.status.danger}]/25`,
  
  // Inner shadows for depth
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  innerStrong: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
};

// Enterprise Card Component System
export const card = {
  // Base card with Tesla-inspired aesthetics
  base: clsx(
    'rounded-3xl border transition-all duration-300 ease-out',
    `border-[${colors.border.primary}]`,
    glass('medium'),
    shadows.card,
    `hover:border-[${colors.border.hover}]`,
    'hover:' + shadows.cardHover
  ),
  
  // Interactive cards with micro-animations
  interactive: clsx(
    'rounded-3xl border transition-all duration-300 ease-out cursor-pointer',
    `border-[${colors.border.primary}]`,
    glass('medium'),
    shadows.card,
    `hover:border-[${colors.border.hover}]`,
    'hover:' + shadows.cardHover,
    'hover:scale-[1.02] active:scale-[0.98]'
  ),
  
  // Accent cards for important information
  accent: clsx(
    'rounded-3xl border transition-all duration-300 ease-out',
    `border-[${colors.border.accent}]`,
    glass('medium', true),
    shadows.glow,
    `hover:border-[${colors.border.focus}]`,
    'hover:' + shadows.glowStrong
  ),
  
  // Layout components
  header: `px-8 py-6 border-b border-[${colors.border.primary}]`,
  body: 'px-8 py-6',
  footer: `px-8 py-6 border-t border-[${colors.border.primary}]`,
};

// Tesla-inspired Button System
export const button = {
  // Primary Tesla-style electric button
  primary: clsx(
    'px-8 py-4 rounded-2xl font-semibold text-base',
    `bg-gradient-to-r from-[${colors.accent.primary}] to-[${colors.accent.secondary}]`,
    `text-[${colors.text.primary}]`,
    shadows.glow,
    `hover:${shadows.glowStrong}`,
    'transition-all duration-300 ease-out',
    'hover:scale-105 active:scale-95',
    'hover:brightness-110'
  ),
  
  // Secondary glass button
  secondary: clsx(
    'px-8 py-4 rounded-2xl font-semibold text-base',
    glass('strong'),
    `border border-[${colors.border.primary}]`,
    `text-[${colors.text.secondary}]`,
    `hover:border-[${colors.border.hover}]`,
    `hover:text-[${colors.text.primary}]`,
    'transition-all duration-300 ease-out',
    'hover:scale-105 active:scale-95',
  ),
  
  // Danger/Warning button
  danger: clsx(
    'px-8 py-4 rounded-2xl font-semibold text-base',
    `bg-gradient-to-r from-[${colors.status.danger}] to-[#c0392b]`,
    `text-[${colors.text.primary}]`,
    shadows.glowDanger,
    'hover:shadow-3xl hover:shadow-red-500/40',
    'transition-all duration-300 ease-out',
    'hover:scale-105 active:scale-95',
    'hover:brightness-110'
  ),
  
  // Success button
  success: clsx(
    'px-8 py-4 rounded-2xl font-semibold text-base',
    `bg-gradient-to-r from-[${colors.status.success}] to-[#00a085]`,
    `text-[${colors.text.primary}]`,
    shadows.glowSuccess,
    'hover:shadow-3xl hover:shadow-green-500/40',
    'transition-all duration-300 ease-out',
    'hover:scale-105 active:scale-95',
    'hover:brightness-110'
  ),
  
  // Ghost/minimal button
  ghost: clsx(
    'px-6 py-3 rounded-xl font-medium text-sm',
    `text-[${colors.text.tertiary}]`,
    `hover:text-[${colors.text.secondary}]`,
    `hover:bg-[${colors.glass.light}]`,
    'transition-all duration-300 ease-out',
    'hover:scale-105 active:scale-95'
  ),
  
  // Icon button
  icon: clsx(
    'p-3 rounded-xl',
    glass('medium'),
    `border border-[${colors.border.primary}]`,
    `text-[${colors.text.secondary}]`,
    `hover:border-[${colors.border.hover}]`,
    `hover:text-[${colors.text.primary}]`,
    'transition-all duration-300 ease-out',
    'hover:scale-110 active:scale-95'
  ),
};

// Tesla-inspired Typography System (Inter Font Family)
export const typography = {
  // Display headings with gradient effects
  display: clsx(
    'text-6xl font-bold leading-tight tracking-tight',
    `bg-gradient-to-r from-[${colors.text.primary}] via-[${colors.text.secondary}] to-[${colors.accent.primary}]`,
    'bg-clip-text text-transparent'
  ),
  
  h1: clsx(
    'text-4xl font-bold leading-tight tracking-tight',
    `text-[${colors.text.primary}]`
  ),
  
  h2: clsx(
    'text-3xl font-bold leading-tight',
    `text-[${colors.text.primary}]`
  ),
  
  h3: clsx(
    'text-2xl font-semibold leading-tight',
    `text-[${colors.text.primary}]`
  ),
  
  h4: clsx(
    'text-xl font-semibold leading-snug',
    `text-[${colors.text.secondary}]`
  ),
  
  // Body text variations
  body: clsx(
    'text-base leading-relaxed',
    `text-[${colors.text.secondary}]`
  ),
  
  bodyLarge: clsx(
    'text-lg leading-relaxed',
    `text-[${colors.text.secondary}]`
  ),
  
  caption: clsx(
    'text-sm leading-relaxed',
    `text-[${colors.text.tertiary}]`
  ),
  
  micro: clsx(
    'text-xs leading-relaxed uppercase tracking-wide font-medium',
    `text-[${colors.text.muted}]`
  ),
  
  // Monospace for data/numbers
  mono: clsx(
    'font-mono text-base tabular-nums',
    `text-[${colors.text.primary}]`
  ),
  
  monoLarge: clsx(
    'font-mono text-2xl font-bold tabular-nums',
    `text-[${colors.text.primary}]`
  ),
  
  // Special accent text
  accent: clsx(
    'font-semibold',
    `text-[${colors.accent.primary}]`
  ),
  
  // Status colors
  success: clsx(
    'font-semibold',
    `text-[${colors.status.success}]`
  ),
  
  danger: clsx(
    'font-semibold',
    `text-[${colors.status.danger}]`
  ),
};

// Enterprise Metrics Display System
export const metrics = {
  // Container with Tesla-inspired aesthetics
  container: clsx(card.base, 'p-8'),
  
  // Metric labels
  label: clsx(
    'text-xs font-medium uppercase tracking-wider mb-2',
    `text-[${colors.text.muted}]`
  ),
  
  // Large metric values
  value: clsx(
    'text-3xl font-bold tabular-nums mb-1',
    `text-[${colors.text.primary}]`
  ),
  
  // Extra large for hero metrics
  valueHero: clsx(
    'text-5xl font-bold tabular-nums mb-2',
    `text-[${colors.text.primary}]`
  ),
  
  // Change indicators with proper colors
  change: (positive) => clsx(
    'text-sm font-semibold flex items-center gap-1 tabular-nums',
    positive 
      ? `text-[${colors.status.success}]` 
      : `text-[${colors.status.danger}]`
  ),
  
  // Trend visualization area
  trend: 'h-20 mt-4 rounded-xl overflow-hidden',
  
  // Sparkline container
  sparkline: 'h-12 mt-3',
};

// Tesla-inspired Phase Styling System
export const phaseStyles = {
  BTC_HEAVY: {
    gradient: gradients.bitcoin,
    glow: shadows.glowBitcoin,
    color: `text-[${colors.crypto.bitcoin}]`,
    bg: `bg-[${colors.crypto.bitcoin}]/10`,
    border: `border-[${colors.crypto.bitcoin}]/30`,
    accent: `bg-[${colors.crypto.bitcoin}]/20`,
    icon: '₿',
    name: 'Bitcoin Accumulation',
    description: 'Optimal period for Bitcoin accumulation',
  },
  
  ETH_ROTATION: {
    gradient: gradients.ethereum,
    glow: shadows.glowEthereum,
    color: `text-[${colors.crypto.ethereum}]`,
    bg: `bg-[${colors.crypto.ethereum}]/10`,
    border: `border-[${colors.crypto.ethereum}]/30`,
    accent: `bg-[${colors.crypto.ethereum}]/20`,
    icon: '⟠',
    name: 'Ethereum Rotation',
    description: 'Transition phase favoring Ethereum',
  },
  
  ALT_SEASON: {
    gradient: gradients.altseason,
    glow: shadows.glowSuccess,
    color: `text-[${colors.status.success}]`,
    bg: `bg-[${colors.status.success}]/10`,
    border: `border-[${colors.status.success}]/30`,
    accent: `bg-[${colors.status.success}]/20`,
    icon: '🚀',
    name: 'Altcoin Season',
    description: 'High-growth phase for alternative cryptocurrencies',
  },
  
  CASH_HEAVY: {
    gradient: gradients.cash,
    glow: shadows.glowDanger,
    color: `text-[${colors.status.danger}]`,
    bg: `bg-[${colors.status.danger}]/10`,
    border: `border-[${colors.status.danger}]/30`,
    accent: `bg-[${colors.status.danger}]/20`,
    icon: '💰',
    name: 'Capital Preservation',
    description: 'Risk-off environment prioritizing capital preservation',
  },
};

// Tesla-inspired Animation System
export const animations = {
  // Smooth entrance animations
  fadeIn: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  slideIn: {
    initial: { opacity: 0, x: -32 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  // Tesla-style electric animations
  electric: {
    animate: { 
      boxShadow: [
        `0 0 20px ${colors.accent.primary}30`,
        `0 0 40px ${colors.accent.primary}50`,
        `0 0 20px ${colors.accent.primary}30`
      ],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },
  
  // Subtle micro-animations
  bounce: {
    animate: { 
      y: [0, -4, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    }
  },
  
  pulse: {
    animate: { 
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },
  
  // Data visualization animations
  countUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
  },
  
  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  },
};

// Tesla-inspired Layout System
export const layout = {
  // Container utilities
  container: 'max-w-8xl mx-auto px-8 lg:px-12',
  containerFluid: 'w-full px-8 lg:px-12',
  
  // Grid systems
  grid: 'grid grid-cols-1 lg:grid-cols-12 gap-8',
  gridTight: 'grid grid-cols-1 lg:grid-cols-12 gap-6',
  
  // Column spans
  sidebar: 'lg:col-span-3',
  sidebarWide: 'lg:col-span-4',
  main: 'lg:col-span-9',
  mainTight: 'lg:col-span-8',
  full: 'col-span-12',
  half: 'col-span-12 lg:col-span-6',
  third: 'col-span-12 lg:col-span-4',
  twoThirds: 'col-span-12 lg:col-span-8',
  
  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  // Spacing
  section: 'py-12 lg:py-16',
  sectionTight: 'py-8 lg:py-12',
};

// Enterprise Status Indicator System
export const status = {
  online: clsx(
    'flex items-center gap-2',
    `text-[${colors.status.success}]`
  ),
  
  offline: clsx(
    'flex items-center gap-2',
    `text-[${colors.status.danger}]`
  ),
  
  loading: clsx(
    'flex items-center gap-2',
    `text-[${colors.status.warning}]`
  ),
  
  neutral: clsx(
    'flex items-center gap-2',
    `text-[${colors.status.neutral}]`
  ),
  
  // Status dots with Tesla-inspired glow
  dot: (variant = 'success') => {
    const variants = {
      success: `w-2 h-2 rounded-full bg-[${colors.status.success}] shadow-sm shadow-green-500/50 animate-pulse`,
      danger: `w-2 h-2 rounded-full bg-[${colors.status.danger}] shadow-sm shadow-red-500/50 animate-pulse`,
      warning: `w-2 h-2 rounded-full bg-[${colors.status.warning}] shadow-sm shadow-yellow-500/50 animate-pulse`,
      neutral: `w-2 h-2 rounded-full bg-[${colors.status.neutral}] animate-pulse`,
    };
    return variants[variant];
  },
  
  // Larger status indicators
  indicator: (variant = 'success') => {
    const variants = {
      success: `w-4 h-4 rounded-full bg-[${colors.status.success}] shadow-lg shadow-green-500/30`,
      danger: `w-4 h-4 rounded-full bg-[${colors.status.danger}] shadow-lg shadow-red-500/30`,
      warning: `w-4 h-4 rounded-full bg-[${colors.status.warning}] shadow-lg shadow-yellow-500/30`,
      neutral: `w-4 h-4 rounded-full bg-[${colors.status.neutral}]`,
    };
    return variants[variant];
  },
};

// Utility function to combine classes
export const cn = (...classes) => clsx(classes);

export default {
  colors,
  gradients,
  glass,
  shadows,
  card,
  button,
  typography,
  metrics,
  phaseStyles,
  animations,
  layout,
  status,
  cn,
};