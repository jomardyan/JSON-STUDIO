export type SupportedLanguage = 'en' | 'pl' | 'de' | 'es' | 'fr';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  installApp: string;
  samples: string;
  history: string;
  settings: string;
  theme: string;
  
  // Toolbar
  formatJson: string;
  minifyJson: string;
  repairJson: string;
  sortKeys: string;
  escapeJson: string;
  unescapeJson: string;
  base64Encode: string;
  base64Decode: string;
  jsonSchema: string;
  moreTools: string;
  
  // Cross Converter
  universalConverter: string;
  from: string;
  to: string;
  convert: string;
  autoDeduct: string;
  autoDeductOn: string;
  autoDeductOff: string;

  // Editor
  input: string;
  output: string;
  codeView: string;
  treeView: string;
  tableView: string;
  paste: string;
  clear: string;
  copy: string;
  download: string;
  validFormat: string;
  invalidFormat: string;
  searchPlaceholder: string;
  noResults: string;

  // Stats
  inputSize: string;
  outputSize: string;
  lines: string;
  depth: string;
  nodes: string;
  compression: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  jsonIndent: string;
  spaces2: string;
  spaces4: string;
  tabIndent: string;
  csvDelimiter: string;
  xmlRootElement: string;
  sqlTableName: string;
  csvHeaderRow: string;
  csvHeaderDesc: string;
  autoSortKeys: string;
  autoSortKeysDesc: string;
  autoRepairOnPaste: string;
  autoRepairDesc: string;
  autoFormatOnPaste: string;
  autoFormatDesc: string;
  languageSelect: string;
  savePreferences: string;
  cancel: string;

  // History Drawer
  historyTitle: string;
  historySubtitle: string;
  searchHistory: string;
  clearAllHistory: string;
  noHistoryItems: string;
  restore: string;

  // Privacy Banner
  privacyTitle: string;
  privacyText: string;
  privacyAccept: string;

  // Changelog
  changelog: string;
  changelogTitle: string;
  changelogSubtitle: string;
  version: string;
  releaseNotes: string;

  // SQL Tools
  sqlConverterTool: string;
  sqlDialect: string;
  includeCreateTable: string;
  batchInsertSize: string;
  quoteIdentifiers: string;
  primaryKeyField: string;
  generateSqlScript: string;
  parseSqlToJson: string;

  // Footer & FAQ
  privacyGuaranteed: string;
  fastConversion: string;
  coreFormats: string;
  codeWeb: string;
  streamsConfig: string;
  keyFeatures: string;
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  openSource: string;
  clientSidePrivacy: string;
  home: string;
  allRightsReserved: string;

  // Footer Feature Lists
  fmtJsonRepair: string;
  fmtXmlSchema: string;
  fmtCsvTsv: string;
  fmtYamlConfig: string;
  fmtTomlConfig: string;

  cwTsInterfaces: string;
  cwSqlInserts: string;
  cwHtmlMdTables: string;
  cwPythonDict: string;
  cwPhpArray: string;

  scNdjson: string;
  scEnvProperties: string;
  scUrlQuery: string;
  scBase64Escaped: string;
  scJsonSchema: string;

  kfAutoRepair: string;
  kfKeySorting: string;
  kfSearchFilter: string;
  kfTreeTableViews: string;
  kfOfflineHistory: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'JSON Studio Pro',
    appSubtitle: 'Universal Multi-Format Data Converter',
    installApp: 'Install App',
    samples: 'Samples',
    history: 'History',
    settings: 'Preferences',
    theme: 'Theme',

    formatJson: 'Format',
    minifyJson: 'Minify',
    repairJson: 'Auto-Repair',
    sortKeys: 'Sort Keys',
    escapeJson: 'Escape',
    unescapeJson: 'Unescape',
    base64Encode: 'Base64 Enc',
    base64Decode: 'Base64 Dec',
    jsonSchema: 'JSON Schema',
    moreTools: 'More Tools',

    universalConverter: 'Universal Cross-Converter',
    from: 'From',
    to: 'To',
    convert: 'Convert',
    autoDeduct: 'Auto-Deduct',
    autoDeductOn: 'Auto-Deduct ON',
    autoDeductOff: 'Auto-Deduct OFF',

    input: 'Input',
    output: 'Output',
    codeView: 'Code',
    treeView: 'Tree',
    tableView: 'Table',
    paste: 'Paste',
    clear: 'Clear',
    copy: 'Copy',
    download: 'Download',
    validFormat: 'Valid Format',
    invalidFormat: 'Invalid Syntax',
    searchPlaceholder: 'Search keys & values...',
    noResults: 'No matching nodes found',

    inputSize: 'Input Size',
    outputSize: 'Output Size',
    lines: 'Lines',
    depth: 'Max Depth',
    nodes: 'Total Nodes',
    compression: 'Ratio',

    settingsTitle: 'Conversion Settings',
    settingsSubtitle: 'Formatting and export options',
    jsonIndent: 'JSON Indentation',
    spaces2: '2 Spaces',
    spaces4: '4 Spaces',
    tabIndent: 'Tab',
    csvDelimiter: 'CSV Field Delimiter',
    xmlRootElement: 'XML Root Element Name',
    sqlTableName: 'SQL Table Name',
    csvHeaderRow: 'CSV Header Row',
    csvHeaderDesc: 'Include column headers as first line',
    autoSortKeys: 'Auto-Sort Object Keys (A ➔ Z)',
    autoSortKeysDesc: 'Alphabetically sort keys whenever formatting',
    autoRepairOnPaste: 'Auto-Repair Syntax on Paste',
    autoRepairDesc: 'Fix unquoted keys, trailing commas automatically',
    autoFormatOnPaste: 'Auto-Format on Paste',
    autoFormatDesc: 'Automatically format JSON when pasted into input',
    languageSelect: 'Application Language',
    savePreferences: 'Save Preferences',
    cancel: 'Cancel',

    historyTitle: 'Conversion History',
    historySubtitle: 'Recent client-side format transformations',
    searchHistory: 'Search history...',
    clearAllHistory: 'Clear History',
    noHistoryItems: 'No conversion history found',
    restore: 'Restore',

    privacyTitle: 'We respect your privacy (100% Client-Side)',
    privacyText: 'JSON Studio runs entirely in your browser. We do not use tracking cookies, analytics, or upload your data to any server. LocalStorage is used strictly to save your settings and history locally on your device.',
    privacyAccept: 'I Understand',

    changelog: 'Changelog',
    changelogTitle: 'Changelog & Release Notes',
    changelogSubtitle: 'Track updates, new features, and improvements',
    version: 'Version',
    releaseNotes: 'Release Notes',

    sqlConverterTool: 'SQL Studio & Generator',
    sqlDialect: 'Database Dialect',
    includeCreateTable: 'Include CREATE TABLE DDL',
    batchInsertSize: 'Batch INSERT Rows',
    quoteIdentifiers: 'Quote Column Identifiers',
    primaryKeyField: 'Primary Key Field',
    generateSqlScript: 'Generate SQL Script',
    parseSqlToJson: 'Parse SQL to JSON',

    privacyGuaranteed: '100% Private Client-Side',
    fastConversion: 'Sub-Millisecond Speed',
    coreFormats: 'Core Formats',
    codeWeb: 'Code & Web',
    streamsConfig: 'Streams & Config',
    keyFeatures: 'Key Features',
    faqTitle: 'Frequently Asked Questions & Developer Tools (FAQ)',
    faq1Q: 'Is my JSON data safe when using studio.lolisoft.eu?',
    faq1A: 'Yes, 100%. All parsing, formatting, repair, validation, and multi-format conversions are processed strictly client-side inside your browser. No data or text is ever sent to any remote server.',
    faq2Q: 'How does JSON Auto-Repair fix broken syntax?',
    faq2A: 'Auto-Repair wraps unquoted object keys, replaces single quotes with double quotes, strips trailing commas, removes C/C++ style comments, and converts Python booleans (True, False, None) to valid JSON.',
    faq3Q: 'Which developer tools and format converters are included?',
    faq3A: 'JSON Studio Pro includes SQL Studio (DDL & Batch INSERTs), JSON Side-by-Side Diff, PII Masking, jq Query Playground, RFC 6902 Patch, OpenAPI & cURL spec generator, JWT Inspector, ER Graph, and Multi-Lang Code Models (TypeScript, Python, Go, Rust, C#, Swift, Dart).',
    openSource: 'Open Source',
    clientSidePrivacy: '100% Client-Side Privacy',
    home: 'Home',
    allRightsReserved: 'All rights reserved. Free Client-Side Web Application.',

    fmtJsonRepair: 'JSON (Formatter, Minifier, Repair)',
    fmtXmlSchema: 'XML Document Schema',
    fmtCsvTsv: 'CSV & TSV Spreadsheets',
    fmtYamlConfig: 'YAML Configuration',
    fmtTomlConfig: 'TOML Config Files',

    cwTsInterfaces: 'TypeScript Interfaces',
    cwSqlInserts: 'SQL INSERT Batches',
    cwHtmlMdTables: 'HTML & Markdown Tables',
    cwPythonDict: 'Python Dict Literals',
    cwPhpArray: 'PHP Array Syntax',

    scNdjson: 'NDJSON / JSON Lines',
    scEnvProperties: '.env / Java Properties',
    scUrlQuery: 'URL Query Strings',
    scBase64Escaped: 'Base64 & Escaped JSON',
    scJsonSchema: 'JSON Schema (Draft-07)',

    kfAutoRepair: 'Auto-Repair JSON Syntax',
    kfKeySorting: 'Key Sorting (A-Z & Z-A)',
    kfSearchFilter: 'Key-Value Search & Filter',
    kfTreeTableViews: 'Interactive Tree & Table View',
    kfOfflineHistory: 'Offline Local Storage History',
  },
  pl: {
    appName: 'JSON Studio Pro',
    appSubtitle: 'Uniwersalny Konwerter Danych Wieloformatowy',
    installApp: 'Zainstaluj aplikację',
    samples: 'Przykłady',
    history: 'Historia',
    settings: 'Ustawienia',
    theme: 'Motyw',

    formatJson: 'Formatuj',
    minifyJson: 'Minifikuj',
    repairJson: 'Napraw automatycznie',
    sortKeys: 'Sortuj klucze',
    escapeJson: 'Kreskuj (Escape)',
    unescapeJson: 'Odkreskuj (Unescape)',
    base64Encode: 'Koduj Base64',
    base64Decode: 'Dekoduj Base64',
    jsonSchema: 'Schemat JSON',
    moreTools: 'Więcej narzędzi',

    universalConverter: 'Uniwersalny Konwerter Formatów',
    from: 'Z',
    to: 'Na',
    convert: 'Konwertuj',
    autoDeduct: 'Auto-wykrywanie',
    autoDeductOn: 'Auto-wykrywanie WŁ',
    autoDeductOff: 'Auto-wykrywanie WYŁ',

    input: 'Wejście',
    output: 'Wyjście',
    codeView: 'Kod',
    treeView: 'Drzewo',
    tableView: 'Tabela',
    paste: 'Wklej',
    clear: 'Wyczyść',
    copy: 'Kopiuj',
    download: 'Pobierz',
    validFormat: 'Prawidłowy format',
    invalidFormat: 'Błąd składni',
    searchPlaceholder: 'Szukaj kluczy i wartości...',
    noResults: 'Nie znaleziono pasujących elementów',

    inputSize: 'Rozmiar wejściowy',
    outputSize: 'Rozmiar wyjściowy',
    lines: 'Liczba linii',
    depth: 'Głębokość max',
    nodes: 'Wszystkie węzły',
    compression: 'Stopień kompresji',

    settingsTitle: 'Ustawienia Konwersji',
    settingsSubtitle: 'Opcje formatowania i eksportu',
    jsonIndent: 'Wcięcia w JSON',
    spaces2: '2 Spacje',
    spaces4: '4 Spacje',
    tabIndent: 'Tabulator',
    csvDelimiter: 'Separator pól CSV',
    xmlRootElement: 'Nazwa elementu głównego XML',
    sqlTableName: 'Nazwa tabeli SQL',
    csvHeaderRow: 'Nagłówek w CSV',
    csvHeaderDesc: 'Dołącz nazwy kolumn w pierwszym wierszu',
    autoSortKeys: 'Auto-sortowanie kluczy (A ➔ Z)',
    autoSortKeysDesc: 'Sortuj klucze alfabetycznie podczas formatowania',
    autoRepairOnPaste: 'Naprawiaj błędy przy wklejaniu',
    autoRepairDesc: 'Automatycznie poprawiaj brakujące cudzysłowy i przecinki',
    autoFormatOnPaste: 'Auto-formatowanie przy wklejaniu',
    autoFormatDesc: 'Formatuj JSON automatycznie po wklejeniu do pola',
    languageSelect: 'Język aplikacji',
    savePreferences: 'Zapisz ustawienia',
    cancel: 'Anuluj',

    historyTitle: 'Historia Konwersji',
    historySubtitle: 'Ostatnie konwersje formatów w przeglądarce',
    searchHistory: 'Szukaj w historii...',
    clearAllHistory: 'Wyczyść historię',
    noHistoryItems: 'Brak historii konwersji',
    restore: 'Przywróć',

    privacyTitle: 'Szanujemy Twoją prywatność (100% lokalnie w przeglądarce)',
    privacyText: 'JSON Studio działa w 100% w Twojej przeglądarce. Nie używamy śledzących plików cookie ani analityki, a Twoje dane nigdy nie są wysyłane na żaden serwer. Pamięć lokalna (LocalStorage) służy wyłącznie do zapisywania preferencji i historii.',
    privacyAccept: 'Rozumiem',

    changelog: 'Lista Zmian',
    changelogTitle: 'Dziennik Zmian i Aktualizacji',
    changelogSubtitle: 'Śledź nowe funkcje, konwersje i ulepszenia',
    version: 'Wersja',
    releaseNotes: 'Notatki o Wydaniu',

    sqlConverterTool: 'SQL Studio i Generator',
    sqlDialect: 'Dialekt Bazy Danych',
    includeCreateTable: 'Dołącz instrukcję CREATE TABLE',
    batchInsertSize: 'Rozmiar Partii INSERT',
    quoteIdentifiers: 'Cudzysłowy Identyfikatorów',
    primaryKeyField: 'Pole Klucza Głównego',
    generateSqlScript: 'Generuj Skrypt SQL',
    parseSqlToJson: 'Konwertuj SQL na JSON',

    privacyGuaranteed: '100% Prywatności Lokalnie',
    fastConversion: 'Szybkość podmilisekundowa',
    coreFormats: 'Główne Formaty',
    codeWeb: 'Kod i Sieć',
    streamsConfig: 'Strumienie i Konfiguracja',
    keyFeatures: 'Kluczowe Funkcje',
    faqTitle: 'Często Zadawane Pytania i Narzędzia (FAQ)',
    faq1Q: 'Czy moje dane JSON są bezpieczne i prywatne na studio.lolisoft.eu?',
    faq1A: 'Tak, w 100%. Całe przetwarzanie, formatowanie, naprawa, walidacja i konwersje formatów odbywają się wyłącznie w Twojej przeglądarce za pomocą JavaScript. Żadne dane nie są wysyłane do serwerów zewnętrznych.',
    faq2Q: 'Jak działa automatyczna naprawa składni JSON?',
    faq2A: 'Auto-Repair dodaje brakujące cudzysłowy wokół kluczy, zamienia pojedyncze cudzysłowy na podwójne, usuwa zbędne przecinki i komentarze C/C++ oraz normalizuje wartości logiczne Pythona (True, False, None).',
    faq3Q: 'Jakie narzędzia programistyczne i konwertery są dołączone?',
    faq3A: 'JSON Studio Pro zawiera SQL Studio (DDL i INSERTy), Porównywarkę JSON Diff, Maskowanie PII, Playground jq, JSON Patch RFC 6902, Generator OpenAPI & cURL, Inspektor JWT, Wykres ER oraz Modele Kodu (TypeScript, Python, Go, Rust, C#, Swift, Dart).',
    openSource: 'Otwarty Kod (Open Source)',
    clientSidePrivacy: '100% Prywatności w Przeglądarce',
    home: 'Strona Główna',
    allRightsReserved: 'Wszelkie prawa zastrzeżone. Darmowa Aplikacja Internetowa.',

    fmtJsonRepair: 'JSON (Formatowanie, Minifikacja, Naprawa)',
    fmtXmlSchema: 'Schematy Dokumentów XML',
    fmtCsvTsv: 'Arkusze CSV i TSV',
    fmtYamlConfig: 'Konfiguracja YAML',
    fmtTomlConfig: 'Pliki Konfiguracyjne TOML',

    cwTsInterfaces: 'Interfejsy TypeScript',
    cwSqlInserts: 'Skrypty INSERT SQL',
    cwHtmlMdTables: 'Tabele HTML i Markdown',
    cwPythonDict: 'Słowniki Pythona (Dict)',
    cwPhpArray: 'Składnia Tablic PHP',

    scNdjson: 'NDJSON / JSON Lines',
    scEnvProperties: 'Pliki .env / Java Properties',
    scUrlQuery: 'Ciągi Zapytania URL Query',
    scBase64Escaped: 'Base64 i Escaped JSON',
    scJsonSchema: 'JSON Schema (Draft-07)',

    kfAutoRepair: 'Automatyczna Naprawa Składni JSON',
    kfKeySorting: 'Sortowanie Kluczy (A-Z i Z-A)',
    kfSearchFilter: 'Wyszukiwanie i Filtrowanie Kluczy/Wartości',
    kfTreeTableViews: 'Interaktywny Widok Drzewa i Tabeli',
    kfOfflineHistory: 'Lokalna Historia w Pamięci Przeglądarki',
  },
  de: {
    appName: 'JSON Studio Pro',
    appSubtitle: 'Universeller Multi-Format Datenkonverter',
    installApp: 'App installieren',
    samples: 'Beispiele',
    history: 'Verlauf',
    settings: 'Einstellungen',
    theme: 'Design',

    formatJson: 'Formatieren',
    minifyJson: 'Minimieren',
    repairJson: 'Auto-Reparatur',
    sortKeys: 'Schlüssel sortieren',
    escapeJson: 'Escapen',
    unescapeJson: 'Unescapen',
    base64Encode: 'Base64 Enc',
    base64Decode: 'Base64 Dec',
    jsonSchema: 'JSON Schema',
    moreTools: 'Mehr Werkzeuge',

    universalConverter: 'Universeller Formatkonverter',
    from: 'Von',
    to: 'Nach',
    convert: 'Konvertieren',
    autoDeduct: 'Auto-Erkennung',
    autoDeductOn: 'Auto-Erkennung AN',
    autoDeductOff: 'Auto-Erkennung AUS',

    input: 'Eingabe',
    output: 'Ausgabe',
    codeView: 'Code',
    treeView: 'Baum',
    tableView: 'Tabelle',
    paste: 'Einfügen',
    clear: 'Löschen',
    copy: 'Kopieren',
    download: 'Herunterladen',
    validFormat: 'Gültiges Format',
    invalidFormat: 'Syntaxfehler',
    searchPlaceholder: 'Schlüssel & Werte suchen...',
    noResults: 'Keine Ergebnisse gefunden',

    inputSize: 'Eingabegröße',
    outputSize: 'Ausgabegröße',
    lines: 'Zeilen',
    depth: 'Max. Tiefe',
    nodes: 'Knoten gesamt',
    compression: 'Komprimierung',

    settingsTitle: 'Konvertierungseinstellungen',
    settingsSubtitle: 'Formatierungs- und Exportoptionen',
    jsonIndent: 'JSON-Einrückung',
    spaces2: '2 Leerzeichen',
    spaces4: '4 Leerzeichen',
    tabIndent: 'Tabulator',
    csvDelimiter: 'CSV-Trennzeichen',
    xmlRootElement: 'XML-Wurzelelement',
    sqlTableName: 'SQL-Tabellenname',
    csvHeaderRow: 'CSV-Kopfzeile',
    csvHeaderDesc: 'Spaltenüberschriften in erster Zeile',
    autoSortKeys: 'Schlüssel sortieren (A ➔ Z)',
    autoSortKeysDesc: 'Schlüssel alphabetisch beim Formatieren sortieren',
    autoRepairOnPaste: 'Auto-Reparatur beim Einfügen',
    autoRepairDesc: 'Fehlende Anführungszeichen & Kommas automatisch korrigieren',
    autoFormatOnPaste: 'Auto-Formatierung beim Einfügen',
    autoFormatDesc: 'JSON automatisch beim Einfügen formatieren',
    languageSelect: 'Anwendungssprache',
    savePreferences: 'Einstellungen speichern',
    cancel: 'Abbrechen',

    historyTitle: 'Konvertierungsverlauf',
    historySubtitle: 'Neueste lokale Formatkonvertierungen',
    searchHistory: 'Verlauf durchsuchen...',
    clearAllHistory: 'Verlauf löschen',
    noHistoryItems: 'Kein Verlauf gefunden',
    restore: 'Wiederherstellen',

    privacyTitle: 'Datenschutzgarantie (100% Lokal)',
    privacyText: 'JSON Studio läuft komplett in Ihrem Browser. Es werden keine Tracking-Cookies oder Analysen verwendet und keine Daten an Server übertragen.',
    privacyAccept: 'Verstanden',

    changelog: 'Änderungsprotokoll',
    changelogTitle: 'Änderungsprotokoll & Versionshinweise',
    changelogSubtitle: 'Verfolgen Sie neue Funktionen und Updates',
    version: 'Version',
    releaseNotes: 'Versionshinweise',

    sqlConverterTool: 'SQL Studio & Generator',
    sqlDialect: 'Datenbank-Dialekt',
    includeCreateTable: 'CREATE TABLE DDL einschließen',
    batchInsertSize: 'Batch-INSERT-Zeilen',
    quoteIdentifiers: 'Bezeichner anführen',
    primaryKeyField: 'Primärschlüssel-Feld',
    generateSqlScript: 'SQL-Skript generieren',
    parseSqlToJson: 'SQL zu JSON parsen',

    privacyGuaranteed: '100% Privatsphäre im Browser',
    fastConversion: 'Höchste Geschwindigkeit',
    coreFormats: 'Kernformate',
    codeWeb: 'Code & Web',
    streamsConfig: 'Streams & Konfiguration',
    keyFeatures: 'Hauptfunktionen',
    faqTitle: 'Häufig gestellte Fragen & Entwickler-Werkzeuge (FAQ)',
    faq1Q: 'Sind meine JSON-Daten bei studio.lolisoft.eu sicher?',
    faq1A: 'Ja, zu 100%. Alle Verarbeitungen, Formatierungen, Reparaturen und Konvertierungen finden lokal in Ihrem Browser statt. Es werden keine Daten an Server übertragen.',
    faq2Q: 'Wie funktioniert die automatische JSON-Reparatur?',
    faq2A: 'Die Auto-Reparatur korrigiert fehlende Anführungszeichen um Schlüssel, ersetzt einfache Anführungszeichen, entfernt überflüssige Kommas und C-Kommentare und konvertiert Python-Booleans (True, False, None).',
    faq3Q: 'Welche Entwicklerwerkzeuge und Konverter sind enthalten?',
    faq3A: 'JSON Studio Pro enthält SQL Studio (DDL & INSERTs), JSON-Diff-Vergleich, PII-Maskierung, jq Query Playground, RFC 6902 Patch, OpenAPI & cURL Spec Generator, JWT Inspector, ER-Graph und Code-Generatoren.',
    openSource: 'Open Source',
    clientSidePrivacy: '100% Lokaler Datenschutz',
    home: 'Startseite',
    allRightsReserved: 'Alle Rechte vorbehalten. Kostenlose Webanwendung.',

    fmtJsonRepair: 'JSON (Formatierung, Minifizierung, Reparatur)',
    fmtXmlSchema: 'XML-Dokumentenschema',
    fmtCsvTsv: 'CSV & TSV Tabellen',
    fmtYamlConfig: 'YAML-Konfiguration',
    fmtTomlConfig: 'TOML-Konfigurationsdateien',

    cwTsInterfaces: 'TypeScript-Schnittstellen',
    cwSqlInserts: 'SQL-INSERT-Batches',
    cwHtmlMdTables: 'HTML- & Markdown-Tabellen',
    cwPythonDict: 'Python-Dict-Literale',
    cwPhpArray: 'PHP-Array-Syntax',

    scNdjson: 'NDJSON / JSON Lines',
    scEnvProperties: '.env / Java Properties',
    scUrlQuery: 'URL-Abfragezeichenfolgen',
    scBase64Escaped: 'Base64 & Escaped JSON',
    scJsonSchema: 'JSON Schema (Draft-07)',

    kfAutoRepair: 'Automatische JSON-Syntax-Reparatur',
    kfKeySorting: 'Schlüsselsortierung (A-Z & Z-A)',
    kfSearchFilter: 'Schlüssel-Wert-Suche & Filter',
    kfTreeTableViews: 'Interaktive Baum- & Tabellenansicht',
    kfOfflineHistory: 'Offline-Verlauf im lokalen Speicher',
  },
  es: {
    appName: 'JSON Studio Pro',
    appSubtitle: 'Convertidor de datos multiformato universal',
    installApp: 'Instalar App',
    samples: 'Ejemplos',
    history: 'Historial',
    settings: 'Preferencias',
    theme: 'Tema',

    formatJson: 'Formatear',
    minifyJson: 'Minificar',
    repairJson: 'Auto-Reparar',
    sortKeys: 'Ordenar claves',
    escapeJson: 'Escapar',
    unescapeJson: 'Desescapar',
    base64Encode: 'Codificar B64',
    base64Decode: 'Decodificar B64',
    jsonSchema: 'Esquema JSON',
    moreTools: 'Más herramientas',

    universalConverter: 'Convertidor Universal de Formatos',
    from: 'De',
    to: 'A',
    convert: 'Convertir',
    autoDeduct: 'Auto-Deducir',
    autoDeductOn: 'Auto-Deducir ON',
    autoDeductOff: 'Auto-Deducir OFF',

    input: 'Entrada',
    output: 'Salida',
    codeView: 'Código',
    treeView: 'Árbol',
    tableView: 'Tabla',
    paste: 'Pegar',
    clear: 'Limpiar',
    copy: 'Copiar',
    download: 'Descargar',
    validFormat: 'Formato válido',
    invalidFormat: 'Sintaxis inválida',
    searchPlaceholder: 'Buscar claves y valores...',
    noResults: 'No se encontraron resultados',

    inputSize: 'Tamaño entrada',
    outputSize: 'Tamaño salida',
    lines: 'Líneas',
    depth: 'Profundidad máx',
    nodes: 'Nodos totales',
    compression: 'Compresión',

    settingsTitle: 'Ajustes de Conversión',
    settingsSubtitle: 'Opciones de formato y exportación',
    jsonIndent: 'Sangría JSON',
    spaces2: '2 Espacios',
    spaces4: '4 Espacios',
    tabIndent: 'Tabulación',
    csvDelimiter: 'Delimitador CSV',
    xmlRootElement: 'Elemento raíz XML',
    sqlTableName: 'Nombre de tabla SQL',
    csvHeaderRow: 'Encabezado CSV',
    csvHeaderDesc: 'Incluir nombres de columnas en la primera línea',
    autoSortKeys: 'Ordenar claves (A ➔ Z)',
    autoSortKeysDesc: 'Ordenar alfabéticamente al formatear',
    autoRepairOnPaste: 'Auto-reparar al pegar',
    autoRepairDesc: 'Corregir comillas y comas automáticamente',
    autoFormatOnPaste: 'Auto-formatear al pegar',
    autoFormatDesc: 'Formatear JSON automáticamente al pegar',
    languageSelect: 'Idioma de la aplicación',
    savePreferences: 'Guardar preferencias',
    cancel: 'Cancelar',

    historyTitle: 'Historial de Conversión',
    historySubtitle: 'Transformaciones recientes en el navegador',
    searchHistory: 'Buscar en el historial...',
    clearAllHistory: 'Borrar historial',
    noHistoryItems: 'Historial vacío',
    restore: 'Restaurar',

    privacyTitle: 'Respetamos tu privacidad (100% Local)',
    privacyText: 'JSON Studio se ejecuta totalmente en tu navegador. Sin cookies de rastreo ni envíos a servidores.',
    privacyAccept: 'Entendido',

    changelog: 'Historial de Cambios',
    changelogTitle: 'Notas de la Versión y Cambios',
    changelogSubtitle: 'Rastrea nuevas funciones y actualizaciones',
    version: 'Versión',
    releaseNotes: 'Notas del Lanzamiento',

    sqlConverterTool: 'SQL Studio y Generador',
    sqlDialect: 'Dialecto de Base de Datos',
    includeCreateTable: 'Incluir instrucción CREATE TABLE',
    batchInsertSize: 'Filas INSERT por Lote',
    quoteIdentifiers: 'Entrecomillar Identificadores',
    primaryKeyField: 'Campo de Clave Primaria',
    generateSqlScript: 'Generar Script SQL',
    parseSqlToJson: 'Convertir SQL a JSON',

    privacyGuaranteed: '100% Privado en tu navegador',
    fastConversion: 'Velocidad ultra rápida',
    coreFormats: 'Formatos Principales',
    codeWeb: 'Código y Web',
    streamsConfig: 'Flujos y Configuración',
    keyFeatures: 'Funciones Clave',
    faqTitle: 'Preguntas Frecuentes y Herramientas para Desarrolladores (FAQ)',
    faq1Q: '¿Mis datos JSON están seguros al usar studio.lolisoft.eu?',
    faq1A: 'Sí, al 100%. Todo el procesamiento, formateo, reparación, validación y conversión se realiza estrictamente en tu navegador. Ningún dato se envía a un servidor remoto.',
    faq2Q: '¿Cómo funciona la Auto-Reparación de JSON?',
    faq2A: 'Auto-Reparar añade comillas faltantes a las claves, reemplaza comillas simples por dobles, elimina comas sobrantes y comentarios C/C++, y normaliza booleanos de Python (True, False, None).',
    faq3Q: '¿Qué herramientas para desarrolladores y convertidores se incluyen?',
    faq3A: 'JSON Studio Pro incluye SQL Studio (DDL e INSERTs), Comparador JSON Diff, Enmascaramiento PII, Playground jq, JSON Patch RFC 6902, Generador OpenAPI y cURL, Inspector JWT, Gráfico ER y Modelos de Código.',
    openSource: 'Código Abierto (Open Source)',
    clientSidePrivacy: '100% Privacidad en el Navegador',
    home: 'Inicio',
    allRightsReserved: 'Todos los derechos reservados. Aplicación web gratuita.',

    fmtJsonRepair: 'JSON (Formateador, Minificador, Reparador)',
    fmtXmlSchema: 'Esquema de Documento XML',
    fmtCsvTsv: 'Hojas de Cálculo CSV y TSV',
    fmtYamlConfig: 'Configuración YAML',
    fmtTomlConfig: 'Archivos de Configuración TOML',

    cwTsInterfaces: 'Interfaces de TypeScript',
    cwSqlInserts: 'Lotes INSERT de SQL',
    cwHtmlMdTables: 'Tablas HTML y Markdown',
    cwPythonDict: 'Literales Dict de Python',
    cwPhpArray: 'Sintaxis de Array PHP',

    scNdjson: 'NDJSON / JSON Lines',
    scEnvProperties: 'Archivos .env / Java Properties',
    scUrlQuery: 'Cadenas de Consulta URL Query',
    scBase64Escaped: 'Base64 y JSON Escapado',
    scJsonSchema: 'JSON Schema (Draft-07)',

    kfAutoRepair: 'Auto-Reparación de Sintaxis JSON',
    kfKeySorting: 'Ordenación de Claves (A-Z y Z-A)',
    kfSearchFilter: 'Búsqueda y Filtro de Clave-Valor',
    kfTreeTableViews: 'Vista Interactiva en Árbol y Tabla',
    kfOfflineHistory: 'Historial Local sin Conexión',
  },
  fr: {
    appName: 'JSON Studio Pro',
    appSubtitle: 'Convertisseur de données multi-formats universel',
    installApp: 'Installer l\'App',
    samples: 'Exemples',
    history: 'Historique',
    settings: 'Préférences',
    theme: 'Thème',

    formatJson: 'Formater',
    minifyJson: 'Minifier',
    repairJson: 'Auto-Réparer',
    sortKeys: 'Trier clés',
    escapeJson: 'Échapper',
    unescapeJson: 'Déséchapper',
    base64Encode: 'Encoder B64',
    base64Decode: 'Décoder B64',
    jsonSchema: 'Schéma JSON',
    moreTools: 'Plus d\'outils',

    universalConverter: 'Convertisseur de Formats Universel',
    from: 'De',
    to: 'Vers',
    convert: 'Convertir',
    autoDeduct: 'Auto-Déduction',
    autoDeductOn: 'Auto-Déduction ON',
    autoDeductOff: 'Auto-Déduction OFF',

    input: 'Entrée',
    output: 'Sortie',
    codeView: 'Code',
    treeView: 'Arbre',
    tableView: 'Tableau',
    paste: 'Coller',
    clear: 'Effacer',
    copy: 'Copier',
    download: 'Télécharger',
    validFormat: 'Format valide',
    invalidFormat: 'Erreur de syntaxe',
    searchPlaceholder: 'Rechercher clés & valeurs...',
    noResults: 'Aucun résultat trouvé',

    inputSize: 'Taille entrée',
    outputSize: 'Taille sortie',
    lines: 'Lignes',
    depth: 'Profondeur max',
    nodes: 'Nœuds totaux',
    compression: 'Ratio',

    settingsTitle: 'Paramètres de Conversion',
    settingsSubtitle: 'Options de formatage et d\'exportation',
    jsonIndent: 'Indentation JSON',
    spaces2: '2 Espaces',
    spaces4: '4 Espaces',
    tabIndent: 'Tabulation',
    csvDelimiter: 'Délimiteur CSV',
    xmlRootElement: 'Élément racine XML',
    sqlTableName: 'Nom de table SQL',
    csvHeaderRow: 'En-tête CSV',
    csvHeaderDesc: 'Inclure les noms de colonnes',
    autoSortKeys: 'Trier les clés (A ➔ Z)',
    autoSortKeysDesc: 'Trier par ordre alphabétique au formatage',
    autoRepairOnPaste: 'Auto-réparer au collage',
    autoRepairDesc: 'Corriger les guillemets et virgules manquants',
    autoFormatOnPaste: 'Auto-formater au collage',
    autoFormatDesc: 'Formater automatiquement au collage',
    languageSelect: 'Langue de l\'application',
    savePreferences: 'Enregistrer',
    cancel: 'Annuler',

    historyTitle: 'Historique de Conversion',
    historySubtitle: 'Dernières conversions locales',
    searchHistory: 'Rechercher dans l\'historique...',
    clearAllHistory: 'Effacer l\'historique',
    noHistoryItems: 'Aucun historique',
    restore: 'Restaurer',

    privacyTitle: 'Vie privée garantie (100% Local)',
    privacyText: 'JSON Studio s\'exécute entièrement dans votre navigateur. Aucune donnée envoyée au serveur.',
    privacyAccept: 'J\'ai compris',

    changelog: 'Notes de Version',
    changelogTitle: 'Journal des Modifications',
    changelogSubtitle: 'Suivez les nouveautés et améliorations',
    version: 'Version',
    releaseNotes: 'Notes de Version',

    sqlConverterTool: 'SQL Studio & Générateur',
    sqlDialect: 'SGBD Dialecte',
    includeCreateTable: 'Inclure DDL CREATE TABLE',
    batchInsertSize: 'Lignes INSERT par Lot',
    quoteIdentifiers: 'Guillemets pour Identifiants',
    primaryKeyField: 'Champ Clé Primaire',
    generateSqlScript: 'Générer Script SQL',
    parseSqlToJson: 'Convertir SQL en JSON',

    privacyGuaranteed: '100% Privé localement',
    fastConversion: 'Vitesse instantanée',
    coreFormats: 'Formats Principaux',
    codeWeb: 'Code & Web',
    streamsConfig: 'Flux & Configuration',
    keyFeatures: 'Fonctionnalités Clés',
    faqTitle: 'Foire Aux Questions & Outils Développeur (FAQ)',
    faq1Q: 'Mes données JSON sont-elles sécurisées sur studio.lolisoft.eu ?',
    faq1A: 'Oui, à 100%. Tout le traitement, le formatage, la réparation, la validation et les conversions sont exécutés localement dans votre navigateur. Aucune donnée n\'est envoyée à un serveur externe.',
    faq2Q: 'Comment fonctionne l\'auto-réparation de syntaxe JSON ?',
    faq2A: 'L\'auto-réparation entoure les clés non citées de guillemets, remplace les guillemets simples, supprime les virgules superflues et les commentaires C/C++, et convertit les booléens Python (True, False, None).',
    faq3Q: 'Quels outils développeur et convertisseurs sont inclus ?',
    faq3A: 'JSON Studio Pro inclut SQL Studio (DDL & INSERTs), Comparateur JSON Diff, Masquage PII, Playground jq, JSON Patch RFC 6902, Générateur OpenAPI & cURL, Inspecteur JWT, Graphe ER et Modèles de Code.',
    openSource: 'Open Source',
    clientSidePrivacy: '100% Confidentialité Locale',
    home: 'Accueil',
    allRightsReserved: 'Tous droits réservés. Application web gratuite.',

    fmtJsonRepair: 'JSON (Formatage, Minification, Réparation)',
    fmtXmlSchema: 'Schéma de Document XML',
    fmtCsvTsv: 'Feuilles de Calcul CSV & TSV',
    fmtYamlConfig: 'Configuration YAML',
    fmtTomlConfig: 'Fichiers de Config TOML',

    cwTsInterfaces: 'Interfaces TypeScript',
    cwSqlInserts: 'Lots INSERT SQL',
    cwHtmlMdTables: 'Tableaux HTML & Markdown',
    cwPythonDict: 'Dictionnaires Python',
    cwPhpArray: 'Syntaxe de Tableau PHP',

    scNdjson: 'NDJSON / JSON Lines',
    scEnvProperties: 'Fichiers .env / Java Properties',
    scUrlQuery: 'Chaînes de Requête URL Query',
    scBase64Escaped: 'Base64 & JSON Échappé',
    scJsonSchema: 'JSON Schema (Draft-07)',

    kfAutoRepair: 'Auto-Réparation de Syntaxe JSON',
    kfKeySorting: 'Tri des Clés (A-Z & Z-A)',
    kfSearchFilter: 'Recherche & Filtre Clé-Valeur',
    kfTreeTableViews: 'Vue Arborescente & Tableau Interactive',
    kfOfflineHistory: 'Historique Local Hors-Ligne',
  },
};

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationDictionary {
  return translations[lang] || translations.en;
}
