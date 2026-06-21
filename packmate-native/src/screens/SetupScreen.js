import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView as SAV } from 'react-native-safe-area-context';
import {
  ACTIVITY_TEMPLATES, WEATHER_ADDITIONS, ACTIVITY_ADDONS,
  PERSON_TYPES, FOOD_ITEMS,
  generateId, filterFoodItems, applyDurationPlaceholders,
  getEffectiveActivityTemplate, getEffectiveDurationItems,
} from '../data';
import { THEME } from '../theme';

const MAX_NIGHTS = 30;

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionLabel({ children, fonts }) {
  return (
    <Text style={[styles.sectionLabel, { fontFamily: fonts.kalam }]}>{children}</Text>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

export default function SetupScreen({
  fonts,
  customActivities = {},
  hiddenActivities = [],
  customAddons = {},
  customIcons = {},
  templateOverrides = {},
  onGenerate,
  onBack,
}) {
  const [tripName, setTripName]             = useState('');
  const [nights, setNights]                 = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedWeather, setSelectedWeather]   = useState([]);
  const [selectedAddons, setSelectedAddons]     = useState([]);
  const [people, setPeople]                 = useState([]);
  const [editingPersonId, setEditingPersonId]   = useState(null);

  const allActivities = useMemo(
    () => ({ ...ACTIVITY_TEMPLATES, ...customActivities }),
    [customActivities],
  );
  const visibleActivities = useMemo(() => {
    const r = {};
    Object.entries(allActivities).forEach(([k, v]) => {
      if (!hiddenActivities.includes(k)) r[k] = v;
    });
    return r;
  }, [allActivities, hiddenActivities]);

  const allAddons = useMemo(
    () => ({ ...ACTIVITY_ADDONS, ...customAddons }),
    [customAddons],
  );

  const personTypes = useMemo(
    () => PERSON_TYPES.map(pt => ({ ...pt, icon: customIcons[pt.value] || pt.icon })),
    [customIcons],
  );

  const addPerson = (type) => {
    const typeInfo = personTypes.find(p => p.value === type);
    const count = people.filter(p => p.type === type).length;
    setPeople(prev => [...prev, { id: generateId(), type, name: `${typeInfo.label} ${count + 1}` }]);
  };

  const removePerson = (id) => setPeople(prev => prev.filter(p => p.id !== id));

  const renamePerson = (id, name) =>
    setPeople(prev => prev.map(p => p.id === id ? { ...p, name } : p));

  const DEFAULT_NAME = /^(Adult|Child|Baby|Pet) \d+$/;

  const handlePersonFocus = (person) => {
    if (DEFAULT_NAME.test(person.name)) {
      renamePerson(person.id, '');
    }
  };

  const nightsHint = () => {
    if (nights === 0) return 'Day expedition — no overnight supplies needed';
    if (nights < 2)   return null;
    if (nights < 4)   return 'Multi-day journey — toiletries & essentials included';
    if (nights < 7)   return 'Extended expedition — laundry bag, extra shoes…';
    return 'Long journey — all provision tiers activated';
  };

  const canGenerate = selectedActivity && people.length > 0;

  const handleGenerate = () => {
    const template = getEffectiveActivityTemplate(
      allActivities[selectedActivity],
      templateOverrides[selectedActivity],
    );
    const effectiveDuration = getEffectiveDurationItems(templateOverrides);

    const sections = people.map(person => {
      const baseItems = (template.items[person.type] || []).map(text => ({
        id: generateId(), text, checked: false,
      }));
      const weatherItems = selectedWeather.flatMap(w =>
        WEATHER_ADDITIONS[w].items.map(text => ({
          id: generateId(), text, checked: false, weather: true,
        }))
      );
      const durationItems = effectiveDuration
        .filter(d => nights >= d.minNights)
        .flatMap(d =>
          (d.items[person.type] || []).map(raw => ({
            id: generateId(),
            text: applyDurationPlaceholders(raw, nights),
            checked: false, duration: true,
          }))
        );
      const addonItems = selectedAddons.flatMap(a =>
        (allAddons[a]?.items[person.type] || []).map(text => ({
          id: generateId(), text, checked: false, addon: a,
        }))
      );
      return { person, items: [...baseItems, ...durationItems, ...addonItems, ...weatherItems] };
    });

    const groupIcon  = customIcons.group || '⛺';
    const baseGroup  = people.length >= 2
      ? (template.groupItems || []).map(text => ({ id: generateId(), text, checked: false }))
      : [];
    const addonGroup = selectedAddons.flatMap(a =>
      (allAddons[a]?.items?.group || []).map(text => ({
        id: generateId(), text, checked: false, addon: a,
      }))
    );
    const durationGroup = effectiveDuration
      .filter(d => nights >= d.minNights)
      .flatMap(d =>
        (d.items.group || []).map(text => ({ id: generateId(), text, checked: false, duration: true }))
      );
    const groupItems = [...baseGroup, ...durationGroup, ...addonGroup];

    const foodSource = FOOD_ITEMS[selectedActivity] || FOOD_ITEMS._default;
    const hasBaby = people.some(p => p.type === 'baby');
    const hasPet  = people.some(p => p.type === 'pet');
    const foodItems = filterFoodItems(foodSource, hasBaby, hasPet).map(text => ({
      id: generateId(), text, checked: false, activity: selectedActivity,
    }));

    onGenerate({
      id: generateId(),
      name: tripName.trim() || `${template.label} Trip`,
      activity: selectedActivity,
      activityIcon: template.icon,
      activityColor: template.color,
      weather: selectedWeather,
      nights,
      addons: selectedAddons,
      sections,
      groupItems,
      foodItems,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <SAV style={styles.safe}>
      {/* On Android the manifest's adjustResize already handles the keyboard;
          `padding` behavior would double-adjust, so only use it on iOS. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backText, { fontFamily: fonts.crimsonPro }]}>← Back to camp</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { fontFamily: fonts.playfairDisplay }]}>Plan Your Expedition</Text>
        <View style={styles.titleDivider} />

        {/* ── Trip Name ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>Trip Name</SectionLabel>
          <TextInput
            value={tripName}
            onChangeText={setTripName}
            placeholder="The Lost Temple Expedition..."
            placeholderTextColor="rgba(139,90,43,0.35)"
            style={[styles.tripNameInput, { fontFamily: fonts.kalam }]}
            maxLength={100}
          />
        </View>

        {/* ── Duration ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>Duration (nights)</SectionLabel>
          <View style={styles.nightsRow}>
            <TouchableOpacity
              onPress={() => setNights(n => Math.max(0, n - 1))}
              style={styles.nightsBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.nightsBtnText, { fontFamily: fonts.dmSans }]}>−</Text>
            </TouchableOpacity>
            <View style={styles.nightsDisplay}>
              <Text style={[styles.nightsNumber, { fontFamily: fonts.kalam }]}>{nights}</Text>
              <Text style={[styles.nightsWord, { fontFamily: fonts.crimsonPro }]}>
                {nights === 1 ? 'night' : 'nights'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setNights(n => Math.min(MAX_NIGHTS, n + 1))}
              style={styles.nightsBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.nightsBtnText, { fontFamily: fonts.dmSans }]}>+</Text>
            </TouchableOpacity>
          </View>
          {nightsHint() && (
            <Text style={[styles.nightsHint, { fontFamily: fonts.crimsonPro }]}>{nightsHint()}</Text>
          )}
        </View>

        {/* ── Activity ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>Activity</SectionLabel>
          <View style={styles.activityGrid}>
            {Object.entries(visibleActivities).map(([key, tmpl]) => {
              const active = selectedActivity === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedActivity(key)}
                  style={[
                    styles.activityCard,
                    active && { borderColor: tmpl.color, backgroundColor: `${tmpl.color}18` },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.activityIcon}>{tmpl.icon}</Text>
                  <Text style={[
                    styles.activityLabel,
                    { fontFamily: fonts.kalam, color: active ? tmpl.color : THEME.brown },
                  ]}>
                    {tmpl.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Weather ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>Weather Conditions</SectionLabel>
          <View style={styles.pillRow}>
            {Object.entries(WEATHER_ADDITIONS).map(([key, w]) => {
              const active = selectedWeather.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedWeather(prev =>
                    active ? prev.filter(x => x !== key) : [...prev, key]
                  )}
                  style={[styles.pill, active && styles.pillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.pillEmoji}>{w.icon}</Text>
                  <Text style={[styles.pillText, { fontFamily: fonts.dmSans }]}>{w.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Add-ons ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>Add-ons</SectionLabel>
          <View style={styles.pillRow}>
            {Object.entries(allAddons).map(([key, addon]) => {
              const active = selectedAddons.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedAddons(prev =>
                    active ? prev.filter(x => x !== key) : [...prev, key]
                  )}
                  style={[styles.pill, active && styles.pillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.pillEmoji}>{addon.icon}</Text>
                  <Text style={[styles.pillText, { fontFamily: fonts.dmSans }]}>{addon.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Party ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel fonts={fonts}>The Expedition Party</SectionLabel>
          <View style={styles.pillRow}>
            {personTypes.map(pt => {
              const tmpl = selectedActivity
                ? getEffectiveActivityTemplate(allActivities[selectedActivity], templateOverrides[selectedActivity])
                : null;
              const disabled = tmpl && (!tmpl.items?.[pt.value] || tmpl.items[pt.value].length === 0);
              return (
                <TouchableOpacity
                  key={pt.value}
                  onPress={() => !disabled && addPerson(pt.value)}
                  style={[styles.pill, disabled && styles.pillDisabled]}
                  activeOpacity={disabled ? 1 : 0.75}
                >
                  <Text style={styles.pillEmoji}>{pt.icon}</Text>
                  <Text style={[styles.pillText, { fontFamily: fonts.dmSans, opacity: disabled ? 0.4 : 1 }]}>
                    + {pt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {people.map(person => {
            const pt = personTypes.find(p => p.value === person.type);
            const isEditing = editingPersonId === person.id;
            return (
              <View key={person.id} style={styles.personRow}>
                <Text style={styles.personIcon}>{pt.icon}</Text>
                {isEditing ? (
                  <TextInput
                    value={person.name}
                    onChangeText={name => renamePerson(person.id, name)}
                    onFocus={() => handlePersonFocus(person)}
                    onBlur={() => setEditingPersonId(null)}
                    onSubmitEditing={() => setEditingPersonId(null)}
                    autoFocus
                    maxLength={50}
                    style={[styles.personNameInput, { fontFamily: fonts.dmSans }]}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setEditingPersonId(person.id)}
                    style={{ flex: 1 }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.personName, { fontFamily: fonts.dmSans }]}>
                      {person.name}
                      <Text style={styles.editHint}> ✎</Text>
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => removePerson(person.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.personRemove}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Generate ──────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={!canGenerate}
          style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
          activeOpacity={0.85}
        >
          <Text style={[styles.generateBtnText, { fontFamily: fonts.dmSans }]}>
            Begin the Expedition 🧭
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SAV>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: THEME.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 16 },

  backBtn:  { marginBottom: 20 },
  backText: { fontSize: 15, color: THEME.sepia, fontStyle: 'italic' },

  title: {
    fontSize: 38,
    color: THEME.darkBrown, marginBottom: 8,
  },
  titleDivider: {
    width: 60, height: 2,
    backgroundColor: 'rgba(139,90,43,0.35)',
    marginBottom: 28,
  },

  section:      { marginBottom: 28 },
  sectionLabel: { fontSize: 22, fontWeight: '600', color: THEME.brown, marginBottom: 12 },

  // Trip name
  tripNameInput: {
    fontSize: 20, color: THEME.darkBrown,
    borderBottomWidth: 2, borderBottomColor: 'rgba(139,90,43,0.2)',
    paddingVertical: 10, paddingHorizontal: 2,
    backgroundColor: 'transparent',
  },

  // Nights
  nightsRow:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nightsBtn:    {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(139,90,43,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  nightsBtnText:  { fontSize: 22, color: THEME.brown, lineHeight: 26 },
  nightsDisplay:  { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  nightsNumber:   { fontSize: 42, fontWeight: '700', color: THEME.darkBrown },
  nightsWord:     { fontSize: 16, color: THEME.sepia, fontStyle: 'italic' },
  nightsHint:     { fontSize: 13, color: THEME.sepia, fontStyle: 'italic', marginTop: 8 },

  // Activity grid — 3 columns
  activityGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  activityCard: {
    width: '30.5%',
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(139,90,43,0.12)',
    backgroundColor: 'rgba(253,243,220,0.55)',
    alignItems: 'center',
  },
  activityIcon:  { fontSize: 26, marginBottom: 4 },
  activityLabel: { fontSize: 15, fontWeight: '600', textAlign: 'center' },

  // Pills (weather, addons, party add buttons)
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 40,
    borderWidth: 2, borderColor: 'transparent',
    backgroundColor: 'rgba(253,243,220,0.6)',
  },
  pillActive: {
    borderColor: THEME.darkBrown,
    backgroundColor: 'rgba(139,90,43,0.08)',
  },
  pillDisabled: { opacity: 0.4 },
  pillEmoji:    { fontSize: 15 },
  pillText:     { fontSize: 13, fontWeight: '500', color: THEME.brown },

  // Party members
  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(253,243,220,0.6)',
    borderRadius: 12, padding: 12, marginTop: 10,
  },
  personIcon:      { fontSize: 20 },
  personName:      { fontSize: 15, fontWeight: '500', color: THEME.darkBrown },
  editHint:        { fontSize: 11, color: THEME.sepia },
  personNameInput: {
    flex: 1, fontSize: 14, color: THEME.darkBrown,
    borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)',
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  personRemove: { fontSize: 20, color: '#C4620E', paddingHorizontal: 4 },

  // Generate button
  generateBtn: {
    paddingVertical: 18, paddingHorizontal: 24,
    backgroundColor: THEME.brown,
    borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(139,90,43,0.3)',
    alignItems: 'center',
    shadowColor: THEME.darkBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
    elevation: 5,
  },
  generateBtnDisabled: {
    backgroundColor: THEME.accentMuted,
    borderWidth: 0, elevation: 0,
    shadowOpacity: 0,
  },
  generateBtnText: {
    color: '#EDD5A8', fontSize: 17, fontWeight: '600', letterSpacing: 0.5,
  },
});
