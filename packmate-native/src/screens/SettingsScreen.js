import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PERSON_TYPES } from '../data';
import { THEME } from '../theme';
import AddonBuilderModal from '../components/AddonBuilderModal';
import { generateId } from '../data';

// ─── Icon options per type ────────────────────────────────────────────────────

const ICON_OPTIONS = {
  adult: ['🧭', '🗺️', '🎒', '🥾', '🏔️', '⚔️', '🛡️', '🔭', '🪖', '👤', '🧑', '🙂', '💪', '🦺'],
  child: ['⭐', '🌟', '🔦', '🪁', '🧸', '🎨', '📚', '🦊', '🌈', '🪄', '👦', '👧', '🎈', '🏃'],
  baby:  ['🍼', '🧒', '👶', '🐣', '🌱', '🧷', '🎒', '🐤', '🌸', '🧦'],
  pet:   ['🐾', '🐕', '🐈', '🦮', '🐿️', '🦜', '🐢', '🐇', '🐴', '🐠'],
  group: ['⛺', '🏕️', '🔥', '👥', '🤝', '🫂', '📦', '🧰', '🛖', '🏴'],
  food:  ['🍽️', '🍳', '🥘', '☕', '🧊', '🍕', '🥤', '🧺', '🍴', '🫕'],
};

// ─── Row wrapper ──────────────────────────────────────────────────────────────

function SettingsRow({ icon, title, subtitle, right, onPress, dim }) {
  const Inner = (
    <View style={[styles.row, dim && { opacity: 0.5 }]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
  return onPress
    ? <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{Inner}</TouchableOpacity>
    : Inner;
}

// ─── Confirm button pair ──────────────────────────────────────────────────────

function ConfirmButtons({ onCancel, onConfirm, confirmLabel = 'Confirm', destructive = true }) {
  return (
    <View style={styles.confirmRow}>
      <TouchableOpacity onPress={onCancel} style={styles.confirmCancel}>
        <Text style={styles.confirmCancelText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onConfirm} style={[styles.confirmGo, destructive && styles.confirmGoDestructive]}>
        <Text style={styles.confirmGoText}>{confirmLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

export default function SettingsScreen({
  fonts,
  savedTrips,
  customAddons,
  customIcons,
  templateOverrides,
  onClearTrips,
  onClearAddons,
  onResetTemplates,
  onResetAll,
  onSetIcon,
  onResetIcons,
  onSaveCustomAddon,
  onDeleteCustomAddon,
  onOpenTemplateEditor,
  onBack,
}) {
  const [iconsExpanded, setIconsExpanded]   = useState(false);
  const [addonsExpanded, setAddonsExpanded] = useState(false);
  const [confirm, setConfirm]               = useState(null);
  const [addonBuilderOpen, setAddonBuilderOpen] = useState(false);
  const [editingAddonKey, setEditingAddonKey]   = useState(null);

  const personTypes = PERSON_TYPES.map(pt => ({ ...pt, icon: customIcons[pt.value] || pt.icon }));
  const groupIcon   = customIcons.group || '⛺';
  const foodIcon    = customIcons.food  || '🍽️';

  const hasCustomIcons     = Object.keys(customIcons).length > 0;
  const hasCustomAddons    = Object.keys(customAddons).length > 0;
  const hasTemplateChanges = Object.keys(templateOverrides).length > 0;

  const addonCount = Object.keys(customAddons).length;
  const tripCount  = savedTrips.length;

  const doConfirm = (action) => {
    setConfirm(null);
    switch (action) {
      case 'trips':     onClearTrips();     break;
      case 'addons':    onClearAddons();    break;
      case 'templates': onResetTemplates(); break;
      case 'all':       onResetAll();       break;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={[styles.backText, { fontFamily: fonts.crimsonPro }]}>← Back to camp</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { fontFamily: fonts.playfairDisplay }]}>Settings</Text>
        <View style={styles.titleDivider} />

        {/* ── Customize Default Lists ─────────────────────────────────── */}
        <View style={styles.section}>
          <SettingsRow
            icon="📝"
            title="Customize Default Lists"
            subtitle="Edit default items for activities & overnight tiers"
            right={
              Object.keys(templateOverrides).length > 0
                ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.smallBtn, { borderColor: 'rgba(45,80,22,0.2)' }]}>
                      <Text style={[styles.smallBtnText, { color: '#2D5016', fontFamily: fonts.dmSans }]}>
                        {Object.keys(templateOverrides).length} edited
                      </Text>
                    </View>
                    <Text style={styles.rowArrow}>→</Text>
                  </View>
                : <Text style={styles.rowArrow}>→</Text>
            }
            onPress={onOpenTemplateEditor}
          />
        </View>

        {/* ── Customize Icons ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setIconsExpanded(e => !e)}
            activeOpacity={0.75}
          >
            <View style={styles.row}>
              <Text style={styles.rowIcon}>🎭</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Customize Icons</Text>
                <Text style={styles.rowSubtitle}>Change icons for person types &amp; sections</Text>
              </View>
              {hasCustomIcons && (
                <TouchableOpacity
                  onPress={() => { setConfirm(null); onResetIcons(); }}
                  style={styles.smallBtn}
                >
                  <Text style={[styles.smallBtnText, { fontFamily: fonts.dmSans }]}>Reset</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.rowArrow, iconsExpanded && styles.rowArrowDown]}>→</Text>
            </View>
          </TouchableOpacity>

          {iconsExpanded && (
            <View style={styles.expandedPanel}>
              {[...personTypes, { value: 'group', label: 'Group', icon: groupIcon }, { value: 'food', label: 'Food', icon: foodIcon }].map(pt => {
                const options = ICON_OPTIONS[pt.value] || [];
                const current = pt.icon;
                return (
                  <View key={pt.value} style={styles.iconSection}>
                    <Text style={[styles.iconSectionLabel, { fontFamily: fonts.dmSans }]}>
                      {current}  {pt.label}
                    </Text>
                    <View style={styles.iconGrid}>
                      {options.map(icon => (
                        <TouchableOpacity
                          key={icon}
                          onPress={() => onSetIcon(pt.value, icon)}
                          style={[styles.iconBtn, current === icon && styles.iconBtnActive]}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.iconBtnEmoji}>{icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Custom Add-ons ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setAddonsExpanded(e => !e)}
            activeOpacity={0.75}
          >
            <View style={styles.row}>
              <Text style={styles.rowIcon}>🧩</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Custom Add-ons</Text>
                <Text style={styles.rowSubtitle}>
                  {addonCount} custom add-on{addonCount !== 1 ? 's' : ''} created
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setEditingAddonKey(null); setAddonBuilderOpen(true); }}
                style={styles.smallBtn}
              >
                <Text style={[styles.smallBtnText, { fontFamily: fonts.dmSans }]}>+ New</Text>
              </TouchableOpacity>
              <Text style={[styles.rowArrow, addonsExpanded && styles.rowArrowDown]}>→</Text>
            </View>
          </TouchableOpacity>

          {addonsExpanded && (
            <View style={styles.expandedPanel}>
              {addonCount === 0 && (
                <Text style={[styles.addonEmpty, { fontFamily: fonts.dmSans }]}>No custom add-ons yet. Tap + New to create one.</Text>
              )}
              {Object.entries(customAddons).map(([key, addon]) => {
                const itemCount = Object.values(addon.items || {}).reduce((n, arr) => n + (arr?.length || 0), 0);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => { setEditingAddonKey(key); setAddonBuilderOpen(true); }}
                    style={styles.addonRow}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.addonIcon}>{addon.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.addonName, { fontFamily: fonts.dmSans }]}>{addon.label}</Text>
                      <Text style={[styles.addonCount, { fontFamily: fonts.dmSans }]}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
                    </View>
                    <Text style={styles.rowArrow}>→</Text>
                  </TouchableOpacity>
                );
              })}
              {hasCustomAddons && (
                confirm === 'addons' ? (
                  <ConfirmButtons onCancel={() => setConfirm(null)} onConfirm={() => doConfirm('addons')} confirmLabel="Clear All" />
                ) : (
                  <TouchableOpacity onPress={() => setConfirm('addons')} style={[styles.smallBtnDestructive, { marginTop: 8, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.smallBtnDestructiveText, { fontFamily: fonts.dmSans }]}>Clear All</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>

        {/* Addon Builder Modal */}
        <AddonBuilderModal
          visible={addonBuilderOpen}
          editingAddon={editingAddonKey ? customAddons[editingAddonKey] : null}
          editingKey={editingAddonKey}
          fonts={fonts}
          onSave={(addon) => {
            const key = editingAddonKey || `custom_${addon.label.toLowerCase().replace(/\s+/g, '_')}_${generateId()}`;
            onSaveCustomAddon(key, addon);
            setAddonBuilderOpen(false);
            setEditingAddonKey(null);
          }}
          onDelete={(key) => {
            onDeleteCustomAddon(key);
            setAddonBuilderOpen(false);
            setEditingAddonKey(null);
          }}
          onClose={() => { setAddonBuilderOpen(false); setEditingAddonKey(null); }}
        />

        {/* ── Saved Trips ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🗂️</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Saved Trips</Text>
              <Text style={styles.rowSubtitle}>{tripCount} saved trip{tripCount !== 1 ? 's' : ''}</Text>
            </View>
            {tripCount > 0 && (
              confirm === 'trips' ? (
                <ConfirmButtons
                  onCancel={() => setConfirm(null)}
                  onConfirm={() => doConfirm('trips')}
                  confirmLabel="Clear All"
                />
              ) : (
                <TouchableOpacity onPress={() => setConfirm('trips')} style={styles.smallBtnDestructive}>
                  <Text style={[styles.smallBtnDestructiveText, { fontFamily: fonts.dmSans }]}>Clear All</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* ── Template Customizations ─────────────────────────────────── */}
        {hasTemplateChanges && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>🔄</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Template Customizations</Text>
                <Text style={styles.rowSubtitle}>
                  {Object.keys(templateOverrides).length} template{Object.keys(templateOverrides).length !== 1 ? 's' : ''} customized
                </Text>
              </View>
              {confirm === 'templates' ? (
                <ConfirmButtons
                  onCancel={() => setConfirm(null)}
                  onConfirm={() => doConfirm('templates')}
                  confirmLabel="Reset All"
                />
              ) : (
                <TouchableOpacity onPress={() => setConfirm('templates')} style={styles.smallBtnDestructive}>
                  <Text style={[styles.smallBtnDestructiveText, { fontFamily: fonts.dmSans }]}>Reset All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Reset Everything ─────────────────────────────────────────── */}
        <View style={[styles.section, styles.resetSection]}>
          {confirm === 'all' ? (
            <View style={styles.resetConfirmBlock}>
              <Text style={[styles.resetWarning, { fontFamily: fonts.dmSans }]}>
                This will erase all saved trips, custom add-ons, and template customizations.
              </Text>
              <ConfirmButtons
                onCancel={() => setConfirm(null)}
                onConfirm={() => doConfirm('all')}
                confirmLabel="Erase Everything"
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => setConfirm('all')} style={styles.resetBtn} activeOpacity={0.75}>
              <Text style={[styles.resetBtnText, { fontFamily: fonts.dmSans }]}>Reset Everything to Factory Defaults</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: THEME.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  backText: { fontSize: 15, color: THEME.sepia, fontStyle: 'italic' },

  pageTitle:    { fontSize: 38, color: THEME.darkBrown, marginTop: 8 },
  titleDivider: { width: 60, height: 2, backgroundColor: 'rgba(139,90,43,0.35)', marginBottom: 24, marginTop: 4 },

  section: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon:     { fontSize: 22 },
  rowText:     { flex: 1 },
  rowTitle:    { fontSize: 14, fontWeight: '600', color: THEME.darkBrown },
  rowSubtitle: { fontSize: 12, color: THEME.sepia, marginTop: 2 },
  rowArrow:    { fontSize: 16, color: THEME.sepia },
  rowArrowDown: { transform: [{ rotate: '90deg' }] },

  // Expanded panel
  expandedPanel: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Icon picker
  iconSection: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.06)' },
  iconSectionLabel: { fontSize: 13, fontWeight: '600', color: THEME.brown, marginBottom: 8 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(253,243,220,0.5)',
    borderWidth: 2, borderColor: 'transparent',
  },
  iconBtnActive: {
    borderColor: THEME.darkBrown,
    backgroundColor: 'rgba(139,90,43,0.1)',
  },
  iconBtnEmoji: { fontSize: 18 },

  // Addon list
  addonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.05)',
  },
  addonEmpty: { fontSize: 13, color: THEME.accentMuted, fontStyle: 'italic', paddingVertical: 8 },
  addonIcon:  { fontSize: 20 },
  addonName:  { fontSize: 13, fontWeight: '600', color: THEME.darkBrown },
  addonCount: { fontSize: 11, color: THEME.sepia, marginTop: 1 },

  // Small action buttons
  smallBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: THEME.border,
  },
  smallBtnText: { fontSize: 11, fontWeight: '600', color: THEME.brown },

  smallBtnDestructive: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(196,98,14,0.3)',
  },
  smallBtnDestructiveText: { fontSize: 11, fontWeight: '600', color: '#C4620E' },

  // Confirm pair
  confirmRow:             { flexDirection: 'row', gap: 6, alignItems: 'center' },
  confirmCancel:          { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: THEME.border },
  confirmCancelText:      { fontSize: 11, fontWeight: '600', color: THEME.brown },
  confirmGo:              { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: THEME.brown },
  confirmGoDestructive:   { backgroundColor: '#C4620E' },
  confirmGoText:          { fontSize: 11, fontWeight: '600', color: '#F5E6C8' },

  // Reset section
  resetSection:     { marginTop: 8 },
  resetConfirmBlock:{ padding: 16 },
  resetWarning:     { fontSize: 13, color: '#C4620E', fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  resetBtn: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(196,98,14,0.25)',
    margin: 4, alignItems: 'center',
  },
  resetBtnText: { fontSize: 13, fontWeight: '600', color: '#C4620E' },
});
