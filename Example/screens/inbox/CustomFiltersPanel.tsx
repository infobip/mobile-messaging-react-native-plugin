//
//  CustomFiltersPanel.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import TextField from '../../components/TextField';
import Colors from '../../constants/Colors';
import {
  buildCustomFilters,
  datePresets,
  describeFilters,
  emptyCustomFilterForm,
  validateCustomFilterForm,
} from './inboxFilters';
import type {CustomFilterForm} from './inboxFilters';

type FilterOptions = MobileMessagingReactNative.MMInboxFilterOptions;

interface CustomFiltersPanelProps {
  /** The draft lives in the screen, so it survives switching tabs. */
  form: CustomFilterForm;
  onFormChange: (form: CustomFilterForm) => void;
  appliedFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

/** Edits a draft of the filters; the inbox reloads only when they are applied. */
const CustomFiltersPanel: React.FC<CustomFiltersPanelProps> = ({
  form,
  onFormChange,
  appliedFilters,
  onApply,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [validationError, setValidationError] = useState<string>();
  const update = (change: Partial<CustomFilterForm>) => {
    setValidationError(undefined);
    onFormChange({...form, ...change});
  };

  const apply = (nextForm: CustomFilterForm) => {
    const error = validateCustomFilterForm(nextForm);
    setValidationError(error);
    if (error) {
      return;
    }
    onApply(buildCustomFilters(nextForm, new Date()));
    setExpanded(false);
  };

  const reset = () => {
    onFormChange(emptyCustomFilterForm);
    apply(emptyCustomFilterForm);
  };

  if (!expanded) {
    return (
      <View style={styles.summary}>
        <Text style={styles.summaryText} numberOfLines={2}>
          {describeFilters(appliedFilters)}
        </Text>
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          hitSlop={8}>
          <Text style={styles.link}>Edit filters</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Card>
      <TextField
        label="Topics"
        hint="Case-sensitive, comma-separated. One topic is filtered on the server and paginated. Several are filtered on the device from the newest messages, without pagination."
        placeholder="Any topic"
        value={form.topics}
        onChangeText={topics => update({topics})}
        autoCapitalize="none"
      />
      <View style={styles.group}>
        <Text style={styles.label}>Sent</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {datePresets.map(preset => (
            <Chip
              key={preset.key}
              label={preset.label}
              selected={form.datePreset === preset.key}
              onPress={() => update({datePreset: preset.key})}
            />
          ))}
        </View>
      </View>
      {form.datePreset === 'exact' ? (
        <>
          <TextField
            label="From (inclusive)"
            placeholder="2026-11-01T00:00:00+00:00"
            value={form.fromDateTime}
            onChangeText={fromDateTime => update({fromDateTime})}
            autoCapitalize="none"
          />
          <TextField
            label="To (exclusive)"
            placeholder="2026-11-30T00:00:00+00:00"
            value={form.toDateTime}
            onChangeText={toDateTime => update({toDateTime})}
            autoCapitalize="none"
          />
        </>
      ) : null}
      <TextField
        label="Page size"
        hint="Empty uses the server default."
        placeholder="Default"
        value={form.pageSize}
        onChangeText={pageSize => update({pageSize})}
        keyboardType="number-pad"
      />
      {validationError ? (
        <Text style={styles.error}>{validationError}</Text>
      ) : null}
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button variant="secondary" title="Reset" onPress={reset} />
        </View>
        <View style={styles.button}>
          <Button title="Apply" onPress={() => apply(form)} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  group: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  error: {
    fontSize: 13,
    color: Colors.dangerText,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default CustomFiltersPanel;
