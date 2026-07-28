import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface TreeViewProps {
  data: any;
  searchQuery?: string;
  onCopyPath?: (path: string) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ data, searchQuery = '', onCopyPath }) => {
  const [expandAll, setExpandAll] = React.useState<boolean | null>(true);
  const [filterText, setFilterText] = React.useState(searchQuery);
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFilterText(searchQuery);
  }, [searchQuery]);

  const handleCopyPath = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    if (onCopyPath) onCopyPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  if (data === null || data === undefined) {
    return <div className="p-4 text-slate-400 italic text-sm">No data to display in tree view</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Tree View Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpandAll(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            Expand All
          </button>
          <button
            onClick={() => setExpandAll(false)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 overflow-auto flex-1 font-mono text-xs sm:text-sm">
        <TreeNode
          name="root"
          value={data}
          path="$"
          defaultExpanded={true}
          expandAll={expandAll}
          filterText={filterText.toLowerCase()}
          onCopyPath={handleCopyPath}
          copiedPath={copiedPath}
        />
      </div>
    </div>
  );
};

interface TreeNodeProps {
  name: string;
  value: any;
  path: string;
  defaultExpanded: boolean;
  expandAll: boolean | null;
  filterText: string;
  onCopyPath: (path: string, e: React.MouseEvent) => void;
  copiedPath: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  path,
  defaultExpanded,
  expandAll,
  filterText,
  onCopyPath,
  copiedPath,
}) => {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const [expanded, setExpanded] = React.useMemo(() => {
    return [
      expandAll !== null ? expandAll : defaultExpanded,
      (val: boolean) => val,
    ];
  }, [expandAll, defaultExpanded]);

  const [isOpen, setIsOpen] = React.useState(expandAll !== null ? expandAll : defaultExpanded);

  React.useEffect(() => {
    if (expandAll !== null) {
      setIsOpen(expandAll);
    }
  }, [expandAll]);

  // Check filter matching
  const matchesFilter = React.useMemo(() => {
    if (!filterText) return true;
    const keyMatch = name.toLowerCase().includes(filterText);
    const valMatch = !isObject && String(value).toLowerCase().includes(filterText);
    return keyMatch || valMatch;
  }, [name, value, isObject, filterText]);

  if (!matchesFilter && !isObject) {
    return null;
  }

  const renderValue = () => {
    if (value === null) {
      return <span className="text-rose-500 dark:text-rose-400 italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="text-violet-600 dark:text-violet-400 font-semibold">{String(value)}</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
    }
    if (typeof value === 'string') {
      return <span className="text-emerald-600 dark:text-emerald-400">"{value}"</span>;
    }
    return <span>{String(value)}</span>;
  };

  const getSummary = () => {
    if (isArray) {
      return <span className="text-slate-400 text-xs ml-2 font-normal">[{value.length} items]</span>;
    }
    if (isObject) {
      const keysCount = Object.keys(value).length;
      return <span className="text-slate-400 text-xs ml-2 font-normal">{`{${keysCount} keys}`}</span>;
    }
    return null;
  };

  const isCopied = copiedPath === path;

  return (
    <div className="my-0.5">
      <div
        className={`group inline-flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none text-slate-800 dark:text-slate-200`}
        onClick={() => isObject && setIsOpen(!isOpen)}
      >
        {isObject ? (
          <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5 h-3.5 inline-block" />
        )}

        {/* Property Name */}
        <span className="font-semibold text-sky-600 dark:text-sky-400">{name}</span>
        <span className="text-slate-400">:</span>

        {/* Value or Summary */}
        {isObject ? (
          getSummary()
        ) : (
          <span className="ml-1 break-all">{renderValue()}</span>
        )}

        {/* Copy Path Icon */}
        <button
          onClick={(e) => onCopyPath(path, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all rounded"
          title={`Copy path: ${path}`}
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Nested Children */}
      {isObject && isOpen && (
        <div className="pl-4 ml-2 border-l border-slate-200 dark:border-slate-800">
          {Object.keys(value).map((key) => {
            const childValue = value[key];
            const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`;
            return (
              <TreeNode
                key={key}
                name={key}
                value={childValue}
                path={childPath}
                defaultExpanded={defaultExpanded}
                expandAll={expandAll}
                filterText={filterText}
                onCopyPath={onCopyPath}
                copiedPath={copiedPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
