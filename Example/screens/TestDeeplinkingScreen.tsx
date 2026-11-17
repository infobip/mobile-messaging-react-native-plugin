//
//  TestDeeplinkingScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import EmptyState from '../components/EmptyState';

const TestDeeplinkingScreen: React.FC = () => (
  <EmptyState
    title="Opened by a deeplink"
    description="Deeplink com.infobip.mobilemessaging://deeplink/TestDeeplinkingScreen opens this screen. Each path segment opens one more screen."
  />
);

export default TestDeeplinkingScreen;
