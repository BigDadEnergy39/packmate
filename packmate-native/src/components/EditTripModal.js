import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal,
} from 'react-native';
import {
  ACTIVITY_TEMPLATES, WEATHER_ADDITIONS, ACTIVITY_ADDONS,
  PERSON_TYPES, FOOD_ITEMS,
  generateId, applyDurationPlaceholders, filterFoodItems,
  getEffectiveActivityTemplate, getEffectiveDurationItems,
} from '../data';
import { THEME } from '../theme';

const BABY_KW = /baby|formula|sippy|onesie|infant|toddler/i;
const PET_KW  = /\bpet\b|dog food|cat food/i;

const makeDurationItems = (durationItems, personType, nights) =>
  durationItems
    .filter(d => nights >= d.minNights)
    .flatMap(d =>
      (d.items[personType] || []).map(raw => ({
        id: generateId(),
        text: applyDurationPlaceholders(raw, nights),
        checked: false, duration: true,
      }))
    );

export default function EditTripModal({ visible, checklist, customAddons = {}, customIcons = {}, templateOverrides = {}, fonts, onApply, onClose }) {
  const allAddons   = { ...ACTIVITY_ADDONS, ...customAddons };
  const personTypes = PERSON_TYPES.map(pt => ({ ...pt, icon: customIcons[pt.value] || pt.icon }));
  const template    = getEffectiveActivityTemplate(
    ACTIVITY_TEMPLATES[checklist?.activity] || ACTIVITY_TEMPLATES.other,
    templateOverrides[checklist?.activity],
  );
  const effectiveDuration = getEffectiveDurationItems(templateOverrides);

  const [editPeople,    setEditPeople]    = useState([]);
  const [editAddons,    setEditAddons]    = useState([]);
  const [editNights,    setEditNights]    = useState(1);
  const [editingNameId, setEditingNameId] = useState(null);
  const [addonPickerOpen, setAddonPickerOpen] = useState(false);

  const DEFAULT_NAME = /^(Adult|Child|Baby|Pet) \d+$/;

  // Initialise state when modal opens
  const onShow = () => {
    if (!checklist) return;
    setEditPeople(checklist.sections.map(s => ({ ...s.person })));
    setEditAddons([...(checklist.addons || [])]);
    setEditNights(checklist.nights || 1);
    setEditingNameId(null);
  };

  const addPerson = (type) => {
    const typeInfo = personTypes.find(p => p.value === type);
    const count = editPeople.filter(p => p.type === type).length;
    setEditPeople(prev => [...prev, { id: generateId(), type, name: `${typeInfo.label} ${count + 1}` }]);
  };

  const removePerson = (id) => setEditPeople(prev => prev.filter(p => p.id !== id));

  const renamePerson = (id, name) =>
    setEditPeople(prev => prev.map(p => p.id === id ? { ...p, name } : p));

  const toggleAddon = (key) =>
    setEditAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  // ── Change summary ─────────────────────────────────────────────────────────
  const prevPersonIds   = new Set((checklist?.sections || []).map(s => s.person.id));
  const nextPersonIds   = new Set(editPeople.map(p => p.id));
  const addedPeople     = editPeople.filter(p => !prevPersonIds.has(p.id));
  const removedPeople   = (checklist?.sections || []).filter(s => !nextPersonIds.has(s.person.id));
  const prevAddonSet    = new Set(checklist?.addons || []);
  const nextAddonSet    = new Set(editAddons);
  const addedAddons     = editAddons.filter(a => !prevAddonSet.has(a));
  const removedAddons   = (checklist?.addons || []).filter(a => !nextAddonSet.has(a));
  const nightsChanged   = editNights !== (checklist?.nights || 1);
  const nameChanges     = editPeople.filter(ep => {
    const orig = checklist?.sections.find(s => s.person.id === ep.id);
    return orig && orig.person.name !== ep.name;
  });
  const hasChanges = addedPeople.length > 0 || removedPeople.length > 0 ||
    addedAddons.length > 0 || removedAddons.length > 0 ||
    nightsChanged || nameChanges.length > 0;

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = () => {
    if (!checklist) return;

    // Sections
    const updatedSections = editPeople.map(person => {
      const existing = checklist.sections.find(s => s.person.id === person.id);
      if (existing) {
        let items = existing.items.filter(i => !i.addon || !removedAddons.includes(i.addon));
        if (nightsChanged) {
          items = [...items.filter(i => !i.duration), ...makeDurationItems(effectiveDuration, person.type, editNights)];
        }
        const newAddonItems = addedAddons.flatMap(a =>
          (allAddons[a]?.items[person.type] || []).map(text => ({
            id: generateId(), text, checked: false, addon: a,
          }))
        );
        return { person: { ...person }, items: [...items, ...newAddonItems] };
      } else {
        const baseItems = (template.items[person.type] || []).map(text => ({ id: generateId(), text, checked: false }));
        const weatherItems = (checklist.weather || []).flatMap(w =>
          WEATHER_ADDITIONS[w].items.map(text => ({ id: generateId(), text, checked: false, weather: true }))
        );
        const durationItems = makeDurationItems(effectiveDuration, person.type, editNights);
        const addonItems = editAddons.flatMap(a =>
          (allAddons[a]?.items[person.type] || []).map(text => ({ id: generateId(), text, checked: false, addon: a }))
        );
        return { person: { ...person }, items: [...baseItems, ...durationItems, ...addonItems, ...weatherItems] };
      }
    });

    // Group items
    let updatedGroupItems = (checklist.groupItems || []).filter(i => !i.addon || !removedAddons.includes(i.addon));
    if (nightsChanged) {
      updatedGroupItems = [
        ...updatedGroupItems.filter(i => !i.duration),
        ...effectiveDuration.filter(d => editNights >= d.minNights).flatMap(d =>
          (d.items.group || []).map(text => ({ id: generateId(), text, checked: false, duration: true }))
        ),
      ];
    }
    updatedGroupItems = [
      ...updatedGroupItems,
      ...addedAddons.flatMap(a =>
        (allAddons[a]?.items?.group || []).map(text => ({ id: generateId(), text, checked: false, addon: a }))
      ),
    ];
    const hadMultiple = checklist.sections.length >= 2;
    const hasMultiple = editPeople.length >= 2;
    if (!hadMultiple && hasMultiple) {
      updatedGroupItems = [...(template.groupItems || []).map(text => ({ id: generateId(), text, checked: false })), ...updatedGroupItems];
    }
    if (hadMultiple && !hasMultiple) {
      updatedGroupItems = updatedGroupItems.filter(i => i.addon);
    }

    // Food items
    const hadBaby = checklist.sections.some(s => s.person.type === 'baby');
    const hasBaby = editPeople.some(p => p.type === 'baby');
    const hadPet  = checklist.sections.some(s => s.person.type === 'pet');
    const hasPet  = editPeople.some(p => p.type === 'pet');
    const foodSource = FOOD_ITEMS[checklist.activity] || FOOD_ITEMS._default;
    let updatedFoodItems = [...(checklist.foodItems || [])];
    if (hadBaby && !hasBaby) updatedFoodItems = updatedFoodItems.filter(i => !BABY_KW.test(i.text));
    if (hadPet  && !hasPet)  updatedFoodItems = updatedFoodItems.filter(i => !PET_KW.test(i.text));
    if (!hadBaby && hasBaby) updatedFoodItems = [...updatedFoodItems, ...foodSource.filter(t => BABY_KW.test(t)).map(text => ({ id: generateId(), text, checked: false, activity: checklist.activity }))];
    if (!hadPet  && hasPet)  updatedFoodItems = [...updatedFoodItems, ...foodSource.filter(t => PET_KW.test(t)).map(text => ({ id: generateId(), text, checked: false, activity: checklist.activity }))];

    onApply({ nights: editNights, addons: editAddons, sections: updatedSections, groupItems: updatedGroupItems, foodItems: updatedFoodItems });
  };

  if (!checklist) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onShow={onShow} onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: fonts.playfairDisplay }]}>Edit Trip</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Nights */}
          <Text style={[styles.sectionLabel, { fontFamily: fonts.dmSans }]}>DURATION</Text>
          <View style={styles.nightsRow}>
            <TouchableOpacity onPress={() => setEditNights(n => Math.max(0, n - 1))} style={styles.nightsBtn}>
              <Text style={[styles.nightsBtnText, { fontFamily: fonts.dmSans }]}>−</Text>
            </TouchableOpacity>
            <View style={styles.nightsDisplay}>
              <Text style={[styles.nightsNum, { fontFamily: fonts.kalam }]}>{editNights}</Text>
              <Text style={[styles.nightsWord, { fontFamily: fonts.crimsonPro }]}>{editNights === 1 ? 'night' : 'nights'}</Text>
            </View>
            <TouchableOpacity onPress={() => setEditNights(n => n + 1)} style={styles.nightsBtn}>
              <Text style={[styles.nightsBtnText, { fontFamily: fonts.dmSans }]}>+</Text>
            </TouchableOpacity>
            {nightsChanged && <Text style={[styles.changedBadge, { fontFamily: fonts.dmSans }]}>changed</Text>}
          </View>

          {/* Add people */}
          <Text style={[styles.sectionLabel, { fontFamily: fonts.dmSans }]}>PEOPLE</Text>
          <View style={styles.pillRow}>
            {personTypes.map(pt => {
              const disabled = !template.items[pt.value] || template.items[pt.value].length === 0;
              return (
                <TouchableOpacity
                  key={pt.value}
                  onPress={() => !disabled && addPerson(pt.value)}
                  style={[styles.pill, disabled && styles.pillDisabled]}
                  activeOpacity={disabled ? 1 : 0.75}
                >
                  <Text style={styles.pillEmoji}>{pt.icon}</Text>
                  <Text style={[styles.pillText, { fontFamily: fonts.dmSans }]}>+ {pt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {editPeople.map(person => {
            const pt = personTypes.find(p => p.value === person.type);
            const isNew = !prevPersonIds.has(person.id);
            const isEditing = editingNameId === person.id;
            return (
              <View key={person.id} style={styles.personRow}>
                <Text style={styles.personIcon}>{pt?.icon}</Text>
                {isEditing ? (
                  <TextInput
                    value={person.name}
                    onChangeText={name => renamePerson(person.id, name)}
                    onFocus={() => { if (DEFAULT_NAME.test(person.name)) renamePerson(person.id, ''); }}
                    onBlur={() => setEditingNameId(null)}
                    onSubmitEditing={() => setEditingNameId(null)}
                    autoFocus
                    maxLength={50}
                    style={[styles.nameInput, { fontFamily: fonts.dmSans }]}
                  />
                ) : (
                  <TouchableOpacity onPress={() => setEditingNameId(person.id)} style={{ flex: 1 }}>
                    <Text style={[styles.personName, { fontFamily: fonts.dmSans }]}>
                      {person.name} <Text style={styles.editHint}>✎</Text>
                      {isNew && <Text style={styles.newBadge}> NEW</Text>}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => removePerson(person.id)} disabled={editPeople.length <= 1} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.removeBtn, editPeople.length <= 1 && { opacity: 0.2 }]}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Add-ons */}
          <View style={styles.addonHeader}>
            <Text style={[styles.sectionLabel, { fontFamily: fonts.dmSans, marginTop: 0, marginBottom: 0 }]}>ADD-ONS</Text>
            <TouchableOpacity onPress={() => setAddonPickerOpen(true)} style={styles.addAddonBtn} activeOpacity={0.75}>
              <Text style={[styles.addAddonBtnText, { fontFamily: fonts.dmSans }]}>+ Select</Text>
            </TouchableOpacity>
          </View>

          {editAddons.length === 0 ? (
            <Text style={[styles.addonsEmpty, { fontFamily: fonts.dmSans }]}>No add-ons selected</Text>
          ) : (
            <View style={styles.selectedAddons}>
              {editAddons.map(key => {
                const addon = allAddons[key];
                if (!addon) return null;
                return (
                  <View key={key} style={styles.selectedAddon}>
                    <Text style={styles.selectedAddonIcon}>{addon.icon}</Text>
                    <Text style={[styles.selectedAddonLabel, { fontFamily: fonts.dmSans }]}>{addon.label}</Text>
                    <TouchableOpacity onPress={() => toggleAddon(key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.removeAddon}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Add-on picker modal */}
          <Modal visible={addonPickerOpen} animationType="slide" transparent onRequestClose={() => setAddonPickerOpen(false)}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setAddonPickerOpen(false)} />
            <View style={styles.pickerSheet}>
              <View style={styles.handle} />
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { fontFamily: fonts.playfairDisplay }]}>Select Add-ons</Text>
                <TouchableOpacity onPress={() => setAddonPickerOpen(false)}>
                  <Text style={styles.closeBtn}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(allAddons).map(([key, addon]) => {
                  const active = editAddons.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleAddon(key)}
                      style={[styles.pickerRow, active && styles.pickerRowActive]}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.pickerRowIcon}>{addon.icon}</Text>
                      <Text style={[styles.pickerRowLabel, { fontFamily: fonts.dmSans }]}>{addon.label}</Text>
                      {active && <Text style={styles.pickerCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 32 }} />
              </ScrollView>
            </View>
          </Modal>

          {/* Change summary */}
          <View style={styles.summaryCard}>
            {!hasChanges ? (
              <Text style={[styles.summaryNone, { fontFamily: fonts.dmSans }]}>No changes yet</Text>
            ) : (
              <>
                <Text style={[styles.summaryTitle, { fontFamily: fonts.dmSans }]}>CHANGES</Text>
                {addedPeople.map(p   => <Text key={p.id}   style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>+ Adding {p.name}</Text>)}
                {removedPeople.map(s => <Text key={s.person.id} style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>− Removing {s.person.name}</Text>)}
                {addedAddons.map(a   => <Text key={a} style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>+ Adding {allAddons[a]?.label} add-on</Text>)}
                {removedAddons.map(a => <Text key={a} style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>− Removing {allAddons[a]?.label} add-on</Text>)}
                {nightsChanged       && <Text style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>✎ Duration: {checklist.nights}n → {editNights}n</Text>}
                {nameChanges.map(p   => <Text key={p.id} style={[styles.summaryRow, { fontFamily: fonts.dmSans }]}>✎ Renaming → {p.name}</Text>)}
                <Text style={[styles.summaryNote, { fontFamily: fonts.dmSans }]}>Checked items will be preserved.</Text>
              </>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { fontFamily: fonts.dmSans }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              disabled={editPeople.length === 0}
              style={[styles.applyBtn, editPeople.length === 0 && styles.applyBtnDisabled]}
              activeOpacity={0.85}
            >
              <Text style={[styles.applyBtnText, { fontFamily: fonts.dmSans }]}>Apply Changes</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(59,37,16,0.45)',
  },
  sheet: {
    backgroundColor: THEME.parchment,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '85%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(139,90,43,0.25)',
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title:    { fontSize: 28, color: THEME.darkBrown },
  closeBtn: { fontSize: 26, color: THEME.sepia, paddingHorizontal: 4 },

  sectionLabel: {
    fontSize: 11, letterSpacing: 2, color: THEME.sepia,
    fontWeight: '600', marginBottom: 10, marginTop: 16,
  },

  // Nights
  nightsRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  nightsBtn:    { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(139,90,43,0.2)', alignItems: 'center', justifyContent: 'center' },
  nightsBtnText:{ fontSize: 20, color: THEME.brown },
  nightsDisplay:{ flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  nightsNum:    { fontSize: 34, color: THEME.darkBrown },
  nightsWord:   { fontSize: 14, color: THEME.sepia, fontStyle: 'italic' },
  changedBadge: { fontSize: 11, color: '#C4620E', fontWeight: '600' },

  // Pills
  pillRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 40, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'rgba(253,243,220,0.8)' },
  pillActive:  { borderColor: THEME.darkBrown, backgroundColor: 'rgba(139,90,43,0.08)' },
  pillDisabled:{ opacity: 0.35 },
  pillEmoji:   { fontSize: 14 },
  pillText:    { fontSize: 13, fontWeight: '500', color: THEME.brown },

  // People
  personRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(253,243,220,0.7)', borderRadius: 10, padding: 10, marginBottom: 6 },
  personIcon: { fontSize: 18 },
  personName: { fontSize: 14, fontWeight: '500', color: THEME.darkBrown },
  editHint:   { fontSize: 11, color: THEME.sepia },
  newBadge:   { fontSize: 10, color: '#2D5016', fontWeight: '600' },
  nameInput:  { flex: 1, fontSize: 14, color: THEME.darkBrown, borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'white' },
  removeBtn:  { fontSize: 20, color: '#C4620E', paddingHorizontal: 4 },

  // Add-ons
  addonHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  addAddonBtn:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(139,90,43,0.25)', borderStyle: 'dashed' },
  addAddonBtnText:   { fontSize: 12, fontWeight: '600', color: THEME.sepia },
  addonsEmpty:       { fontSize: 13, color: THEME.accentMuted, fontStyle: 'italic', marginBottom: 8 },
  selectedAddons:    { gap: 6, marginBottom: 8 },
  selectedAddon:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(253,243,220,0.8)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  selectedAddonIcon: { fontSize: 18 },
  selectedAddonLabel:{ flex: 1, fontSize: 14, color: THEME.darkBrown },
  removeAddon:       { fontSize: 20, color: '#C4620E', paddingHorizontal: 2 },

  // Picker sheet
  pickerSheet: {
    backgroundColor: THEME.parchment,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '80%',
    elevation: 20,
  },
  pickerHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pickerTitle:     { fontSize: 24, color: THEME.darkBrown },
  pickerRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.07)' },
  pickerRowActive: { backgroundColor: 'rgba(139,90,43,0.04)', borderRadius: 10 },
  pickerRowIcon:   { fontSize: 22 },
  pickerRowLabel:  { flex: 1, fontSize: 15, color: THEME.darkBrown },
  pickerCheck:     { fontSize: 16, color: THEME.brown, fontWeight: '700' },

  // Summary
  summaryCard:  { backgroundColor: 'rgba(253,243,220,0.6)', borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: THEME.border },
  summaryNone:  { fontSize: 13, color: THEME.accentMuted, textAlign: 'center' },
  summaryTitle: { fontSize: 11, letterSpacing: 1.5, color: THEME.sepia, fontWeight: '600', marginBottom: 8 },
  summaryRow:   { fontSize: 13, color: THEME.brown, marginBottom: 3 },
  summaryNote:  { fontSize: 11, color: THEME.sepia, marginTop: 8, fontStyle: 'italic' },

  // Buttons
  btnRow:          { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn:       { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  cancelBtnText:   { fontSize: 14, fontWeight: '600', color: THEME.brown },
  applyBtn:        { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.darkBrown, alignItems: 'center' },
  applyBtnDisabled:{ backgroundColor: THEME.accentMuted },
  applyBtnText:    { fontSize: 14, fontWeight: '600', color: '#EDD5A8' },
});
