import { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { THEME } from '../theme';

// ─── Gear Icon (SVG — avoids Android system emoji hijack) ────────────────────

function GearIcon({ size = 20, color = THEME.sepia }) {
  // Simple gear: outer ring with 6 teeth + inner circle
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.33.07-.66.07-1s-.03-.67-.07-1l2.16-1.68c.19-.15.24-.42.12-.64l-2.05-3.55c-.12-.22-.38-.3-.61-.22l-2.55 1.03c-.53-.4-1.1-.73-1.72-.98l-.38-2.71C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.71c-.62.25-1.19.58-1.72.98L4.86 5.08c-.23-.09-.49 0-.61.22L2.2 8.85c-.13.22-.07.49.12.64l2.16 1.68c-.04.33-.07.67-.07 1s.03.67.07 1l-2.16 1.68c-.19.15-.24.42-.12.64l2.05 3.55c.12.22.38.3.61.22l2.55-1.03c.53.4 1.1.73 1.72.98l.38 2.71c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.71c.62-.25 1.19-.58 1.72-.98l2.55 1.03c.23.09.49 0 .61-.22l2.05-3.55c.12-.22.07-.49-.12-.64l-2.16-1.68z"
      />
    </Svg>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, color, size = 48 }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(139,90,43,0.15)" strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={progress >= 1 ? '#2D7D32' : color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, onLoad, onDelete, onReuse, fonts }) {
  const swipeRef = useRef(null);

  const allItems = [
    ...(trip.sections || []).flatMap(s => s.items),
    ...(trip.groupItems || []),
    ...(trip.foodItems || []),
  ];
  const total    = allItems.length;
  const checked  = allItems.filter(i => i.checked).length;
  const progress = total > 0 ? checked / total : 0;
  const pct      = Math.round(progress * 100);
  const complete = progress >= 1 && total > 0;

  const actColor = trip.activityColor || THEME.brown;
  const date = new Date(trip.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => { swipeRef.current?.close(); onDelete(); }}
      activeOpacity={0.85}
    >
      <Text style={styles.deleteActionText}>🗑</Text>
      <Text style={styles.deleteActionLabel}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity
      style={styles.reuseAction}
      onPress={() => { swipeRef.current?.close(); onReuse(); }}
      activeOpacity={0.85}
    >
      <Text style={styles.reuseActionText}>📋</Text>
      <Text style={styles.reuseActionLabel}>Reuse</Text>
    </TouchableOpacity>
  );

  const handleLongPress = () => {
    Alert.alert(
      trip.name,
      'What would you like to do?',
      [
        { text: 'Open',             onPress: onLoad },
        { text: 'Use as Template',  onPress: onReuse },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={60}
      leftThreshold={60}
      overshootRight={false}
      overshootLeft={false}
      containerStyle={{ marginBottom: 10 }}
    >
      <TouchableOpacity onPress={onLoad} onLongPress={handleLongPress} activeOpacity={0.75}>
        <View style={[styles.tripCard, { borderLeftColor: actColor }]}>
          <View style={styles.tripCardInner}>
            <View style={styles.tripMeta}>
              <Text style={[styles.tripName, { fontFamily: fonts.kalam }]} numberOfLines={1}>
                {trip.name}
              </Text>
              <Text style={[styles.tripDate, { fontFamily: fonts.dmSans }]}>
                {trip.activityIcon ? `${trip.activityIcon}  ` : ''}{date}
                {trip.nights > 0 ? `  ·  ${trip.nights}n` : ''}
              </Text>
              <Text style={[styles.tripProgress, { fontFamily: fonts.dmSans, color: complete ? '#2D7D32' : THEME.sepia }]}>
                {complete ? '✓ All packed!' : `${checked} / ${total} packed`}
              </Text>
            </View>

            <View style={styles.ringWrap}>
              <ProgressRing progress={progress} color={actColor} size={52} />
              <Text style={[styles.ringPct, { fontFamily: fonts.dmSans, color: complete ? '#2D7D32' : THEME.sepia }]}>
                {pct}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ savedTrips, onNewTrip, onLoadTrip, onDeleteTrip, onReuseTrip, onSettings, fonts }) {
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Trip',
      'Remove this trip from your saved lists?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteTrip(id) },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings button */}
        <View style={styles.topBar}>
          <Pressable
            onPress={onSettings}
            style={styles.gearBtn}
            accessibilityLabel="Settings"
            android_ripple={{ color: 'rgba(139,90,43,0.15)', borderless: false, radius: 20 }}
          >
            <GearIcon size={20} color={THEME.sepia} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroCompass}>🧭</Text>
          <Text style={[styles.heroTitle, { fontFamily: fonts.playfairDisplay }]}>PackMate</Text>
          <View style={styles.heroDivider} />
          <Text style={[styles.heroTagline, { fontFamily: fonts.crimsonPro }]}>Never forget a thing</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={onNewTrip} style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={[styles.ctaBtnText, { fontFamily: fonts.dmSans }]}>✦  New Packing List</Text>
        </TouchableOpacity>

        {/* Saved trips */}
        {savedTrips.length > 0 && (
          <View style={styles.tripsSection}>
            <Text style={[styles.tripsSectionLabel, { fontFamily: fonts.dmSans }]}>Saved Trips</Text>
            {savedTrips.filter(Boolean).slice().reverse().map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                fonts={fonts}
                onLoad={() => onLoadTrip(trip)}
                onDelete={() => handleDelete(trip.id)}
                onReuse={() => onReuseTrip(trip)}
              />
            ))}
          </View>
        )}

        {savedTrips.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={[styles.emptyText, { fontFamily: fonts.crimsonPro }]}>
              Your expeditions will appear here.{'\n'}Start planning your first trip!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Top bar
  topBar: {
    alignItems: 'flex-end',
    paddingTop: 12,
    marginBottom: -32,
  },
  gearBtn: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(139,90,43,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    marginBottom: 32,
  },
  heroCompass: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 52,
    color: THEME.darkBrown,
    lineHeight: 60,
    letterSpacing: 1,
  },
  heroDivider: {
    width: 80,
    height: 2,
    backgroundColor: 'rgba(139,90,43,0.3)',
    marginVertical: 10,
  },
  heroTagline: {
    fontSize: 13,
    color: THEME.sepia,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },

  // CTA button
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: THEME.brown,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(139,90,43,0.3)',
    marginBottom: 32,
    shadowColor: THEME.darkBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaBtnText: {
    color: '#EDD5A8',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Trips section
  tripsSection: {
    marginTop: 4,
  },
  tripsSectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: THEME.sepia,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Trip card
  tripCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  deleteAction: {
    backgroundColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 14,
    marginLeft: 8,
  },
  deleteActionText:  { fontSize: 22 },
  deleteActionLabel: { fontSize: 11, color: 'white', fontWeight: '700', marginTop: 2 },
  reuseAction: {
    backgroundColor: THEME.brown,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 14,
    marginRight: 8,
  },
  reuseActionText:  { fontSize: 22 },
  reuseActionLabel: { fontSize: 11, color: '#EDD5A8', fontWeight: '700', marginTop: 2 },
  tripCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 14,
    gap: 12,
  },
  tripMeta: {
    flex: 1,
    gap: 5,
  },
  tripName: {
    fontSize: 22,
    color: THEME.darkBrown,
  },
  tripDate: {
    fontSize: 12,
    color: THEME.sepia,
    marginTop: 2,
  },
  tripProgress: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ringWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: { fontSize: 40, opacity: 0.4 },
  emptyText: {
    fontSize: 16,
    color: THEME.sepia,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
});
