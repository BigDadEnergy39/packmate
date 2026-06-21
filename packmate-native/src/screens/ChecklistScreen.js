import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet,
} from 'react-native';
import EditTripModal from '../components/EditTripModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVITY_TEMPLATES, WEATHER_ADDITIONS, ACTIVITY_ADDONS, PERSON_TYPES, generateId } from '../data';
import { THEME } from '../theme';

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, onPress, color }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.checkbox, checked && { backgroundColor: color, borderColor: color }]} activeOpacity={0.7}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, onToggle, onDelete, color, fonts }) {
  return (
    <View style={[styles.itemRow, item.checked && styles.itemRowDone]}>
      <Checkbox checked={item.checked} onPress={onToggle} color={color} />
      <Text style={[
        styles.itemText,
        { fontFamily: fonts.crimsonPro },
        item.checked && styles.itemTextDone,
      ]} numberOfLines={3}>
        {item.text}
        {item.duration && !item.checked ? <Text style={styles.itemBadge}> 🌄</Text> : null}
        {item.weather  && !item.checked ? <Text style={styles.itemBadge}> ☁️</Text> : null}
        {item.custom   && !item.checked ? <Text style={styles.itemBadge}> ★</Text> : null}
      </Text>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.itemDelete}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, subtitle, items, color, fonts, onToggle, onDelete, addingActive, onStartAdd, onCancelAdd, onCommitAdd, addText, onAddTextChange, addPlaceholder }) {
  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  const pct     = total ? Math.round((checked / total) * 100) : 0;
  const done    = pct === 100 && total > 0;

  const unchecked = items.filter(i => !i.checked);
  const checkedItems = items.filter(i => i.checked);

  return (
    <View style={[styles.sectionCard, { borderLeftColor: color }]}>
      {/* Header */}
      <View style={[styles.sectionHeader, { backgroundColor: `${color}08` }]}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionIcon}>{icon}</Text>
          <View>
            <Text style={[styles.sectionTitle, { fontFamily: fonts.kalam }]}>{title}</Text>
            {subtitle ? <Text style={[styles.sectionSubtitle, { fontFamily: fonts.crimsonPro }]}>{subtitle}</Text> : null}
          </View>
        </View>
        <Text style={[styles.sectionCount, { fontFamily: fonts.dmSans, color: done ? '#2D7D32' : THEME.sepia }]}>
          {done ? '✓ packed' : `${checked} of ${total}`}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.sectionBody}>
        {unchecked.map(item => (
          <ItemRow key={item.id} item={item} color={color} fonts={fonts}
            onToggle={() => onToggle(item.id)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
        {checkedItems.length > 0 && (
          <View style={[styles.checkedDivider, unchecked.length === 0 && { borderTopWidth: 0 }]}>
            {checkedItems.map(item => (
              <ItemRow key={item.id} item={item} color={color} fonts={fonts}
                onToggle={() => onToggle(item.id)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </View>
        )}

        {/* Add custom item */}
        {addingActive ? (
          <View style={styles.addRow}>
            <TextInput
              value={addText}
              onChangeText={onAddTextChange}
              placeholder={addPlaceholder}
              placeholderTextColor="rgba(139,90,43,0.35)"
              autoFocus
              onSubmitEditing={onCommitAdd}
              maxLength={200}
              style={[styles.addInput, { fontFamily: fonts.dmSans }]}
            />
            <TouchableOpacity onPress={onCommitAdd} style={[styles.addBtn, { backgroundColor: color }]}>
              <Text style={[styles.addBtnText, { fontFamily: fonts.dmSans }]}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelAdd} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.addCancel}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={onStartAdd}>
            <Text style={[styles.addLink, { fontFamily: fonts.dmSans, color }]}>+ Add item</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ checked, total, color, fonts }) {
  const pct  = total > 0 ? Math.round((checked / total) * 100) : 0;
  const done = pct === 100 && total > 0;
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { fontFamily: fonts.kalam }]}>Expedition Progress</Text>
        <Text style={[styles.progressCount, { fontFamily: fonts.dmSans, color }]}>{checked}/{total} · {pct}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      {done && (
        <Text style={[styles.progressDone, { fontFamily: fonts.kalam, color }]}>
          🧭 All supplies accounted for — adventure awaits!
        </Text>
      )}
    </View>
  );
}

// ─── Checklist Screen ─────────────────────────────────────────────────────────

export default function ChecklistScreen({ checklist, setChecklist, fonts, customActivities = {}, customAddons = {}, customIcons = {}, templateOverrides = {}, onHome }) {
  const [addingToSection, setAddingToSection] = useState(null); // 'food' | 'group' | sectionIdx
  const [newItemText, setNewItemText]         = useState('');
  const [editModalOpen, setEditModalOpen]     = useState(false);

  const allActivities = { ...ACTIVITY_TEMPLATES, ...customActivities };
  const allAddons     = { ...ACTIVITY_ADDONS, ...customAddons };
  const personTypes   = PERSON_TYPES.map(pt => ({ ...pt, icon: customIcons[pt.value] || pt.icon }));
  const foodIcon      = customIcons.food  || '🍽️';
  const groupIcon     = customIcons.group || '⛺';

  const tmpl  = allActivities[checklist.activity] || ACTIVITY_TEMPLATES.other;
  const color = tmpl.color;

  // Overall progress
  const allItems = [
    ...(checklist.sections || []).flatMap(s => s.items),
    ...(checklist.groupItems || []),
    ...(checklist.foodItems  || []),
  ];
  const totalChecked = allItems.filter(i => i.checked).length;
  const totalItems   = allItems.length;

  // ── Mutators ────────────────────────────────────────────────────────────────

  // `setChecklist` (App.handleChecklistChange) expects a concrete checklist
  // object — NOT a React-style updater function — because it also diffs the
  // object against savedTrips to persist. Derive the next object from the
  // current `checklist` prop, which is always fresh after each re-render.
  const update = (fn) => setChecklist(fn({ ...checklist }));

  const toggleItem = (sIdx, itemId) => update(cl => {
    cl.sections = cl.sections.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, checked: !it.checked } : it) } : s
    );
    return cl;
  });

  const deleteItem = (sIdx, itemId) => update(cl => {
    cl.sections = cl.sections.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.filter(it => it.id !== itemId) } : s
    );
    return cl;
  });

  const addItem = (sIdx) => {
    if (!newItemText.trim()) return;
    update(cl => {
      cl.sections = cl.sections.map((s, i) =>
        i === sIdx ? { ...s, items: [...s.items, { id: generateId(), text: newItemText.trim(), checked: false, custom: true }] } : s
      );
      return cl;
    });
    setNewItemText('');
    setAddingToSection(null);
  };

  const toggleGroupItem = (itemId) => update(cl => {
    cl.groupItems = cl.groupItems.map(it => it.id === itemId ? { ...it, checked: !it.checked } : it);
    return cl;
  });

  const deleteGroupItem = (itemId) => update(cl => {
    cl.groupItems = cl.groupItems.filter(it => it.id !== itemId);
    return cl;
  });

  const addGroupItem = () => {
    if (!newItemText.trim()) return;
    update(cl => {
      cl.groupItems = [...(cl.groupItems || []), { id: generateId(), text: newItemText.trim(), checked: false, custom: true }];
      return cl;
    });
    setNewItemText('');
    setAddingToSection(null);
  };

  const toggleFoodItem = (itemId) => update(cl => {
    cl.foodItems = cl.foodItems.map(it => it.id === itemId ? { ...it, checked: !it.checked } : it);
    return cl;
  });

  const deleteFoodItem = (itemId) => update(cl => {
    cl.foodItems = cl.foodItems.filter(it => it.id !== itemId);
    return cl;
  });

  const addFoodItem = () => {
    if (!newItemText.trim()) return;
    update(cl => {
      cl.foodItems = [...(cl.foodItems || []), { id: generateId(), text: newItemText.trim(), checked: false, custom: true }];
      return cl;
    });
    setNewItemText('');
    setAddingToSection(null);
  };

  const cancelAdd = () => { setAddingToSection(null); setNewItemText(''); };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onHome} activeOpacity={0.7}>
          <Text style={[styles.backText, { fontFamily: fonts.crimsonPro }]}>← Base camp</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setEditModalOpen(true)} style={styles.editBtn} activeOpacity={0.7}>
            <Text style={[styles.editBtnText, { fontFamily: fonts.dmSans }]}>✎ Edit</Text>
          </TouchableOpacity>
          <View style={styles.loggedBadge}>
            <Text style={[styles.loggedText, { fontFamily: fonts.dmSans }]}>✓ Logged</Text>
          </View>
        </View>
      </View>

      <EditTripModal
        visible={editModalOpen}
        checklist={checklist}
        customAddons={customAddons}
        customIcons={customIcons}
        templateOverrides={templateOverrides}
        fonts={fonts}
        onClose={() => setEditModalOpen(false)}
        onApply={(changes) => {
          setChecklist({ ...checklist, ...changes });
          setEditModalOpen(false);
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>{tmpl.icon}</Text>
          <Text style={[styles.title, { fontFamily: fonts.playfairDisplay }]} numberOfLines={2}>{checklist.name}</Text>
        </View>
        <View style={styles.titleDivider} />

        {/* Progress */}
        <ProgressBar checked={totalChecked} total={totalItems} color={color} fonts={fonts} />

        {/* Info badges */}
        <View style={styles.badges}>
          <View style={styles.badge}><Text style={[styles.badgeText, { fontFamily: fonts.dmSans }]}>🌄 {checklist.nights} {checklist.nights === 1 ? 'night' : 'nights'}</Text></View>
          {(checklist.weather || []).map(w => (
            <View key={w} style={styles.badge}>
              <Text style={[styles.badgeText, { fontFamily: fonts.dmSans }]}>{WEATHER_ADDITIONS[w]?.icon} {WEATHER_ADDITIONS[w]?.label}</Text>
            </View>
          ))}
          {(checklist.addons || []).map(a => (
            <View key={a} style={styles.badge}>
              <Text style={[styles.badgeText, { fontFamily: fonts.dmSans }]}>{allAddons[a]?.icon} {allAddons[a]?.label}</Text>
            </View>
          ))}
        </View>

        {/* Food & Drinks */}
        {(checklist.foodItems || []).length > 0 && (
          <SectionCard
            title="Food & Drinks" icon={foodIcon} color={color} fonts={fonts}
            items={checklist.foodItems || []}
            onToggle={toggleFoodItem}
            onDelete={deleteFoodItem}
            addingActive={addingToSection === 'food'}
            onStartAdd={() => { setAddingToSection('food'); setNewItemText(''); }}
            onCancelAdd={cancelAdd}
            onCommitAdd={addFoodItem}
            addText={newItemText}
            onAddTextChange={setNewItemText}
            addPlaceholder="Add food or drink..."
          />
        )}

        {/* Shared Gear */}
        {(checklist.groupItems || []).length > 0 && (
          <SectionCard
            title="Shared Gear" icon={groupIcon} subtitle="for the group" color={color} fonts={fonts}
            items={checklist.groupItems || []}
            onToggle={toggleGroupItem}
            onDelete={deleteGroupItem}
            addingActive={addingToSection === 'group'}
            onStartAdd={() => { setAddingToSection('group'); setNewItemText(''); }}
            onCancelAdd={cancelAdd}
            onCommitAdd={addGroupItem}
            addText={newItemText}
            onAddTextChange={setNewItemText}
            addPlaceholder="Add group item..."
          />
        )}

        {/* Per-person sections */}
        {(checklist.sections || []).map((section, sIdx) => {
          const pt = personTypes.find(p => p.value === section.person.type) || personTypes[0];
          return (
            <SectionCard
              key={section.person.id}
              title={section.person.name} icon={pt.icon} color={color} fonts={fonts}
              items={section.items}
              onToggle={(id) => toggleItem(sIdx, id)}
              onDelete={(id) => deleteItem(sIdx, id)}
              addingActive={addingToSection === sIdx}
              onStartAdd={() => { setAddingToSection(sIdx); setNewItemText(''); }}
              onCancelAdd={cancelAdd}
              onCommitAdd={() => addItem(sIdx)}
              addText={newItemText}
              onAddTextChange={setNewItemText}
              addPlaceholder="Add item..."
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: THEME.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backText:    { fontSize: 15, color: THEME.sepia, fontStyle: 'italic' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(139,90,43,0.08)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(139,90,43,0.15)',
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: THEME.darkBrown },
  loggedBadge: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(45,125,50,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(45,125,50,0.2)',
  },
  loggedText: { fontSize: 12, fontWeight: '600', color: '#2D7D32' },

  // Title
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  titleIcon:   { fontSize: 34 },
  title:       { flex: 1, fontSize: 32, color: THEME.darkBrown },
  titleDivider: { width: 50, height: 2, backgroundColor: 'rgba(139,90,43,0.35)', marginBottom: 16 },

  // Progress
  progressCard:   { backgroundColor: THEME.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel:  { fontSize: 18, fontWeight: '600', color: THEME.brown },
  progressCount:  { fontSize: 13, fontWeight: '700' },
  progressTrack:  { height: 8, borderRadius: 4, backgroundColor: 'rgba(139,90,43,0.1)', overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 4 },
  progressDone:   { textAlign: 'center', marginTop: 10, fontSize: 15, fontWeight: '600' },

  // Badges
  badges:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge:     { backgroundColor: 'rgba(253,243,220,0.7)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12 },
  badgeText: { fontSize: 12, fontWeight: '500', color: THEME.brown },

  // Section card
  sectionCard: {
    backgroundColor: THEME.card, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(139,90,43,0.1)',
    borderLeftWidth: 3, marginBottom: 20, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.08)',
    borderStyle: 'dashed',
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon:       { fontSize: 20 },
  sectionTitle:      { fontSize: 20, color: THEME.darkBrown },
  sectionSubtitle:   { fontSize: 12, color: THEME.sepia, fontStyle: 'italic' },
  sectionCount:      { fontSize: 12, fontWeight: '500' },
  sectionBody:       { paddingHorizontal: 12, paddingVertical: 4 },

  // Item row
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 4,
  },
  itemRowDone: { opacity: 0.45 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: 'rgba(139,90,43,0.25)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkmark:       { color: 'white', fontSize: 12, fontWeight: '700' },
  itemText:        { flex: 1, fontSize: 15, color: THEME.darkBrown },
  itemTextDone:    { textDecorationLine: 'line-through' },
  itemBadge:       { fontSize: 10 },
  itemDelete:      { fontSize: 18, color: THEME.accentMuted, opacity: 0.6, paddingHorizontal: 2 },

  // Checked divider
  checkedDivider: { borderTopWidth: 1, borderTopColor: 'rgba(139,90,43,0.08)', borderStyle: 'dashed', marginTop: 4, paddingTop: 4 },

  // Add row
  addRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  addInput:   { flex: 1, fontSize: 14, color: THEME.darkBrown, borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'white' },
  addBtn:     { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  addBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  addCancel:  { fontSize: 20, color: THEME.sepia, paddingHorizontal: 4 },
  addLink:    { fontSize: 13, fontWeight: '500', paddingVertical: 10, paddingHorizontal: 4 },
});
