/**
 * AI & LLM Tool Specification & Structured Output Generator
 * Supports: OpenAI Function Call Tools, Google Gemini Function Declarations, Zod Schemas, TypeBox.
 */

export type LlmSpecVariant =
  | 'openai'
  | 'gemini'
  | 'zod'
  | 'typebox';

export interface LlmSpecResult {
  code: string;
  error?: string;
}

export function generateLlmToolSpec(
  jsonInput: string,
  variant: LlmSpecVariant = 'openai',
  toolName = 'fetch_json_data',
  description = 'Processed structured data tool payload'
): LlmSpecResult {
  try {
    const parsed = JSON.parse(jsonInput);

    switch (variant) {
      case 'openai':
        return { code: generateOpenAiTool(parsed, toolName, description) };
      case 'gemini':
        return { code: generateGeminiTool(parsed, toolName, description) };
      case 'zod':
        return { code: generateZodSchema(parsed, toolName) };
      case 'typebox':
        return { code: generateTypeBoxSchema(parsed, toolName) };
      default:
        return { code: '', error: `Unsupported LLM spec variant: ${variant}` };
    }
  } catch (err: any) {
    return { code: '', error: `Failed to parse JSON for LLM tool spec: ${err.message}` };
  }
}

// -------------------------------------------------------------------------
// 1. OpenAI Function Call Tool Definition
// -------------------------------------------------------------------------
function generateOpenAiTool(obj: any, toolName: string, description: string): string {
  function inferProperties(val: any): any {
    if (val === null) return { type: 'string', nullable: true };
    if (typeof val === 'boolean') return { type: 'boolean' };
    if (typeof val === 'number') return Number.isInteger(val) ? { type: 'integer' } : { type: 'number' };
    if (typeof val === 'string') return { type: 'string' };

    if (Array.isArray(val)) {
      const itemsSchema = val.length > 0 ? inferProperties(val[0]) : { type: 'string' };
      return { type: 'array', items: itemsSchema };
    }

    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [k, v] of Object.entries(val)) {
        properties[k] = inferProperties(v);
        required.push(k);
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
        additionalProperties: false,
      };
    }

    return { type: 'string' };
  }

  const toolObj = {
    type: 'function',
    function: {
      name: toolName,
      description: description,
      parameters: inferProperties(obj),
    },
  };

  return JSON.stringify(toolObj, null, 2);
}

// -------------------------------------------------------------------------
// 2. Google Gemini Function Declaration Schema
// -------------------------------------------------------------------------
function generateGeminiTool(obj: any, toolName: string, description: string): string {
  function inferGeminiType(val: any): any {
    if (val === null) return { type: 'STRING', nullable: true };
    if (typeof val === 'boolean') return { type: 'BOOLEAN' };
    if (typeof val === 'number') return Number.isInteger(val) ? { type: 'INTEGER' } : { type: 'NUMBER' };
    if (typeof val === 'string') return { type: 'STRING' };

    if (Array.isArray(val)) {
      const itemsSchema = val.length > 0 ? inferGeminiType(val[0]) : { type: 'STRING' };
      return { type: 'ARRAY', items: itemsSchema };
    }

    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [k, v] of Object.entries(val)) {
        properties[k] = inferGeminiType(v);
        required.push(k);
      }

      return {
        type: 'OBJECT',
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    return { type: 'STRING' };
  }

  const geminiDecl = {
    name: toolName,
    description: description,
    parameters: inferGeminiType(obj),
  };

  return JSON.stringify(geminiDecl, null, 2);
}

// -------------------------------------------------------------------------
// 3. Zod Schema (TypeScript)
// -------------------------------------------------------------------------
function generateZodSchema(obj: any, schemaName: string): string {
  function processZod(val: any, indentLevel = 0): string {
    const pad = '  '.repeat(indentLevel);
    if (val === null || val === undefined) return 'z.null()';
    if (typeof val === 'boolean') return 'z.boolean()';
    if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
    if (typeof val === 'string') return 'z.string()';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'z.array(z.unknown())';
      const inner = processZod(val[0], indentLevel);
      return `z.array(${inner})`;
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return 'z.object({})';

      const fields = entries.map(([k, v]) => {
        const zodType = processZod(v, indentLevel + 1);
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `${pad}  ${safeKey}: ${zodType},`;
      });

      return `z.object({\n${fields.join('\n')}\n${pad}})`;
    }

    return 'z.unknown()';
  }

  const capitalized = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
  const zodCode = processZod(obj, 0);

  return `import { z } from 'zod';\n\nexport const ${capitalized}Schema = ${zodCode};\n\nexport type ${capitalized} = z.infer<typeof ${capitalized}Schema>;`;
}

// -------------------------------------------------------------------------
// 4. TypeBox Schema (TypeScript)
// -------------------------------------------------------------------------
function generateTypeBoxSchema(obj: any, schemaName: string): string {
  function processTypeBox(val: any, indentLevel = 0): string {
    const pad = '  '.repeat(indentLevel);
    if (val === null || val === undefined) return 'Type.Null()';
    if (typeof val === 'boolean') return 'Type.Boolean()';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Type.Integer()' : 'Type.Number()';
    if (typeof val === 'string') return 'Type.String()';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'Type.Array(Type.Unknown())';
      const inner = processTypeBox(val[0], indentLevel);
      return `Type.Array(${inner})`;
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return 'Type.Object({})';

      const fields = entries.map(([k, v]) => {
        const tbType = processTypeBox(v, indentLevel + 1);
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `${pad}  ${safeKey}: ${tbType},`;
      });

      return `Type.Object({\n${fields.join('\n')}\n${pad}})`;
    }

    return 'Type.Unknown()';
  }

  const capitalized = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
  const tbCode = processTypeBox(obj, 0);

  return `import { Type, Static } from '@sinclair/typebox';\n\nexport const ${capitalized}Schema = ${tbCode};\n\nexport type ${capitalized} = Static<typeof ${capitalized}Schema>;`;
}
