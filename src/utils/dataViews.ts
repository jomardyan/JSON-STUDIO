export type DataRow = Record<string, unknown>;

export function toTableRows(data: unknown): DataRow[] {
  const values = Array.isArray(data) ? data : data === undefined ? [] : [data];
  return values.map(value => value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as DataRow
    : { value });
}

export function displayCell(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function filterAndSortRows(rows: DataRow[], query: string, sort: { column: string; direction: 'asc' | 'desc' } | null) {
  const term = query.trim().toLocaleLowerCase();
  const result = rows.map((row, index) => ({ row, index })).filter(({ row }) =>
    !term || Object.values(row).some(value => displayCell(value).toLocaleLowerCase().includes(term)));
  if (sort) result.sort((a, b) => {
    const left = Object.hasOwn(a.row, sort.column) ? a.row[sort.column] : undefined;
    const right = Object.hasOwn(b.row, sort.column) ? b.row[sort.column] : undefined;
    // Missing values stay at the end in either direction.
    if (left == null || right == null) return left == null ? right == null ? a.index - b.index : 1 : -1;
    const order = typeof left === 'number' && typeof right === 'number'
      ? left - right : displayCell(left).localeCompare(displayCell(right), undefined, { numeric: true });
    return (sort.direction === 'asc' ? order : -order) || a.index - b.index;
  });
  return result;
}

export function childJsonPath(path: string, key: string, isArray: boolean): string {
  if (isArray) return `${path}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

/** Include matching values, their ancestors, and the descendants of matching keys. */
export function matchingTreePaths(data: unknown, query: string): Set<string> {
  const term = query.trim().toLocaleLowerCase();
  const paths = new Set<string>();
  const visit = (value: unknown, name: string, path: string, inherited: boolean): boolean => {
    const object = value !== null && typeof value === 'object';
    const ownMatch = inherited || name.toLocaleLowerCase().includes(term)
      || (!object && displayCell(value).toLocaleLowerCase().includes(term));
    let matched = ownMatch;
    if (object) for (const [key, child] of Object.entries(value)) {
      matched = visit(child, key, childJsonPath(path, key, Array.isArray(value)), ownMatch) || matched;
    }
    if (matched) paths.add(path);
    return matched;
  };
  visit(data, 'root', '$', false);
  return paths;
}
