import React from 'react';
import { Search, Table as TableIcon } from 'lucide-react';

interface TableViewProps {
  data: any;
  searchQuery?: string;
}

export const TableView: React.FC<TableViewProps> = ({ data, searchQuery = '' }) => {
  const [filterText, setFilterText] = React.useState(searchQuery);

  React.useEffect(() => {
    setFilterText(searchQuery);
  }, [searchQuery]);

  const rows: any[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
      const arrayProp = Object.values(data).find((val) => Array.isArray(val));
      if (arrayProp && Array.isArray(arrayProp)) return arrayProp;
      return [data];
    }
    return [{ value: data }];
  }, [data]);

  const columns = React.useMemo(() => {
    if (rows.length === 0) return [];
    const colSet = new Set<string>();
    rows.forEach((r) => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach((k) => colSet.add(k));
      } else {
        colSet.add('value');
      }
    });
    return Array.from(colSet);
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    if (!filterText.trim()) return rows;
    const lower = filterText.toLowerCase();
    return rows.filter((row) => {
      if (typeof row !== 'object' || row === null) {
        return String(row).toLowerCase().includes(lower);
      }
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      );
    });
  }, [rows, filterText]);

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
        <TableIcon className="w-8 h-8 opacity-40" />
        <p>No tabular records found in dataset</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search table rows..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
          Showing {filteredRows.length} of {rows.length} rows ({columns.length} columns)
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 w-10 text-center text-slate-400">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap font-mono text-[12px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 text-slate-400 text-center text-[11px] font-mono">
                  {idx + 1}
                </td>
                {columns.map((col) => {
                  const val = typeof row === 'object' && row !== null ? row[col] : row;
                  const displayVal =
                    val === null || val === undefined
                      ? ''
                      : typeof val === 'object'
                      ? JSON.stringify(val)
                      : String(val);

                  return (
                    <td
                      key={col}
                      className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap max-w-xs truncate text-slate-800 dark:text-slate-200"
                      title={displayVal}
                    >
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
