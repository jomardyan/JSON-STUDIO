import React from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Search, Maximize2, Minimize2, X } from 'lucide-react';
import { childJsonPath, matchingTreePaths } from '../utils/dataViews';

interface TreeViewProps {
  data: unknown;
  searchQuery?: string;
  onCopyPath?: (path: string) => void;
}

type Expansion = { open: boolean; revision: number } | null;

export const TreeView: React.FC<TreeViewProps> = ({ data, searchQuery = '', onCopyPath }) => {
  const [expansion, setExpansion] = React.useState<Expansion>(null);
  const [filterText, setFilterText] = React.useState(searchQuery);
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);
  const [copyError, setCopyError] = React.useState('');
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const matches = React.useMemo(() => filterText.trim() ? matchingTreePaths(data, filterText) : null, [data, filterText]);
  React.useEffect(() => { setFilterText(searchQuery); }, [searchQuery]);
  React.useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const handleCopyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopyError('');
      setCopiedPath(path);
      onCopyPath?.(path);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      setCopyError('Clipboard access was blocked. Allow clipboard access and try again.');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="relative flex-1 min-w-32">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input aria-label="Search tree keys or values" placeholder="Search keys or values" value={filterText} onChange={e => setFilterText(e.target.value)} className="w-full pl-8 pr-8 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs" />
          {filterText && <button aria-label="Clear tree search" onClick={() => setFilterText('')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5"><X className="w-3 h-3" /></button>}
        </div>
        <div className="flex items-center gap-1">
          <button disabled={Boolean(matches)} onClick={() => setExpansion(previous => ({ open: true, revision: (previous?.revision ?? 0) + 1 }))} className="inline-flex items-center gap-1 px-2 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40" title="Expand all branches"><Maximize2 className="w-3 h-3" />Expand All</button>
          <button disabled={Boolean(matches)} onClick={() => setExpansion(previous => ({ open: false, revision: (previous?.revision ?? 0) + 1 }))} className="inline-flex items-center gap-1 px-2 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40" title="Collapse all branches"><Minimize2 className="w-3 h-3" />Collapse All</button>
        </div>
      </div>
      {copyError && <p role="alert" className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400">{copyError}</p>}
      <div className="p-3 overflow-auto flex-1 min-h-0 font-mono text-xs sm:text-sm">
        {matches?.size === 0 ? <p role="status" className="p-6 text-center text-zinc-500 font-sans text-sm">No keys or values match your search.</p>
          : <TreeNode name="root" value={data} path="$" depth={0} expansion={expansion} matches={matches} onCopyPath={handleCopyPath} copiedPath={copiedPath} />}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  name: string;
  value: unknown;
  path: string;
  depth: number;
  expansion: Expansion;
  matches: Set<string> | null;
  onCopyPath: (path: string) => void;
  copiedPath: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, value, path, depth, expansion, matches, onCopyPath, copiedPath }) => {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const [isOpen, setIsOpen] = React.useState(expansion?.open ?? depth < 2);
  const childrenId = React.useId();
  React.useEffect(() => { if (expansion) setIsOpen(expansion.open); }, [expansion]);
  if (matches && !matches.has(path)) return null;
  const open = matches ? true : isOpen;
  const renderedValue = value === null ? <span className="text-rose-500 italic">null</span>
    : typeof value === 'boolean' ? <span className="text-violet-600 dark:text-violet-400">{String(value)}</span>
    : typeof value === 'number' ? <span className="text-amber-700 dark:text-amber-400">{value}</span>
    : <span className="text-emerald-700 dark:text-emerald-400">{JSON.stringify(value)}</span>;
  return (
    <div className="my-0.5">
      <div className="group flex w-fit max-w-full items-start gap-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
        {isObject ? <button aria-label={`${open ? 'Collapse' : 'Expand'} ${path}`} aria-expanded={open} aria-controls={childrenId} disabled={Boolean(matches)} onClick={() => setIsOpen(!isOpen)} className="inline-flex min-w-0 items-center gap-1.5 p-1 text-left">
          {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
          <span className="font-semibold text-sky-700 dark:text-sky-400 break-all">{name}</span>
          <span className="text-zinc-500 text-xs whitespace-nowrap">{isArray ? `[${value.length} items]` : `{${Object.keys(value).length} keys}`}</span>
        </button> : <div className="p-1 pl-6 min-w-0 break-all"><span className="font-semibold text-sky-700 dark:text-sky-400">{name}</span><span className="text-zinc-400">{': '}</span>{renderedValue}</div>}
        <button onClick={() => onCopyPath(path)} aria-label={`Copy path ${path}`} title={`Copy path ${path}`} className="shrink-0 p-1.5 text-zinc-400 hover:text-indigo-500 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 rounded-md">
          {copiedPath === path ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      {isObject && open && <div id={childrenId} className="pl-3 ml-2 border-l border-zinc-200 dark:border-zinc-800">
        {Object.entries(value).map(([key, child]) => <TreeNode key={key} name={key} value={child} path={childJsonPath(path, key, isArray)} depth={depth + 1} expansion={expansion} matches={matches} onCopyPath={onCopyPath} copiedPath={copiedPath} />)}
      </div>}
    </div>
  );
};
