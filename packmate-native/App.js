import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { THEME } from './src/theme';

// Suppress console output in production to avoid leaking details via adb logcat
if (!__DEV__) {
  console.log   = () => {};
  console.warn  = () => {};
  console.error = () => {};
}
import { STORAGE_KEYS, generateId } from './src/data';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TemplateEditorScreen from './src/screens/TemplateEditorScreen';

// ─── Storage (SQLite key-value) ───────────────────────────────────────────────

let _db = null;

const getDb = async () => {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('packmate.db');
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);'
  );
  return _db;
};

export const saveToStorage = async (key, value) => {
  try {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?);',
      key, JSON.stringify(value)
    );
  } catch (e) {
    console.error('Storage save failed:', e);
  }
};

export const loadFromStorage = async (key) => {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync('SELECT value FROM kv WHERE key = ?;', key);
    return row ? JSON.parse(row.value) : null;
  } catch (e) {
    return null;
  }
};

// ─── Root Component ───────────────────────────────────────────────────────────

const FONTS = {
  caveat:          'Caveat_700Bold',
  crimsonPro:      'CrimsonPro_400Regular',
  dmSans:          'DMSans_600SemiBold',
  playfairDisplay: 'PlayfairDisplay_700Bold',
  kalam:           'Kalam_400Regular',
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [screen, setScreen]           = useState('home');
  const [savedTrips, setSavedTrips]   = useState([]);
  const [checklist, setChecklist]     = useState(null);
  const [customActivities, setCustomActivities] = useState({});
  const [hiddenActivities, setHiddenActivities] = useState([]);
  const [customAddons, setCustomAddons]         = useState({});
  const [customIcons, setCustomIcons]           = useState({});
  const [templateOverrides, setTemplateOverrides] = useState({});

  useEffect(() => {
    Font.loadAsync({
      Caveat_400Regular:            require('./assets/fonts/Caveat_400Regular.ttf'),
      Caveat_700Bold:               require('./assets/fonts/Caveat_700Bold.ttf'),
      CrimsonPro_400Regular:        require('./assets/fonts/CrimsonPro_400Regular.ttf'),
      CrimsonPro_400Regular_Italic: require('./assets/fonts/CrimsonPro_400Regular_Italic.ttf'),
      DMSans_400Regular:            require('./assets/fonts/DMSans_400Regular.ttf'),
      DMSans_500Medium:             require('./assets/fonts/DMSans_500Medium.ttf'),
      DMSans_600SemiBold:           require('./assets/fonts/DMSans_600SemiBold.ttf'),
      PlayfairDisplay_700Bold:      require('./assets/fonts/PlayfairDisplay_700Bold.ttf'),
      Kalam_400Regular:             require('./assets/fonts/Kalam_400Regular.ttf'),
    })
    .then(() => { console.log('✅ Fonts loaded'); setFontsLoaded(true); })
    .catch(e => console.error('❌ Font load failed:', e));
  }, []);

  useEffect(() => {
    (async () => {
      const trips   = await loadFromStorage(STORAGE_KEYS.trips);
      if (trips)    setSavedTrips(trips.filter(Boolean));
      const custAct = await loadFromStorage(STORAGE_KEYS.customActivities);
      if (custAct)  setCustomActivities(custAct);
      const hidden  = await loadFromStorage(STORAGE_KEYS.hiddenActivities);
      if (hidden)   setHiddenActivities(hidden);
      const addons  = await loadFromStorage(STORAGE_KEYS.customAddons);
      if (addons)   setCustomAddons(addons);
      const icons   = await loadFromStorage(STORAGE_KEYS.customIcons);
      if (icons)    setCustomIcons(icons);
      const tplOv   = await loadFromStorage(STORAGE_KEYS.templateOverrides);
      if (tplOv)    setTemplateOverrides(tplOv);
    })();
  }, []);

  const handleDeleteTrip = async (id) => {
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    await saveToStorage(STORAGE_KEYS.trips, updated);
  };

  const handleLoadTrip = (trip) => {
    setChecklist(trip);
    setScreen('checklist');
  };

  const handleReuseTrip = async (trip) => {
    const newChecklist = {
      ...trip,
      id: generateId(),
      createdAt: new Date().toISOString(),
      sections: trip.sections.map(s => ({
        person: { ...s.person, id: generateId() },
        items: s.items.map(i => ({ ...i, id: generateId(), checked: false })),
      })),
      groupItems: (trip.groupItems || []).map(i => ({ ...i, id: generateId(), checked: false })),
      foodItems:  (trip.foodItems  || []).map(i => ({ ...i, id: generateId(), checked: false })),
    };
    setChecklist(newChecklist);
    const updated = [...savedTrips, newChecklist];
    setSavedTrips(updated);
    await saveToStorage(STORAGE_KEYS.trips, updated);
    setScreen('checklist');
  };

  const handleGenerate = async (newChecklist) => {
    setChecklist(newChecklist);
    const updated = [...savedTrips, newChecklist];
    setSavedTrips(updated);
    await saveToStorage(STORAGE_KEYS.trips, updated);
    setScreen('checklist');
  };

  const handleSetIcon = async (type, icon) => {
    const updated = { ...customIcons, [type]: icon };
    setCustomIcons(updated);
    await saveToStorage(STORAGE_KEYS.customIcons, updated);
  };

  const handleResetIcons = async () => {
    setCustomIcons({});
    await saveToStorage(STORAGE_KEYS.customIcons, {});
  };

  const handleClearTrips = async () => {
    setSavedTrips([]);
    await saveToStorage(STORAGE_KEYS.trips, []);
  };

  const handleClearAddons = async () => {
    setCustomAddons({});
    await saveToStorage(STORAGE_KEYS.customAddons, {});
  };

  const handleResetTemplates = async () => {
    setTemplateOverrides({});
    await saveToStorage(STORAGE_KEYS.templateOverrides, {});
  };

  const handleSaveOverride = async (key, value) => {
    let updated;
    if (value === null) {
      updated = { ...templateOverrides };
      delete updated[key];
    } else {
      updated = { ...templateOverrides, [key]: value };
    }
    setTemplateOverrides(updated);
    await saveToStorage(STORAGE_KEYS.templateOverrides, updated);
  };

  const handleToggleVisibility = async (key) => {
    const updated = hiddenActivities.includes(key)
      ? hiddenActivities.filter(k => k !== key)
      : [...hiddenActivities, key];
    setHiddenActivities(updated);
    await saveToStorage(STORAGE_KEYS.hiddenActivities, updated);
  };

  const handleSaveCustomAddon = async (key, addon) => {
    const updated = { ...customAddons, [key]: addon };
    setCustomAddons(updated);
    await saveToStorage(STORAGE_KEYS.customAddons, updated);
  };

  const handleDeleteCustomAddon = async (key) => {
    const updated = { ...customAddons };
    delete updated[key];
    setCustomAddons(updated);
    await saveToStorage(STORAGE_KEYS.customAddons, updated);
  };

  const handleResetAll = async () => {
    setSavedTrips([]);
    setCustomAddons({});
    setCustomActivities({});
    setHiddenActivities([]);
    setCustomIcons({});
    await Promise.all([
      saveToStorage(STORAGE_KEYS.trips, []),
      saveToStorage(STORAGE_KEYS.customAddons, {}),
      saveToStorage(STORAGE_KEYS.customActivities, {}),
      saveToStorage(STORAGE_KEYS.hiddenActivities, []),
      saveToStorage(STORAGE_KEYS.customIcons, {}),
      saveToStorage(STORAGE_KEYS.templateOverrides, {}),
    ]);
    setScreen('home');
  };

  const handleChecklistChange = async (updated) => {
    setChecklist(updated);
    const updatedTrips = savedTrips.some(t => t.id === updated.id)
      ? savedTrips.map(t => t.id === updated.id ? updated : t)
      : [...savedTrips, updated];
    setSavedTrips(updatedTrips);
    await saveToStorage(STORAGE_KEYS.trips, updatedTrips);
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={THEME.brown} size="large" />
      </View>
    );
  }

  if (screen === 'home') {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={THEME.darkBrown} />
          <HomeScreen
            savedTrips={savedTrips}
            fonts={FONTS}
            onNewTrip={() => setScreen('setup')}
            onLoadTrip={handleLoadTrip}
            onReuseTrip={handleReuseTrip}
            onDeleteTrip={handleDeleteTrip}
            onSettings={() => setScreen('settings')}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (screen === 'setup') {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={THEME.darkBrown} />
          <SetupScreen
            fonts={FONTS}
            customActivities={customActivities}
            hiddenActivities={hiddenActivities}
            customAddons={customAddons}
            customIcons={customIcons}
            onGenerate={handleGenerate}
            onBack={() => setScreen('home')}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (screen === 'settings') {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={THEME.darkBrown} />
          <SettingsScreen
            fonts={FONTS}
            savedTrips={savedTrips}
            customAddons={customAddons}
            customIcons={customIcons}
            templateOverrides={templateOverrides}
            onSetIcon={handleSetIcon}
            onResetIcons={handleResetIcons}
            onClearTrips={handleClearTrips}
            onClearAddons={handleClearAddons}
            onResetTemplates={handleResetTemplates}
            onResetAll={handleResetAll}
            onSaveCustomAddon={handleSaveCustomAddon}
            onDeleteCustomAddon={handleDeleteCustomAddon}
            onOpenTemplateEditor={() => setScreen('templateEditor')}
            onBack={() => setScreen('home')}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (screen === 'templateEditor') {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={THEME.darkBrown} />
          <TemplateEditorScreen
            fonts={FONTS}
            templateOverrides={templateOverrides}
            customActivities={customActivities}
            hiddenActivities={hiddenActivities}
            onSaveOverride={handleSaveOverride}
            onToggleVisibility={handleToggleVisibility}
            onBack={() => setScreen('settings')}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (screen === 'checklist' && checklist) {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={THEME.darkBrown} />
          <ChecklistScreen
            checklist={checklist}
            setChecklist={handleChecklistChange}
            fonts={FONTS}
            customActivities={customActivities}
            customAddons={customAddons}
            customIcons={customIcons}
            onHome={() => setScreen('home')}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <StatusBar style="light" backgroundColor={THEME.darkBrown} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
});
