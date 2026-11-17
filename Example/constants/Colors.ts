//
//  Colors.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

// Semantic colors of Infobip's BEPO design system, default "Sunrise" theme.
// Orange is the brand accent; primary actions use the interactive blue.
const Colors = {
  accent: '#fc6423', // sunrise-500
  accentSubdued: '#fff5eb', // sunrise-50
  primary: '#2d7595', // adriatic-400
  primaryPressed: '#074058', // adriatic-800
  background: '#f4f4f2', // stone-100
  surface: '#ffffff',
  surfaceMuted: '#ededeb', // stone-200
  border: '#d9d8d7', // stone-400
  textPrimary: '#1b1b1a', // stone-1000
  textSecondary: '#545452', // stone-800
  textTertiary: '#676665', // stone-700
  textDisabled: '#a6a5a2', // stone-600
  textInverse: '#ffffff',
  danger: '#cf182e', // pomidor-500
  dangerPressed: '#871321', // pomidor-700
  dangerText: '#ab1628', // pomidor-600
  dangerSubdued: '#fff0f1', // pomidor-50
  successText: '#247058', // grass-700
  successSubdued: '#ebf5f1', // grassNT-50
  infoSubdued: '#e8efff', // sky-50
  infoText: '#1b3096', // sky-500
} as const;

export default Colors;
