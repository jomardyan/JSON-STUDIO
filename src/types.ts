export type DataFormat =
  | 'json'
  | 'xml'
  | 'csv'
  | 'yaml'
  | 'toml'
  | 'sql'
  | 'html'
  | 'markdown'
  | 'urlencoded'
  | 'properties'
  | 'ts-interface'
  | 'ndjson'
  | 'python'
  | 'php';

export type OutputViewMode = 'code' | 'tree' | 'table';

export type IndentOption = '2' | '4' | 'tab';

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  position?: number;
}

export interface ValidationResult {
  valid: boolean;
  error: ValidationError | null;
  parsed: any | null;
}

export interface TransformationStats {
  inputBytes: number;
  outputBytes: number;
  inputLines: number;
  outputLines: number;
  compressionRatio: number; // percentage
  nodeCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  inputFormat: string;
  outputFormat: string;
  inputText: string;
  outputText: string;
  inputSizeBytes: number;
  outputSizeBytes: number;
  valid: boolean;
}

export interface CsvOptions {
  delimiter: ',' | ';' | '\t' | '|';
  header: boolean;
  flattenNested: boolean;
}

export interface XmlOptions {
  rootName: string;
  arrayNodeName: string;
  indent: string;
}

export interface SqlOptions {
  tableName: string;
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mssql';
  includeCreateTable: boolean;
  insertBatchSize: number;
  quoteIdentifiers: boolean;
  primaryKey?: string;
}

export interface UserPreferences {
  indent: IndentOption;
  csvOptions: CsvOptions;
  xmlOptions: XmlOptions;
  sqlOptions: SqlOptions;
  autoFormatOnPaste: boolean;
  autoSortKeysOnFormat: boolean;
  autoRepairOnPaste: boolean;
  language?: 'en' | 'pl' | 'de' | 'es' | 'fr';
}

export type Theme = 'light' | 'dark' | 'system';

