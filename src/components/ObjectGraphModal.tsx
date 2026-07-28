import React from 'react';
import { X, Network, Search, ZoomIn, ZoomOut, RefreshCw, Layers, Check, Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface GraphNode {
  id: string;
  label: string;
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  valuePreview: string;
  childIds: string[];
  parentId?: string;
  level: number;
}

interface ObjectGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  language?: SupportedLanguage;
}

export const ObjectGraphModal: React.FC<ObjectGraphModalProps> = ({
  isOpen,
  onClose,
  inputText,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [nodes, setNodes] = React.useState<GraphNode[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const [collapsedNodeIds, setCollapsedNodeIds] = React.useState<Set<string>>(new Set());
  const [parseError, setParseError] = React.useState<string | null>(null);

  // Parse JSON into nodes graph
  React.useEffect(() => {
    if (!isOpen) return;

    if (!inputText || !inputText.trim()) {
      setParseError('Input JSON is empty');
      setNodes([]);
      return;
    }

    try {
      const parsed = JSON.parse(inputText);
      setParseError(null);

      const nodeList: GraphNode[] = [];
      let counter = 0;

      function buildGraph(val: any, label: string, path: string, parentId?: string, level = 0): string {
        const id = `node_${counter++}`;
        const childIds: string[] = [];

        let type: GraphNode['type'] = 'string';
        let valuePreview = String(val);

        if (val === null) {
          type = 'null';
          valuePreview = 'null';
        } else if (typeof val === 'boolean') {
          type = 'boolean';
          valuePreview = String(val);
        } else if (typeof val === 'number') {
          type = 'number';
          valuePreview = String(val);
        } else if (typeof val === 'string') {
          type = 'string';
          valuePreview = val.length > 25 ? `"${val.slice(0, 22)}..."` : `"${val}"`;
        } else if (Array.isArray(val)) {
          type = 'array';
          valuePreview = `Array[${val.length}]`;
          // Limit deep node creation for huge JSONs to maintain performance (up to 100 nodes max)
          if (nodeList.length < 150) {
            val.slice(0, 10).forEach((item, idx) => {
              const childId = buildGraph(item, `[${idx}]`, `${path}[${idx}]`, id, level + 1);
              childIds.push(childId);
            });
            if (val.length > 10) {
              const dummyChildId = `node_${counter++}`;
              nodeList.push({
                id: dummyChildId,
                label: `... +${val.length - 10} more items`,
                path: `${path}[10+]`,
                type: 'string',
                valuePreview: '',
                childIds: [],
                parentId: id,
                level: level + 1,
              });
              childIds.push(dummyChildId);
            }
          }
        } else if (typeof val === 'object') {
          type = 'object';
          const keys = Object.keys(val);
          valuePreview = `Object {${keys.length} keys}`;
          if (nodeList.length < 150) {
            keys.slice(0, 15).forEach((key) => {
              const childPath = path ? `${path}.${key}` : key;
              const childId = buildGraph(val[key], key, childPath, id, level + 1);
              childIds.push(childId);
            });
            if (keys.length > 15) {
              const dummyChildId = `node_${counter++}`;
              nodeList.push({
                id: dummyChildId,
                label: `... +${keys.length - 15} more keys`,
                path: `${path}.more`,
                type: 'string',
                valuePreview: '',
                childIds: [],
                parentId: id,
                level: level + 1,
              });
              childIds.push(dummyChildId);
            }
          }
        }

        const node: GraphNode = {
          id,
          label,
          path: path || '$',
          type,
          valuePreview,
          childIds,
          parentId,
          level,
        };

        nodeList.push(node);
        return id;
      }

      buildGraph(parsed, 'Root', '$', undefined, 0);
      setNodes(nodeList);
      if (nodeList.length > 0) {
        setSelectedNodeId(nodeList[0].id);
      }
    } catch (err: any) {
      setParseError(`JSON parse error: ${err.message}`);
      setNodes([]);
    }
  }, [isOpen, inputText]);

  if (!isOpen) return null;

  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const toggleCollapse = (id: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  const getTypeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'object':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'array':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'string':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'number':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'boolean':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'null':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    }
  };

  // Render tree recursive item
  const renderTreeNode = (node: GraphNode) => {
    const isCollapsed = collapsedNodeIds.has(node.id);
    const hasChildren = node.childIds.length > 0;
    const isSelected = selectedNodeId === node.id;
    const isMatched = searchQuery && (node.label.toLowerCase().includes(searchQuery.toLowerCase()) || node.path.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div key={node.id} className="select-none my-1" style={{ paddingLeft: `${node.level * 18}px` }}>
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shadow-2xs ${
            isSelected
              ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-400 dark:border-indigo-600'
              : isMatched
              ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-100'
              : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
          }`}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          <span className="font-bold text-zinc-900 dark:text-zinc-100">{node.label}:</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getTypeColor(node.type)}`}>
            {node.type}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[200px]">
            {node.valuePreview}
          </span>
        </div>

        {!isCollapsed && hasChildren && (
          <div className="border-l border-dashed border-zinc-300 dark:border-zinc-700 ml-3.5 pl-1 my-0.5">
            {node.childIds.map((childId) => {
              const childNode = nodeMap.get(childId);
              return childNode ? renderTreeNode(childNode) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = nodes.filter((n) => !n.parentId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Interactive ER & Object Graph Visualizer</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Parent-Child Node Diagram
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Explore JSON object trees, inspect schema node types, search paths, and collapse subtrees
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search key or path (e.g. $.users)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">
              Nodes: <strong className="text-zinc-900 dark:text-zinc-100">{nodes.length}</strong>
            </span>
            <button
              onClick={() => setCollapsedNodeIds(new Set())}
              className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={() => setCollapsedNodeIds(new Set(nodes.map((n) => n.id)))}
              className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Content Body */}
        {parseError ? (
          <div className="p-8 text-center text-rose-500 font-mono text-xs">{parseError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Tree Chart */}
            <div className="md:col-span-8 p-5 overflow-auto border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-[400px] max-h-[600px]">
              {rootNodes.map((root) => renderTreeNode(root))}
            </div>

            {/* Selected Node Details Panel */}
            <div className="md:col-span-4 p-5 bg-white dark:bg-zinc-900 overflow-y-auto space-y-4 text-xs">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Node Inspector</span>
              </h3>

              {selectedNode ? (
                <div className="space-y-3 font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <span className="text-zinc-400 block text-[10px]">JSON PATH:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 break-all">
                      {selectedNode.path}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-400 block text-[10px]">TYPE:</span>
                      <span className="font-bold uppercase text-zinc-800 dark:text-zinc-200">
                        {selectedNode.type}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-400 block text-[10px]">CHILDREN:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {selectedNode.childIds.length}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-100 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 block text-[10px]">VALUE PREVIEW:</span>
                    <pre className="text-xs font-mono overflow-auto max-h-40 leading-relaxed">
                      {selectedNode.valuePreview}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400 text-xs">Click any node on the left to inspect detailed path and value metadata.</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Node visualizer supports up to 150 nested objects & arrays
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
