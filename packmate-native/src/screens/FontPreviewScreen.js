import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../theme';

const TITLE_FONTS = [
  { key: 'Caveat_700Bold',          label: 'Caveat (current)' },
  { key: 'PlayfairDisplay_700Bold', label: 'Playfair Display' },
  { key: 'Cinzel_700Bold',          label: 'Cinzel' },
  { key: 'Oswald_700Bold',          label: 'Oswald' },
  { key: 'AbrilFatface_400Regular', label: 'Abril Fatface' },
];

const TRIP_FONTS = [
  { key: 'Caveat_700Bold',       label: 'Caveat (current)' },
  { key: 'Satisfy_400Regular',   label: 'Satisfy' },
  { key: 'Kalam_400Regular',     label: 'Kalam' },
  { key: 'Pacifico_400Regular',  label: 'Pacifico' },
  { key: 'CrimsonPro_400Regular_Italic', label: 'Crimson Pro Italic' },
];

export default function FontPreviewScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Font Preview</Text>
        <Text style={styles.pageSubtitle}>Scroll through and pick your favourites</Text>

        {/* ── Hero title options ─────────────────────────────────────── */}
        <Text style={styles.groupLabel}>APP TITLE  ("PackMate")</Text>
        {TITLE_FONTS.map(f => (
          <View key={f.key} style={styles.card}>
            <Text style={styles.fontLabel}>{f.label}</Text>
            <Text style={[styles.titlePreview, { fontFamily: f.key }]}>PackMate</Text>
            <Text style={[styles.taglinePreview, { fontFamily: 'CrimsonPro_400Regular_Italic' }]}>
              Never forget a thing
            </Text>
          </View>
        ))}

        {/* ── Trip name options ──────────────────────────────────────── */}
        <Text style={[styles.groupLabel, { marginTop: 24 }]}>TRIP CARD NAME</Text>
        {TRIP_FONTS.map(f => (
          <View key={f.key} style={styles.card}>
            <Text style={styles.fontLabel}>{f.label}</Text>
            <Text style={[styles.tripPreview, { fontFamily: f.key }]}>Sleepover Trip</Text>
            <Text style={[styles.tripPreview, { fontFamily: f.key, fontSize: 18 }]}>The Lost Temple Expedition</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: THEME.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },

  backBtn:       { marginBottom: 16 },
  backText:      { fontSize: 15, color: THEME.sepia, fontStyle: 'italic' },
  pageTitle:     { fontSize: 22, fontWeight: '700', color: THEME.darkBrown, marginBottom: 4 },
  pageSubtitle:  { fontSize: 13, color: THEME.sepia, marginBottom: 24 },
  groupLabel:    { fontSize: 11, letterSpacing: 2, color: THEME.sepia, fontWeight: '600', marginBottom: 10 },

  card: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 10,
  },
  fontLabel:     { fontSize: 11, color: THEME.accentMuted, fontWeight: '600', marginBottom: 8, letterSpacing: 1 },
  titlePreview:  { fontSize: 48, color: THEME.darkBrown, marginBottom: 4 },
  taglinePreview:{ fontSize: 13, color: THEME.sepia, letterSpacing: 2 },
  tripPreview:   { fontSize: 22, color: THEME.darkBrown, marginBottom: 4 },
});
