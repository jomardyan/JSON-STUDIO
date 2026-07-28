import React from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language?: 'json' | 'xml' | 'csv' | 'text';
  errorLine?: number;
  searchQuery?: string;
  maxLinesToShow?: number;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = 'json',
  errorLine,
  searchQuery = '',
  maxLinesToShow = 1500,
}) => {
  const lines = React.useMemo(() => {
    if (!code) return [];
    return code.split('\n');
  }, [code]);

  const visibleLines = React.useMemo(() => {
    return lines.slice(0, maxLinesToShow);
  }, [lines, maxLinesToShow]);

  return (
    <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
      <table className="w-full border-collapse">
        <tbody>
          {visibleLines.map((lineText, idx) => {
            const lineNumber = idx + 1;
            const isErrorLine = errorLine === lineNumber;

            return (
              <tr
                key={idx}
                className={`group transition-colors ${
                  isErrorLine
                    ? 'bg-rose-500/15 dark:bg-rose-950/40 border-l-4 border-rose-500'
                    : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Line number */}
                <td className="w-12 select-none border-r border-slate-200 py-0.5 pr-4 pl-3 text-right font-mono text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-400">
                  {lineNumber}
                </td>

                {/* Line content */}
                <td className="pl-4 pr-3 py-0.5 whitespace-pre">
                  <HighlightedLine
                    line={lineText}
                    language={language}
                    searchQuery={searchQuery}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {lines.length > maxLinesToShow && (
        <div className="p-3 text-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          Showing first {maxLinesToShow} of {lines.length} lines for fast rendering.
        </div>
      )}
    </div>
  );
};

interface LineProps {
  line: string;
  language: 'json' | 'xml' | 'csv' | 'text';
  searchQuery?: string;
}

const HighlightedLine: React.FC<LineProps> = ({ line, language, searchQuery }) => {
  const tokens = React.useMemo(() => {
    if (language === 'json') {
      return highlightJsonLine(line);
    } else if (language === 'xml') {
      return highlightXmlLine(line);
    }
    return [{ text: line, type: 'plain' }];
  }, [line, language]);

  return (
    <span>
      {tokens.map((token, i) => {
        let colorClass = 'text-slate-800 dark:text-slate-200';

        switch (token.type) {
          case 'key':
            colorClass = 'text-sky-600 dark:text-sky-400 font-medium';
            break;
          case 'string':
            colorClass = 'text-emerald-600 dark:text-emerald-400';
            break;
          case 'number':
            colorClass = 'text-amber-600 dark:text-amber-400 font-mono';
            break;
          case 'boolean':
            colorClass = 'text-violet-600 dark:text-violet-400 font-bold';
            break;
          case 'null':
            colorClass = 'text-rose-500 dark:text-rose-400 italic';
            break;
          case 'punctuation':
            colorClass = 'text-slate-500 dark:text-slate-500';
            break;
          case 'xml-tag':
            colorClass = 'text-indigo-600 dark:text-indigo-400 font-semibold';
            break;
          case 'xml-attr':
            colorClass = 'text-sky-600 dark:text-sky-300 font-medium';
            break;
        }

        if (searchQuery && searchQuery.trim() && token.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          return (
            <mark
              key={i}
              className={`${colorClass} bg-amber-300/60 dark:bg-amber-500/40 rounded px-0.5`}
            >
              {token.text}
            </mark>
          );
        }

        return (
          <span key={i} className={colorClass}>
            {token.text}
          </span>
        );
      })}
    </span>
  );
};

interface Token {
  text: string;
  type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'xml-tag' | 'xml-attr' | 'plain';
}

function highlightJsonLine(line: string): Token[] {
  const tokens: Token[] = [];
  // Tokenize regex for JSON elements
  const jsonRegex = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],:])|([^\s"{}[\],:]+)/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = jsonRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, match.index),
        type: 'plain',
      });
    }

    const [
      _full,
      keyMatch,
      stringMatch,
      numberMatch,
      boolMatch,
      nullMatch,
      punctMatch,
    ] = match;

    if (keyMatch) {
      tokens.push({ text: keyMatch, type: 'key' });
    } else if (stringMatch) {
      tokens.push({ text: stringMatch, type: 'string' });
    } else if (numberMatch) {
      tokens.push({ text: numberMatch, type: 'number' });
    } else if (boolMatch) {
      tokens.push({ text: boolMatch, type: 'boolean' });
    } else if (nullMatch) {
      tokens.push({ text: nullMatch, type: 'null' });
    } else if (punctMatch) {
      tokens.push({ text: punctMatch, type: 'punctuation' });
    } else {
      tokens.push({ text: match[0], type: 'plain' });
    }

    lastIndex = jsonRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: 'plain' });
  }

  return tokens.length > 0 ? tokens : [{ text: line, type: 'plain' }];
}

function highlightXmlLine(line: string): Token[] {
  const tokens: Token[] = [];
  const xmlRegex = /(<\/?[\w:-]+(?:\s+[^>]+)?\/?>)|("[^"]*")|('[^']*')|([^<">]+)/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = xmlRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: 'plain' });
    }

    const [full, tagMatch, dQuoteMatch, sQuoteMatch, textMatch] = match;

    if (tagMatch) {
      tokens.push({ text: tagMatch, type: 'xml-tag' });
    } else if (dQuoteMatch || sQuoteMatch) {
      tokens.push({ text: full, type: 'string' });
    } else if (textMatch) {
      tokens.push({ text: textMatch, type: 'plain' });
    } else {
      tokens.push({ text: full, type: 'plain' });
    }

    lastIndex = xmlRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: 'plain' });
  }

  return tokens;
}
