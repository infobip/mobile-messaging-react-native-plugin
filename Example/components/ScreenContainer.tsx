//
//  ScreenContainer.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

/** Scrollable screen body with consistent spacing between cards. */
const ScreenContainer: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {bottom} = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, {paddingBottom: 16 + bottom}]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});

export default ScreenContainer;
