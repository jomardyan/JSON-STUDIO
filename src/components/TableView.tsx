import React from 'react';
import { Search, Table as TableIcon, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { displayCell, filterAndSortRows, toTableRows } from '../utils/dataViews';

interface TableViewProps {
  data: unknown;
  searchQuery?: string;
}

const PAGE_SIZE = 50;

export const TableView: React.FC<TableViewProps> = ({ data, searchQuery = '' }) => {
  const [filterText, setFilterText] = React.useState(searchQuery);
  const [sort, setSort] = React.useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = React.useState(0);
  const [dataset, setDataset] = React.useState('');
  const arrays = React.useMemo(() => data !== null && typeof data === 'object' && !Array.isArray(data)
    ? Object.keys(data).filter(key => Array.isArray((data as Record<string, unknown>)[key])) : [], [data]);
  const selectedDataset = arrays.includes(dataset) ? dataset : arrays[0];
  const rows = React.useMemo(() => toTableRows(selectedDataset !== undefined
    ? (data as Record<string, unknown>)[selectedDataset] : data), [data, selectedDataset]);
  const columns = React.useMemo(() => Array.from(new Set(rows.flatMap(row => Object.keys(row)))), [rows]);
  const filtered = React.useMemo(() => filterAndSortRows(rows, filterText, sort), [rows, filterText, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;

  React.useEffect(() => { setFilterText(searchQuery); }, [searchQuery]);
  React.useEffect(() => { setPage(0); }, [data, filterText, sort, selectedDataset]);
  React.useEffect(() => { setSort(null); }, [data, selectedDataset]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs">
        {arrays.length > 1 && (
          <select aria-label="Table dataset" value={selectedDataset} onChange={e => setDataset(e.target.value)} className="min-w-0 max-w-40 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-2">
            {arrays.map(key => <option key={key} value={key}>{key}</option>)}
          </select>
        )}
        <div className="relative flex-1 min-w-32">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input aria-label="Search table rows" placeholder="Search all values, including nested data" value={filterText} onChange={e => setFilterText(e.target.value)} className="w-full pl-8 pr-8 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs" />
          {filterText && <button aria-label="Clear table search" onClick={() => setFilterText('')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5"><X className="w-3 h-3" /></button>}
        </div>
      </div>
      <div className="overflow-auto flex-1 min-h-0">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center gap-2"><TableIcon className="w-8 h-8" /><p>No tabular records found in dataset</p></div>
        ) : (
          <table aria-label="Output data" className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0 z-10">
              <tr><th scope="col" className="px-3 py-2 text-zinc-500">#</th>
                {columns.map(column => <th key={column} scope="col" aria-sort={sort?.column === column ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'} className="border-l border-zinc-200 dark:border-zinc-700">
                  <button onClick={() => setSort(previous => ({ column, direction: previous?.column === column && previous.direction === 'asc' ? 'desc' : 'asc' }))} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 font-mono whitespace-nowrap hover:bg-indigo-500/10" aria-label={`Sort by ${column}`}>
                    {column}<ArrowUpDown className={`w-3 h-3 shrink-0 ${sort?.column === column ? 'text-indigo-500' : 'text-zinc-400'}`} />
                  </button>
                </th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.slice(start, start + PAGE_SIZE).map(({ row, index }) => <tr key={index} className="even:bg-zinc-50/70 dark:even:bg-zinc-800/20 hover:bg-indigo-500/5">
                <td className="px-3 py-2 text-zinc-500 font-mono">{index + 1}</td>
                {columns.map(column => {
                  const value = Object.prototype.hasOwnProperty.call(row, column) ? row[column] : undefined;
                  const text = displayCell(value);
                  return <td key={column} title={text} className={`px-3 py-2 border-l border-zinc-100 dark:border-zinc-800 whitespace-nowrap max-w-xs truncate ${value == null ? 'text-zinc-400 italic' : typeof value === 'number' ? 'text-amber-700 dark:text-amber-400 font-mono' : 'text-zinc-700 dark:text-zinc-200'}`}>{text || (value === undefined ? '—' : '""')}</td>;
                })}
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan={columns.length + 1} className="p-8 text-center text-zinc-500">No rows match your search. Try another value or clear the filter.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
        <span role="status">{filtered.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} rows{filterText.trim() ? ` (${rows.length} total)` : ''}</span>
        <div className="flex items-center gap-2">
          <button aria-label="Previous table page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="p-1.5 border rounded-md border-zinc-300 dark:border-zinc-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span>{currentPage + 1} / {pageCount}</span>
          <button aria-label="Next table page" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)} className="p-1.5 border rounded-md border-zinc-300 dark:border-zinc-700 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
