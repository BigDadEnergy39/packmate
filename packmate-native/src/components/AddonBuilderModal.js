import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal,
} from 'react-native';
import { THEME } from '../theme';

const ADDON_ICONS = [
  "🎯","🏹","🎣","🚴","🧗","🛶","🎨","📷","🎮","🎸",
  "⚽","🏓","🎿","🏄","🧘","🪂","🏇","🎭","🔭","🍳",
  "🏕️","🧩","🎪","🛸","🎲","♟️","🎻","🥊","🏋️","🤿",
];

const TABS = [
  { key: 'adult', label: 'Adult',  icon: '🧭' },
  { key: 'child', label: 'Child',  icon: '⭐' },
  { key: 'baby',  label: 'Baby',   icon: '🍼' },
  { key: 'pet',   label: 'Pet',    icon: '🐾' },
  { key: 'group', label: 'Group',  icon: '⛺' },
];

export default function AddonBuilderModal({ visible, editingAddon, editingKey, fonts, onSave, onDelete, onClose }) {
  const [name,      setName]      = useState('');
  const [icon,      setIcon]      = useState('🎯');
  const [activeTab, setActiveTab] = useState('adult');
  const [items,     setItems]     = useState({ adult: [], child: [], baby: [], pet: [], group: [] });
  const [newItem,   setNewItem]   = useState('');

  useEffect(() => {
    if (visible) {
      if (editingAddon) {
        setName(editingAddon.label || '');
        setIcon(editingAddon.icon  || '🎯');
        setItems({
          adult: [...(editingAddon.items?.adult || [])],
          child: [...(editingAddon.items?.child || [])],
          baby:  [...(editingAddon.items?.baby  || [])],
          pet:   [...(editingAddon.items?.pet   || [])],
          group: [...(editingAddon.items?.group || [])],
        });
      } else {
        setName('');
        setIcon('🎯');
        setItems({ adult: [], child: [], baby: [], pet: [], group: [] });
      }
      setActiveTab('adult');
      setNewItem('');
    }
  }, [visible, editingAddon]);

  const currentItems = items[activeTab] || [];

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems(prev => ({ ...prev, [activeTab]: [...(prev[activeTab] || []), newItem.trim()] }));
    setNewItem('');
  };

  const removeItem = (idx) => {
    setItems(prev => ({ ...prev, [activeTab]: prev[activeTab].filter((_, i) => i !== idx) }));
  };

  const totalItems = Object.values(items).reduce((n, arr) => n + arr.length, 0);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ label: name.trim(), icon, custom: true, items });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: fonts.playfairDisplay }]}>
              {editingAddon ? 'Edit Add-on' : 'New Add-on'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={[styles.label, { fontFamily: fonts.dmSans }]}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rock Climbing, Photography..."
            placeholderTextColor="rgba(139,90,43,0.35)"
            style={[styles.nameInput, { fontFamily: fonts.dmSans }]}
            maxLength={50}
          />

          {/* Icon */}
          <Text style={[styles.label, { fontFamily: fonts.dmSans }]}>ICON</Text>
          <View style={styles.iconGrid}>
            {ADDON_ICONS.map(ic => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items by person type */}
          <Text style={[styles.label, { fontFamily: fonts.dmSans }]}>ITEMS BY TYPE</Text>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {TABS.map(tab => {
              const count = items[tab.key]?.length || 0;
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
                  {count > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={[styles.tabBadgeText, { fontFamily: fonts.dmSans }]}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Item list */}
          <View style={styles.itemList}>
            {currentItems.length === 0 && (
              <Text style={[styles.emptyItems, { fontFamily: fonts.dmSans }]}>
                No items for {TABS.find(t => t.key === activeTab)?.label} yet
              </Text>
            )}
            {currentItems.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={[styles.itemText, { fontFamily: fonts.dmSans }]}>{item}</Text>
                <TouchableOpacity onPress={() => removeItem(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.itemRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addItem}
                placeholder={`Add ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} item...`}
                placeholderTextColor="rgba(139,90,43,0.35)"
                style={[styles.addInput, { fontFamily: fonts.dmSans }]}
                maxLength={200}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={addItem} style={styles.addBtn} activeOpacity={0.8}>
                <Text style={[styles.addBtnText, { fontFamily: fonts.dmSans }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            {editingAddon && (
              <TouchableOpacity onPress={() => onDelete(editingKey)} style={styles.deleteBtn}>
                <Text style={[styles.deleteBtnText, { fontFamily: fonts.dmSans }]}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { fontFamily: fonts.dmSans }]}>
                {editingAddon ? 'Save Changes' : `Create Add-on${totalItems > 0 ? ` · ${totalItems} items` : ''}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(59,37,16,0.45)' },
  sheet: {
    backgroundColor: THEME.parchment,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '90%',
    elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(139,90,43,0.25)', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title:  { fontSize: 26, color: THEME.darkBrown },
  closeBtn: { fontSize: 26, color: THEME.sepia, paddingHorizontal: 4 },

  label: { fontSize: 11, letterSpacing: 2, color: THEME.sepia, fontWeight: '600', marginBottom: 10, marginTop: 16 },

  nameInput: {
    fontSize: 15, color: THEME.darkBrown,
    borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: 'rgba(253,243,220,0.7)',
  },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(253,243,220,0.6)',
    borderWidth: 2, borderColor: 'transparent',
  },
  iconBtnActive: { borderColor: THEME.darkBrown, backgroundColor: 'rgba(139,90,43,0.1)' },
  iconBtnText: { fontSize: 20 },

  tabs: { marginBottom: 2 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, marginRight: 6,
    borderWidth: 2, borderColor: 'transparent',
    backgroundColor: 'rgba(253,243,220,0.5)',
  },
  tabActive: { borderColor: THEME.darkBrown, backgroundColor: 'rgba(139,90,43,0.07)' },
  tabIcon:  { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  tabBadge: { backgroundColor: THEME.darkBrown, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { fontSize: 10, color: '#F5E6C8', fontWeight: '700' },

  itemList: {
    backgroundColor: 'rgba(253,243,220,0.6)', borderRadius: 12,
    padding: 12, marginTop: 8, minHeight: 80,
  },
  emptyItems: { fontSize: 13, color: THEME.accentMuted, textAlign: 'center', paddingVertical: 12 },
  itemRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(139,90,43,0.06)' },
  itemText:  { flex: 1, fontSize: 14, color: THEME.darkBrown },
  itemRemove:{ fontSize: 20, color: '#C4620E', paddingHorizontal: 4, opacity: 0.7 },
  addRow:    { flexDirection: 'row', gap: 8, marginTop: 10 },
  addInput:  { flex: 1, fontSize: 14, color: THEME.darkBrown, borderWidth: 1, borderColor: 'rgba(139,90,43,0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'white' },
  addBtn:    { backgroundColor: THEME.darkBrown, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnText:{ fontSize: 13, fontWeight: '600', color: '#EDD5A8' },

  btnRow:        { flexDirection: 'row', gap: 10, marginTop: 20 },
  deleteBtn:     { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(196,98,14,0.3)' },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#C4620E' },
  saveBtn:       { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.darkBrown, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: THEME.accentMuted },
  saveBtnText:   { fontSize: 14, fontWeight: '600', color: '#EDD5A8' },
});
