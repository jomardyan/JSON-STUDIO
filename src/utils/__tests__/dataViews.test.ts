import { describe, expect, it } from 'vitest';
import { childJsonPath, displayCell, filterAndSortRows, matchingTreePaths, toTableRows } from '../dataViews';

describe('table data browsing', () => {
  it('preserves false, zero, null, and mixed primitive rows', () => {
    expect(toTableRows(false)).toEqual([{ value: false }]);
    expect(toTableRows(0)).toEqual([{ value: 0 }]);
    expect(toTableRows(null)).toEqual([{ value: null }]);
    expect(toTableRows([false, 0, null, { name: 'Ada' }, ['nested']])).toEqual([
      { value: false }, { value: 0 }, { value: null }, { name: 'Ada' }, { value: ['nested'] },
    ]);
    expect(displayCell(null)).toBe('null');
    expect(displayCell(undefined)).toBe('');
  });

  it('finds nested values and keeps the original row numbers', () => {
    const rows = toTableRows([{ id: 1, profile: { city: 'Paris' } }, { id: 2, profile: { city: 'Warsaw' } }]);
    expect(filterAndSortRows(rows, ' warsaw ', null)).toEqual([{ row: rows[1], index: 1 }]);
  });

  it('sorts numbers numerically and keeps absent values at the end without mutating input', () => {
    const rows = toTableRows([{ price: 20 }, { price: null }, { price: 3 }, {}]);
    expect(filterAndSortRows(rows, '', { column: 'price', direction: 'asc' }).map(item => item.index)).toEqual([2, 0, 1, 3]);
    expect(filterAndSortRows(rows, '', { column: 'price', direction: 'desc' }).map(item => item.index)).toEqual([0, 2, 1, 3]);
    expect(rows[0].price).toBe(20);
  });
});

describe('tree browsing', () => {
  it('keeps matching descendants and ancestors while hiding unrelated branches', () => {
    const data = { users: [{ profile: { city: 'Warsaw' } }], unrelated: { city: 'Paris' } };
    expect([...matchingTreePaths(data, 'warsaw')].sort()).toEqual(['$', '$.users', '$.users[0]', '$.users[0].profile', '$.users[0].profile.city'].sort());
    expect(matchingTreePaths(data, 'not-found').size).toBe(0);
  });

  it('shows a matching key with its complete subtree', () => {
    expect(matchingTreePaths({ users: [{ name: 'Ada' }] }, 'users').has('$.users[0].name')).toBe(true);
  });

  it('quotes special keys so copied paths are unambiguous', () => {
    expect(childJsonPath('$', 'a.b', false)).toBe('$["a.b"]');
    expect(childJsonPath('$', 'a"b', false)).toBe('$["a\\"b"]');
    expect(childJsonPath('$', '', false)).toBe('$[""]');
    expect(childJsonPath('$.users', '0', true)).toBe('$.users[0]');
  });
});
