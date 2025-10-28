// src/components/KeyValueList.tsx
import React from 'react';
import { View, Text } from 'react-native';

type Item = { label: string; value: any };
export default function KeyValueList({ items }: { items: Item[] }) {
  return (
    <View style={{ gap: 4 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ color: '#6B7280' }}>{it.label}:</Text>
          <Text style={{ color: '#111827', fontWeight: '600' }}>
            {it.value ?? '—'}
          </Text>
        </View>
      ))}
    </View>
  );
}
