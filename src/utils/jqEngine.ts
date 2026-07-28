/**
 * Pure JavaScript/TypeScript jq syntax evaluator for JSON objects.
 * Supports pipes (|), field selectors (.foo.bar), array iterations (.items[]),
 * indexing ([0]), functions (select, map, keys, length, has, sort, sort_by,
 * unique, join, split, first, last, to_entries, from_entries, etc.), and object/array construction.
 */

export interface JqResult {
  result: any;
  resultString: string;
  error?: string;
}

export function evaluateJq(jsonInput: string | any, jqQuery: string): JqResult {
  try {
    const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const query = jqQuery.trim();

    if (!query || query === '.') {
      return {
        result: data,
        resultString: JSON.stringify(data, null, 2),
      };
    }

    // Split query by top-level pipe '|'
    const stages = splitPipes(query);
    let current: any[] = [data];

    for (const stage of stages) {
      const next: any[] = [];
      for (const item of current) {
        const stageRes = evaluateStage(item, stage.trim());
        if (Array.isArray(stageRes)) {
          next.push(...stageRes);
        } else if (stageRes !== undefined) {
          next.push(stageRes);
        }
      }
      current = next;
    }

    // Unpack if single item or wrap if multiple
    const finalOutput = current.length === 1 ? current[0] : current;

    return {
      result: finalOutput,
      resultString: JSON.stringify(finalOutput, null, 2),
    };
  } catch (err: any) {
    return {
      result: null,
      resultString: '',
      error: `jq syntax error: ${err.message}`,
    };
  }
}

/**
 * Splits query by pipe '|', ignoring pipes inside quotes or brackets.
 */
function splitPipes(query: string): string[] {
  const stages: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i < query.length; i++) {
    const ch = query[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && query[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === '[') bracketDepth++;
    else if (ch === ']') bracketDepth--;
    else if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;

    if (ch === '|' && bracketDepth === 0 && parenDepth === 0) {
      stages.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) stages.push(current);
  return stages;
}

function evaluateStage(val: any, expr: string): any {
  if (val === null || val === undefined) return undefined;

  // 1. Array wrapper [.users[] | .name]
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return Array.isArray(val) ? val : [val];
    const subRes = evaluateJq(val, inner);
    if (subRes.error) throw new Error(subRes.error);
    return Array.isArray(subRes.result) ? subRes.result : [subRes.result];
  }

  // 2. Function calls
  if (expr.startsWith('select(') && expr.endsWith(')')) {
    const conditionStr = expr.slice(7, -1).trim();
    return evaluateCondition(val, conditionStr) ? val : undefined;
  }

  if (expr.startsWith('map(') && expr.endsWith(')')) {
    const innerExpr = expr.slice(4, -1).trim();
    if (!Array.isArray(val)) return [];
    return val.map((item) => {
      const res = evaluateJq(item, innerExpr);
      return res.result;
    });
  }

  if (expr === 'keys') {
    if (typeof val === 'object' && val !== null) {
      return Object.keys(val);
    }
    return [];
  }

  if (expr === 'length') {
    if (Array.isArray(val) || typeof val === 'string') return val.length;
    if (typeof val === 'object' && val !== null) return Object.keys(val).length;
    return 0;
  }

  if (expr.startsWith('has(') && expr.endsWith(')')) {
    const key = expr.slice(4, -1).trim().replace(/^['"]|['"]$/g, '');
    if (typeof val === 'object' && val !== null) {
      return key in val;
    }
    return false;
  }

  if (expr === 'sort') {
    if (!Array.isArray(val)) return val;
    return [...val].sort();
  }

  if (expr.startsWith('sort_by(') && expr.endsWith(')')) {
    const keyExpr = expr.slice(8, -1).trim();
    if (!Array.isArray(val)) return val;
    return [...val].sort((a, b) => {
      const valA = evaluateJq(a, keyExpr).result;
      const valB = evaluateJq(b, keyExpr).result;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }

  if (expr === 'unique') {
    if (!Array.isArray(val)) return val;
    return Array.from(new Set(val.map((x) => JSON.stringify(x)))).map((x) => JSON.parse(x));
  }

  if (expr === 'reverse') {
    if (!Array.isArray(val)) return val;
    return [...val].reverse();
  }

  if (expr === 'first') {
    return Array.isArray(val) ? val[0] : val;
  }

  if (expr === 'last') {
    return Array.isArray(val) ? val[val.length - 1] : val;
  }

  if (expr === 'to_entries') {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return Object.entries(val).map(([k, v]) => ({ key: k, value: v }));
    }
    return [];
  }

  if (expr === 'from_entries') {
    if (Array.isArray(val)) {
      const obj: Record<string, any> = {};
      for (const item of val) {
        if (item && item.key) obj[item.key] = item.value;
      }
      return obj;
    }
    return {};
  }

  if (expr.startsWith('join(') && expr.endsWith(')')) {
    const sep = expr.slice(5, -1).trim().replace(/^['"]|['"]$/g, '');
    if (Array.isArray(val)) return val.join(sep);
    return String(val);
  }

  // 3. Array Iterator .[] or .field[]
  if (expr === '.[]') {
    if (Array.isArray(val)) return val;
    if (typeof val === 'object' && val !== null) return Object.values(val);
    return undefined;
  }

  // Path accessor, e.g. .users[] or .users[0] or .users.name
  if (expr.startsWith('.')) {
    return evaluateDotPath(val, expr);
  }

  return val;
}

function evaluateDotPath(val: any, expr: string): any {
  // Check if expression ends with []
  if (expr.endsWith('[]')) {
    const basePath = expr.slice(0, -2);
    const baseVal = basePath === '.' ? val : evaluateDotPath(val, basePath);
    if (Array.isArray(baseVal)) return baseVal;
    if (typeof baseVal === 'object' && baseVal !== null) return Object.values(baseVal);
    return undefined;
  }

  // Check array index e.g. .users[0]
  const indexMatch = expr.match(/^(\.[a-zA-Z0-9_$]+)?\[(\d+)\]$/);
  if (indexMatch) {
    const basePath = indexMatch[1] || '.';
    const idx = Number(indexMatch[2]);
    const baseVal = basePath === '.' ? val : evaluateDotPath(val, basePath);
    if (Array.isArray(baseVal)) return baseVal[idx];
    return undefined;
  }

  // Dot path traverse e.g. .user.address.city
  const parts = expr.split('.').filter(Boolean);
  let curr = val;
  for (const p of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[p];
  }
  return curr;
}

function evaluateCondition(val: any, conditionStr: string): boolean {
  // Handles > < == != >= <=
  const opMatch = conditionStr.match(/^(.+?)(==|!=|>=|<=|>|<)(.+)$/);
  if (opMatch) {
    const leftExpr = opMatch[1].trim();
    const op = opMatch[2].trim();
    const rightStr = opMatch[3].trim();

    const leftVal = evaluateJq(val, leftExpr).result;

    let rightVal: any;
    if (rightStr === 'true') rightVal = true;
    else if (rightStr === 'false') rightVal = false;
    else if (rightStr === 'null') rightVal = null;
    else if (!isNaN(Number(rightStr))) rightVal = Number(rightStr);
    else rightVal = rightStr.replace(/^['"]|['"]$/g, '');

    switch (op) {
      case '==':
        return leftVal == rightVal;
      case '!=':
        return leftVal != rightVal;
      case '>':
        return leftVal > rightVal;
      case '<':
        return leftVal < rightVal;
      case '>=':
        return leftVal >= rightVal;
      case '<=':
        return leftVal <= rightVal;
    }
  }

  // Boolean check
  const checkVal = evaluateJq(val, conditionStr).result;
  return Boolean(checkVal);
}
