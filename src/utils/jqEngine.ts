/**
 * Pure JavaScript/TypeScript jq syntax evaluator for JSON objects.
 * Supports pipes (|), field selectors (.foo.bar), array iterations (.items[]),
 * indexing ([0]), functions (select, map, keys, length, has, sort, sort_by,
 * unique, reverse, first, last, to_entries, from_entries, join, split, etc.), and array construction.
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
      const trimmedStage = stage.trim();
      const next: any[] = [];

      for (const item of current) {
        if (item === null || item === undefined) continue;

        const stageRes = evaluateStageOnItem(item, trimmedStage);
        if (stageRes.isStream) {
          next.push(...stageRes.value);
        } else if (stageRes.value !== undefined) {
          next.push(stageRes.value);
        }
      }
      current = next;
    }

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
 * Splits query by pipe '|', ignoring pipes inside quotes, brackets or parentheses.
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

interface StageEvalResult {
  value: any;
  isStream: boolean; // True if result is an exploded array stream from iteration like .[] or .users[]
}

function evaluateStageOnItem(val: any, expr: string): StageEvalResult {
  if (val === null || val === undefined) return { value: undefined, isStream: false };

  // 1. Array construction wrapper [.users[] | .name]
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return { value: Array.isArray(val) ? val : [val], isStream: false };
    const subRes = evaluateJq(val, inner);
    if (subRes.error) throw new Error(subRes.error);
    const arr = Array.isArray(subRes.result) ? subRes.result : (subRes.result !== undefined ? [subRes.result] : []);
    return { value: arr, isStream: false };
  }

  // 2. Built-in functions
  if (expr.startsWith('select(') && expr.endsWith(')')) {
    const conditionStr = expr.slice(7, -1).trim();
    const passed = evaluateCondition(val, conditionStr);
    return { value: passed ? val : undefined, isStream: false };
  }

  if (expr.startsWith('map(') && expr.endsWith(')')) {
    const innerExpr = expr.slice(4, -1).trim();
    if (!Array.isArray(val)) return { value: [], isStream: false };
    const mapped = val.map((item) => {
      const res = evaluateJq(item, innerExpr);
      return res.result;
    });
    return { value: mapped, isStream: false };
  }

  if (expr === 'keys') {
    if (typeof val === 'object' && val !== null) {
      return { value: Object.keys(val), isStream: false };
    }
    return { value: [], isStream: false };
  }

  if (expr === 'length') {
    if (Array.isArray(val) || typeof val === 'string') return { value: val.length, isStream: false };
    if (typeof val === 'object' && val !== null) return { value: Object.keys(val).length, isStream: false };
    return { value: 0, isStream: false };
  }

  if (expr.startsWith('has(') && expr.endsWith(')')) {
    const key = expr.slice(4, -1).trim().replace(/^['"]|['"]$/g, '');
    if (typeof val === 'object' && val !== null) {
      return { value: key in val, isStream: false };
    }
    return { value: false, isStream: false };
  }

  if (expr === 'sort') {
    if (!Array.isArray(val)) return { value: val, isStream: false };
    return { value: [...val].sort(), isStream: false };
  }

  if (expr.startsWith('sort_by(') && expr.endsWith(')')) {
    const keyExpr = expr.slice(8, -1).trim();
    if (!Array.isArray(val)) return { value: val, isStream: false };
    const sorted = [...val].sort((a, b) => {
      const valA = evaluateJq(a, keyExpr).result;
      const valB = evaluateJq(b, keyExpr).result;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    return { value: sorted, isStream: false };
  }

  if (expr === 'unique') {
    if (!Array.isArray(val)) return { value: val, isStream: false };
    const uniq = Array.from(new Set(val.map((x) => JSON.stringify(x)))).map((x) => JSON.parse(x));
    return { value: uniq, isStream: false };
  }

  if (expr === 'reverse') {
    if (!Array.isArray(val)) return { value: val, isStream: false };
    return { value: [...val].reverse(), isStream: false };
  }

  if (expr === 'first') {
    return { value: Array.isArray(val) ? val[0] : val, isStream: false };
  }

  if (expr === 'last') {
    return { value: Array.isArray(val) ? val[val.length - 1] : val, isStream: false };
  }

  if (expr === 'to_entries') {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const entries = Object.entries(val).map(([k, v]) => ({ key: k, value: v }));
      return { value: entries, isStream: false };
    }
    return { value: [], isStream: false };
  }

  if (expr === 'from_entries') {
    if (Array.isArray(val)) {
      const obj: Record<string, any> = {};
      for (const item of val) {
        if (item && item.key !== undefined) obj[item.key] = item.value;
      }
      return { value: obj, isStream: false };
    }
    return { value: {}, isStream: false };
  }

  if (expr.startsWith('join(') && expr.endsWith(')')) {
    const sep = expr.slice(5, -1).trim().replace(/^['"]|['"]$/g, '');
    if (Array.isArray(val)) return { value: val.join(sep), isStream: false };
    return { value: String(val), isStream: false };
  }

  // 3. Path Access (e.g., .users[], .users[0].name, .name, .[])
  return evaluatePathAccess(val, expr);
}

function evaluatePathAccess(val: any, expr: string): StageEvalResult {
  if (!expr.startsWith('.')) {
    return { value: val, isStream: false };
  }

  // Parse path into segments
  // Segments can be: prop (string), index (number), or iterate (Symbol)
  const ITERATE = Symbol('ITERATE');
  type Segment = string | number | typeof ITERATE;

  const segments: Segment[] = [];
  let remaining = expr.slice(1); // strip leading dot

  while (remaining.length > 0) {
    if (remaining.startsWith('[]')) {
      segments.push(ITERATE);
      remaining = remaining.slice(2);
      if (remaining.startsWith('.')) remaining = remaining.slice(1);
      continue;
    }

    const indexMatch = remaining.match(/^\[(-?\d+)\]/);
    if (indexMatch) {
      segments.push(Number(indexMatch[1]));
      remaining = remaining.slice(indexMatch[0].length);
      if (remaining.startsWith('.')) remaining = remaining.slice(1);
      continue;
    }

    const keyMatch = remaining.match(/^([a-zA-Z0-9_$]+)/);
    if (keyMatch) {
      segments.push(keyMatch[1]);
      remaining = remaining.slice(keyMatch[1].length);
      if (remaining.startsWith('.')) remaining = remaining.slice(1);
      continue;
    }

    // Quoted key e.g. ["key with space"]
    const quotedMatch = remaining.match(/^\[["']([^"']+)["']\]/);
    if (quotedMatch) {
      segments.push(quotedMatch[1]);
      remaining = remaining.slice(quotedMatch[0].length);
      if (remaining.startsWith('.')) remaining = remaining.slice(1);
      continue;
    }

    break;
  }

  if (segments.length === 0) {
    return { value: val, isStream: false };
  }

  function resolveSegments(current: any, segIdx: number): { values: any[]; exploded: boolean } {
    if (segIdx >= segments.length) {
      return { values: [current], exploded: false };
    }

    if (current === null || current === undefined) {
      return { values: [], exploded: false };
    }

    const seg = segments[segIdx];

    if (seg === ITERATE) {
      const items = Array.isArray(current)
        ? current
        : typeof current === 'object'
        ? Object.values(current)
        : [];

      const results: any[] = [];
      for (const item of items) {
        const sub = resolveSegments(item, segIdx + 1);
        results.push(...sub.values);
      }
      return { values: results, exploded: true };
    }

    if (typeof seg === 'number') {
      if (!Array.isArray(current)) return { values: [], exploded: false };
      const idx = seg < 0 ? current.length + seg : seg;
      return resolveSegments(current[idx], segIdx + 1);
    }

    if (typeof seg === 'string') {
      if (typeof current !== 'object') return { values: [], exploded: false };
      return resolveSegments(current[seg], segIdx + 1);
    }

    return { values: [], exploded: false };
  }

  const { values, exploded } = resolveSegments(val, 0);

  if (exploded) {
    return { value: values, isStream: true };
  } else {
    return { value: values.length > 0 ? values[0] : undefined, isStream: false };
  }
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
        return leftVal === rightVal;
      case '!=':
        return leftVal !== rightVal;
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

  const checkVal = evaluateJq(val, conditionStr).result;
  return Boolean(checkVal);
}
