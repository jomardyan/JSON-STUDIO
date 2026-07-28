import { HistoryItem, Theme, UserPreferences } from '../types';

const HISTORY_KEY = 'json_formatter_history_v1';
const THEME_KEY = 'json_formatter_theme_v1';
const PREFS_KEY = 'json_formatter_prefs_v1';

const DEFAULT_PREFS: UserPreferences = {
  indent: '2',
  language: 'en',
  csvOptions: {
    delimiter: ',',
    header: true,
    flattenNested: true,
  },
  xmlOptions: {
    rootName: 'root',
    arrayNodeName: 'item',
    indent: '  ',
  },
  sqlOptions: {
    tableName: 'records',
    dialect: 'mysql',
    includeCreateTable: true,
    insertBatchSize: 100,
    quoteIdentifiers: true,
    primaryKey: 'id',
  },
  autoFormatOnPaste: false,
  autoSortKeysOnFormat: false,
  autoRepairOnPaste: false,
};

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items: HistoryItem[] = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const prefs = getUserPreferences();
  const newItem: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  // If Private Session Mode is enabled, do NOT write payload to localStorage
  if (prefs.privateSessionMode) {
    return newItem;
  }

  const history = getHistory();

  // Avoid duplicate adjacent identical entries
  if (history.length > 0 && history[0].inputText === newItem.inputText && history[0].outputFormat === newItem.outputFormat) {
    return history[0];
  }

  // Prepend and limit to max 50 items
  const updated = [newItem, ...history].slice(0, 50);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getHistory().filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Failed to update localStorage:', err);
  }
  return history;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.warn('Failed to clear history from localStorage:', err);
  }
}

export function getSavedTheme(): Theme {
  try {
    const theme = localStorage.getItem(THEME_KEY) as Theme;
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
  } catch {
    // Ignore error
  }
  return 'dark'; // Default to sleek modern dark mode as requested
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.warn('Failed to save theme preference:', err);
  }
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_PREFS;
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Failed to save user preferences:', err);
  }
}
