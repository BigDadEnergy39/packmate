import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVITY_TEMPLATES, DURATION_ITEMS, PERSON_TYPES } from '../data';
import { THEME } from '../theme';

const PERSON_TABS = [
  { key: 'adult', label: 'Adult',  icon: '🧭' },
  { key: 'child', label: 'Child',  icon: '⭐' },
  { key: 'baby',  label: 'Baby',   icon: '🍼' },
  { key: 'pet',   label: 'Pet',    icon: '🐾' },
  { key: 'group', label: 'Group',  icon: '⛺' },
];

// ─── Item Editor ──────────────────────────────────────────────────────────────

function ItemEditor({ items, onAdd, onRemove, activeTab, fonts }) {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    if (!newItem.trim()) return;
    onAdd(newItem.trim());
    setNewItem('');
  };

  return (
    <View style={styles.itemEditor}>
      {items.length === 0 && (
        <Text style={[styles.emptyItems, { fontFamily: fonts.dmSans }]}>
          No items for {PERSON_TABS.find(t => t.key === activeTab)?.label} yet
        </Text>
      )}
      {items.map((item, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Text style={[styles.itemText, { fontFamily: fonts.dmSans }]}>{item}</Text>
          <TouchableOpacity onPress={() => onRemove(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.itemRemove}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={add}
          placeholder="Add item..."
          placeholderTextColor="rgba(139,90,43,0.35)"
          style={[styles.addInput, { fontFamily: fonts.dmSans }]}
          maxLength={200}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={add} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={[styles.addBtnText, { fontFamily: fonts.dmSans }]}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Template Editor Screen ───────────────────────────────────────────────────

export default function TemplateEditorScreen({
  fonts,
  templateOverrides,
  customActivities,
  hiddenActivities,
  onSaveOverride,
  onToggleVisibility,
  onBack,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('adult');

  const allActivities = useMemo(
    () => ({ ...ACTIVITY_TEMPLATES, ...customActivities }),
    [customActivities]
  );

  // Categories: activities + duration tiers
  const activityCategories = Object.entries(allActivities).map(([key, tmpl]) => ({
    key, type: 'activity', label: tmpl.label, icon: tmpl.icon, color: tmpl.color,
    isCustom: !!customActivities[key],
  }));
  const durationCategories = DURATION_ITEMS.map((d, i) => ({
    key: `duration_${d.minNights}`, type: 'duration',
    label: d.label, icon: ['🌙','🗓️','📦','🌍'][i] || '📦',
    minNights: d.minNights,
  }));

  // Get current effective items for a category+tab
  const getEffectiveItems = (catKey, tabKey) => {
    const override = templateOverrides[catKey];
    if (catKey.startsWith('duration_')) {
      const nights = parseInt(catKey.replace('duration_', ''));
      const base = DURATION_ITEMS.find(d => d.minNights === nights);
      if (tabKey === 'group') return override?.items?.group ?? base?.items?.group ?? [];
      return override?.items?.[tabKey] ?? base?.items?.[tabKey] ?? [];
    } else {
      const base = allActivities[catKey];
      if (tabKey === 'group') return override?.groupItems ?? base?.groupItems ?? [];
      return override?.items?.[tabKey] ?? base?.items?.[tabKey] ?? [];
    }
  };

  const handleAdd = (catKey, tabKey, text) => {
    const current = getEffectiveItems(catKey, tabKey);
    const updated  = [...current, text];
    saveTab(catKey, tabKey, updated);
  };

  const handleRemove = (catKey, tabKey, idx) => {
    const current = getEffectiveItems(catKey, tabKey);
    const updated  = current.filter((_, i) => i !== idx);
    saveTab(catKey, tabKey, updated);
  };

  const saveTab = (catKey, tabKey, newItems) => {
    const prev = templateOverrides[catKey] || {};
    let updated;
    if (catKey.startsWith('duration_')) {
      updated = { ...prev, items: { ...(prev.items || {}), [tabKey]: newItems } };
    } else {
      if (tabKey === 'group') {
        updated = { ...prev, groupItems: newItems };
      } else {
        updated = { ...prev, items: { ...(prev.items || {}), [tabKey]: newItems } };
      }
    }
    onSaveOverride(catKey, updated);
  };

  const hasOverride = (catKey) => !!templateOverrides[catKey];
  const isHidden    = (catKey) => hiddenActivities.includes(catKey);

  // ── Category list view ────────────────────────────────────────────────────

  if (!selectedCategory) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <Text style={[styles.backText, { fontFamily: fonts.crimsonPro }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageTitle, { fontFamily: fonts.playfairDisplay }]}>Customize Lists</Text>
          <View style={styles.titleDivider} />
          <Text style={[styles.pageSubtitle, { fontFamily: fonts.dmSans }]}>
            Tap an activity or tier to edit its default items.
          </Text>

          <Text style={[styles.groupLabel, { fontFamily: fonts.dmSans }]}>ACTIVITIES</Text>
          {activityCategories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => { setSelectedCategory(cat); setActiveTab('adult'); }}
              style={[styles.catRow, isHidden(cat.key) && { opacity: 0.5 }]}
              activeOpacity={0.75}
            >
              <TouchableOpacity
                onPress={() => onToggleVisibility(cat.key)}
                style={[styles.visibilityDot, { borderColor: cat.color, backgroundColor: isHidden(cat.key) ? 'transparent' : cat.color }]}
              >
                {!isHidden(cat.key) && <Text style={styles.visibilityCheck}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, { fontFamily: fonts.dmSans, textDecorationLine: isHidden(cat.key) ? 'line-through' : 'none' }]}>
                {cat.label}
              </Text>
              {cat.isCustom    && <View style={styles.badge}><Text style={[styles.badgeText, { color: '#1B7A8A' }]}>Custom</Text></View>}
              {hasOverride(cat.key) && <View style={styles.badge}><Text style={[styles.badgeText, { color: '#2D5016' }]}>Edited</Text></View>}
              <Text style={styles.catArrow}>→</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.groupLabel, { fontFamily: fonts.dmSans, marginTop: 20 }]}>OVERNIGHT TIERS</Text>
          {durationCategories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => { setSelectedCategory(cat); setActiveTab('adult'); }}
              style={styles.catRow}
              activeOpacity={0.75}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.catLabel, { fontFamily: fonts.dmSans }]}>{cat.label}</Text>
                <Text style={[styles.catSub, { fontFamily: fonts.dmSans }]}>{cat.minNights}+ nights</Text>
              </View>
              {hasOverride(cat.key) && <View style={styles.badge}><Text style={[styles.badgeText, { color: '#2D5016' }]}>Edited</Text></View>}
              <Text style={styles.catArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Item editor view ──────────────────────────────────────────────────────

  const cat      = selectedCategory;
  const tabItems = getEffectiveItems(cat.key, activeTab);
  const tabs     = cat.type === 'activity' ? PERSON_TABS : PERSON_TABS; // both show all tabs

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedCategory(null)} activeOpacity={0.7}>
          <Text style={[styles.backText, { fontFamily: fonts.crimsonPro }]}>← All categories</Text>
        </TouchableOpacity>
        {hasOverride(cat.key) && (
          <TouchableOpacity onPress={() => onSaveOverride(cat.key, null)} style={styles.resetBtn}>
            <Text style={[styles.resetBtnText, { fontFamily: fonts.dmSans }]}>Reset to default</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.editorHeader}>
        <Text style={styles.editorIcon}>{cat.icon}</Text>
        <Text style={[styles.editorTitle, { fontFamily: fonts.playfairDisplay }]}>{cat.label}</Text>
      </View>

      {/* Person type tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {tabs.map(tab => {
          const count = getEffectiveItems(cat.key, tab.key).length;
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.75}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, { fontFamily: fonts.dmSans, color: active ? THEME.darkBrown : THEME.sepia }]}>
                {tab.label}
              </Text>
              <Text style={[styles.tabCount, { fontFamily: fonts.dmSans }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <ItemEditor
          items={tabItems}
          activeTab={activeTab}
          fonts={fonts}
          onAdd={(text) => handleAdd(cat.key, activeTab, text)}
          onRemove={(idx) => handleRemove(cat.key, activeTab, idx)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: THEME.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backText:{ fontSize: 15, color: THEME.sepia, fontStyle: 'italic' },
  resetBtn:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(196,98,14,0.3)' },
  resetBtnText: { fontSize: 11, fontWeight: '600', color: '#C4620E' },

  listContent: { paddingHorizontal: 16, paddingBottom: 48 },
  pageTitle:   { fontSize: 34, color: THEME.darkBrown, marginTop: 8 },
  titleDivider:{ width: 50, height: 2, backgroundColor: 'rgba(139,90,43,0.3)', marginVertical: 8 },
  pageSubtitle:{ fontSize: 13, color: THEME.sepia, marginBottom: 20 },
  groupLabel:  { fontSize: 11, letterSpacing: 2, color: THEME.sepia, fontWeight: '600', marginBottom: 10 },

  catRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: THEME.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8, borderWidth: 1, borderColor: THEME.border,
  },
  visibilityDot: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  visibilityCheck: { color: 'white', fontSize: 10, fontWeight: '700' },
  catIcon:  { fontSize: 20 },
  catLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: THEME.darkBrown },
  catSub:   { fontSize: 11, color: THEME.sepia, marginTop: 1 },
  catArrow: { fontSize: 14, color: THEME.sepia },
  badge:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(45,80,22,0.08)' },
  badgeText:{ fontSize: 10, fontWeight: '600' },

  editorHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  editorIcon:   { fontSize: 28 },
  editorTitle:  { fontSize: 26, color: THEME.darkBrown },

  tabs: { borderBottomWidth: 1, borderBottomColor: THEME.border, marginBottom: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 10, paddingHorizontal: 12, marginRight: 4,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive:  { borderBottomColor: THEME.darkBrown },
  tabIcon:    { fontSize: 14 },
  tabLabel:   { fontSize: 13, fontWeight: '600' },
  tabCount:   { fontSize: 11, color: THEME.accentMuted, fontWeight: '600' },

  itemEditor: { backgroundColor: 'rgba(253,243,220,0.6)', borderRadius: 12, padding: 12 },
  emptyItems: { fontSize: 13, color: THEME.accentMuted, textAlign: 'center', paddingVertical: 16 },
  itemRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.06)' },
  itemText:   { flex: 1, fontSize: 14, color: THEME.darkBrown },
  itemRemove: { fontSize: 20, color: '#C4620E', paddingHorizontal: 4, opacity: 0.7 },
  addRow:     { flexDirection: 'row', gap: 8, marginTop: 10 },
  addInput:   { flex: 1, fontSize: 14, color: THEME.darkBrown, borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'white' },
  addBtn:     { backgroundColor: THEME.darkBrown, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#EDD5A8' },
});
