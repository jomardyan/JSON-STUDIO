/**
 * Multi-Language Data Model Generator from JSON
 * Supports: TypeScript, Python (Pydantic / dataclass), Go, Rust, C#, Java, Kotlin, Swift, Dart
 */

export type TargetLanguage =
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'csharp'
  | 'java'
  | 'kotlin'
  | 'swift'
  | 'dart';

export interface CodeGenOptions {
  rootName?: string;
  variant?: string; // e.g., 'pydantic' vs 'dataclass', 'record' vs 'class', 'freezed' vs 'class'
  usePascalCaseKeys?: boolean;
}

export function generateCodeModel(
  jsonInput: string,
  language: TargetLanguage,
  options: CodeGenOptions = {}
): { result: string; error?: string } {
  try {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return { result: '', error: 'Invalid JSON input. Please format or clean the JSON first.' };
    }

    if (parsed === null || parsed === undefined) {
      return { result: '', error: 'JSON input is empty or null.' };
    }

    // If root is array, inspect first element or generate list model
    let targetObj = parsed;
    let isArrayRoot = false;
    if (Array.isArray(parsed)) {
      isArrayRoot = true;
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        targetObj = parsed[0];
      } else {
        targetObj = {};
      }
    }

    const rootName = sanitizeClassName(options.rootName || 'RootModel');

    switch (language) {
      case 'typescript':
        return { result: generateTypeScript(targetObj, rootName, options.variant || 'interface') };
      case 'python':
        return { result: generatePython(targetObj, rootName, options.variant || 'pydantic') };
      case 'go':
        return { result: generateGo(targetObj, rootName) };
      case 'rust':
        return { result: generateRust(targetObj, rootName) };
      case 'csharp':
        return { result: generateCSharp(targetObj, rootName, options.variant || 'record') };
      case 'java':
        return { result: generateJava(targetObj, rootName) };
      case 'kotlin':
        return { result: generateKotlin(targetObj, rootName) };
      case 'swift':
        return { result: generateSwift(targetObj, rootName) };
      case 'dart':
        return { result: generateDart(targetObj, rootName, options.variant || 'freezed') };
      default:
        return { result: '', error: `Unsupported target language: ${language}` };
    }
  } catch (err: any) {
    return { result: '', error: err.message || 'Failed to generate code model' };
  }
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function sanitizeClassName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_$]/g, '');
  if (!cleaned) return 'Model';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string): string {
  const pas = toPascalCase(str);
  return pas.charAt(0).toLowerCase() + pas.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase()
    .replace(/_+/g, '_');
}

function singularize(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

// ----------------------------------------------------------------------
// 1. TypeScript Generator
// ----------------------------------------------------------------------
function generateTypeScript(obj: any, rootName: string, variant: string): string {
  const models: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'any';
    const type = typeof val;
    if (type === 'boolean') return 'boolean';
    if (type === 'number') return 'number';
    if (type === 'string') return 'string';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const elemType = process(val[0], singularize(name));
      return `${elemType}[]`;
    }

    if (type === 'object') {
      const clsName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `  ${safeKey}: ${fieldType};`;
      });

      if (variant === 'type') {
        models.push(`export type ${clsName} = {\n${fields.join('\n')}\n};`);
      } else {
        models.push(`export interface ${clsName} {\n${fields.join('\n')}\n}`);
      }
      return clsName;
    }

    return 'any';
  }

  process(obj, rootName);
  return Array.from(new Set(models.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 2. Python Generator (Pydantic BaseModel vs @dataclass)
// ----------------------------------------------------------------------
function generatePython(obj: any, rootName: string, variant: string): string {
  const models: string[] = [];
  const isPydantic = variant === 'pydantic';

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'Optional[Any] = None';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'string') return 'str';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      const elemType = process(val[0], singularize(name));
      return `List[${elemType}]`;
    }

    if (typeof val === 'object') {
      const clsName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const pyKey = toSnakeCase(k);
        if (isPydantic && pyKey !== k) {
          return `    ${pyKey}: ${fieldType} = Field(..., alias="${k}")`;
        }
        return `    ${pyKey}: ${fieldType}`;
      });

      if (isPydantic) {
        models.push(`class ${clsName}(BaseModel):\n${fields.join('\n') || '    pass'}`);
      } else {
        models.push(`@dataclass\nclass ${clsName}:\n${fields.join('\n') || '    pass'}`);
      }
      return clsName;
    }

    return 'Any';
  }

  process(obj, rootName);

  const header = isPydantic
    ? `from typing import List, Optional, Any\nfrom pydantic import BaseModel, Field\n\n`
    : `from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n`;

  return header + Array.from(new Set(models.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 3. Go Generator (Structs with json tags)
// ----------------------------------------------------------------------
function generateGo(obj: any, rootName: string): string {
  const structs: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'interface{}';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64';
    if (typeof val === 'string') return 'string';

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}';
      const elemType = process(val[0], singularize(name));
      return `[]${elemType}`;
    }

    if (typeof val === 'object') {
      const structName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const goFieldName = toPascalCase(k);
        return `\t${goFieldName} ${fieldType} \`json:"${k}"\``;
      });

      structs.push(`type ${structName} struct {\n${fields.join('\n')}\n}`);
      return structName;
    }

    return 'interface{}';
  }

  process(obj, rootName);

  return `package main\n\n` + Array.from(new Set(structs.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 4. Rust Generator (Serde structs)
// ----------------------------------------------------------------------
function generateRust(obj: any, rootName: string): string {
  const structs: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'Option<serde_json::Value>';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64';
    if (typeof val === 'string') return 'String';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'Vec<serde_json::Value>';
      const elemType = process(val[0], singularize(name));
      return `Vec<${elemType}>`;
    }

    if (typeof val === 'object') {
      const structName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const rustKey = toSnakeCase(k);
        const renameAttr = rustKey !== k ? `    #[serde(rename = "${k}")]\n` : '';
        return `${renameAttr}    pub ${rustKey}: ${fieldType},`;
      });

      const code = `#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct ${structName} {\n${fields.join('\n')}\n}`;
      structs.push(code);
      return structName;
    }

    return 'serde_json::Value';
  }

  process(obj, rootName);

  return `use serde::{Serialize, Deserialize};\n\n` + Array.from(new Set(structs.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 5. C# / .NET Generator
// ----------------------------------------------------------------------
function generateCSharp(obj: any, rootName: string, variant: string): string {
  const models: string[] = [];
  const isRecord = variant === 'record';

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'object?';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'long' : 'double';
    if (typeof val === 'string') return 'string';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List<object>';
      const elemType = process(val[0], singularize(name));
      return `List<${elemType}>`;
    }

    if (typeof val === 'object') {
      const clsName = sanitizeClassName(name);
      const entries = Object.entries(val);

      if (isRecord) {
        const params = entries.map(([k, v]) => {
          const fieldType = process(v, k);
          const csPropName = toPascalCase(k);
          return `    [property: JsonPropertyName("${k}")] ${fieldType} ${csPropName}`;
        });
        models.push(`public record ${clsName}(\n${params.join(',\n')}\n);`);
      } else {
        const props = entries.map(([k, v]) => {
          const fieldType = process(v, k);
          const csPropName = toPascalCase(k);
          return `    [JsonPropertyName("${k}")]\n    public ${fieldType} ${csPropName} { get; set; }`;
        });
        models.push(`public class ${clsName}\n{\n${props.join('\n\n')}\n}`);
      }
      return clsName;
    }

    return 'object';
  }

  process(obj, rootName);

  return `using System.Text.Json.Serialization;\nusing System.Collections.Generic;\n\n` + Array.from(new Set(models.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 6. Java Generator (Jackson POJO)
// ----------------------------------------------------------------------
function generateJava(obj: any, rootName: string): string {
  const classes: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'Object';
    if (typeof val === 'boolean') return 'Boolean';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Long' : 'Double';
    if (typeof val === 'string') return 'String';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List<Object>';
      const elemType = process(val[0], singularize(name));
      return `List<${elemType}>`;
    }

    if (typeof val === 'object') {
      const clsName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const fieldName = toCamelCase(k);
        return `    @JsonProperty("${k}")\n    private ${fieldType} ${fieldName};`;
      });

      const gettersSetters = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const fieldName = toCamelCase(k);
        const pasName = toPascalCase(k);
        return `    public ${fieldType} get${pasName}() { return ${fieldName}; }\n    public void set${pasName}(${fieldType} ${fieldName}) { this.${fieldName} = ${fieldName}; }`;
      });

      const code = `public class ${clsName} {\n${fields.join('\n\n')}\n\n    public ${clsName}() {}\n\n${gettersSetters.join('\n\n')}\n}`;
      classes.push(code);
      return clsName;
    }

    return 'Object';
  }

  process(obj, rootName);

  return `import com.fasterxml.jackson.annotation.JsonProperty;\nimport java.util.List;\n\n` + Array.from(new Set(classes.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 7. Kotlin Generator (data class with @SerialName)
// ----------------------------------------------------------------------
function generateKotlin(obj: any, rootName: string): string {
  const classes: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'Any?';
    if (typeof val === 'boolean') return 'Boolean';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Long' : 'Double';
    if (typeof val === 'string') return 'String';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List<Any>';
      const elemType = process(val[0], singularize(name));
      return `List<${elemType}>`;
    }

    if (typeof val === 'object') {
      const clsName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const fieldName = toCamelCase(k);
        return `    @SerialName("${k}") val ${fieldName}: ${fieldType}`;
      });

      const code = `@Serializable\ndata class ${clsName}(\n${fields.join(',\n')}\n)`;
      classes.push(code);
      return clsName;
    }

    return 'Any';
  }

  process(obj, rootName);

  return `import kotlinx.serialization.Serializable\nimport kotlinx.serialization.SerialName\n\n` + Array.from(new Set(classes.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 8. Swift Generator (Codable Structs)
// ----------------------------------------------------------------------
function generateSwift(obj: any, rootName: string): string {
  const structs: string[] = [];

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'AnyCodable?';
    if (typeof val === 'boolean') return 'Bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Int' : 'Double';
    if (typeof val === 'string') return 'String';

    if (Array.isArray(val)) {
      if (val.length === 0) return '[AnyCodable]';
      const elemType = process(val[0], singularize(name));
      return `[${elemType}]`;
    }

    if (typeof val === 'object') {
      const structName = sanitizeClassName(name);
      const fields = Object.entries(val).map(([k, v]) => {
        const fieldType = process(v, k);
        const swiftName = toCamelCase(k);
        return `    let ${swiftName}: ${fieldType}`;
      });

      const code = `struct ${structName}: Codable {\n${fields.join('\n')}\n}`;
      structs.push(code);
      return structName;
    }

    return 'AnyCodable';
  }

  process(obj, rootName);

  return `import Foundation\n\n` + Array.from(new Set(structs.reverse())).join('\n\n');
}

// ----------------------------------------------------------------------
// 9. Dart Generator (Freezed vs JsonSerializable)
// ----------------------------------------------------------------------
function generateDart(obj: any, rootName: string, variant: string): string {
  const classes: string[] = [];
  const isFreezed = variant === 'freezed';

  function process(val: any, name: string): string {
    if (val === null || val === undefined) return 'dynamic';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
    if (typeof val === 'string') return 'String';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List<dynamic>';
      const elemType = process(val[0], singularize(name));
      return `List<${elemType}>`;
    }

    if (typeof val === 'object') {
      const clsName = sanitizeClassName(name);
      const entries = Object.entries(val);

      if (isFreezed) {
        const fields = entries.map(([k, v]) => {
          const fieldType = process(v, k);
          const dartName = toCamelCase(k);
          const annotation = dartName !== k ? `    @JsonKey(name: '${k}') ` : '    ';
          return `${annotation}required ${fieldType} ${dartName},`;
        });

        const code = `@freezed\nclass ${clsName} with _$${clsName} {\n  const factory ${clsName}({\n${fields.join('\n')}\n  }) = _${clsName};\n\n  factory ${clsName}.fromJson(Map<String, dynamic> json) => _$${clsName}FromJson(json);\n}`;
        classes.push(code);
      } else {
        const fields = entries.map(([k, v]) => {
          const fieldType = process(v, k);
          const dartName = toCamelCase(k);
          return `  final ${fieldType} ${dartName};`;
        });

        const ctorParams = entries.map(([k]) => `required this.${toCamelCase(k)}`);

        const code = `@JsonSerializable()\nclass ${clsName} {\n${fields.join('\n')}\n\n  ${clsName}({${ctorParams.join(', ')}});\n\n  factory ${clsName}.fromJson(Map<String, dynamic> json) => _$${clsName}FromJson(json);\n  Map<String, dynamic> toJson() => _$${clsName}ToJson(this);\n}`;
        classes.push(code);
      }

      return clsName;
    }

    return 'dynamic';
  }

  process(obj, rootName);

  const header = isFreezed
    ? `import 'package:freezed_annotation/freezed_annotation.dart';\n\npart '${toSnakeCase(rootName)}.freezed.dart';\npart '${toSnakeCase(rootName)}.g.dart';\n\n`
    : `import 'package:json_annotation/json_annotation.dart';\n\npart '${toSnakeCase(rootName)}.g.dart';\n\n`;

  return header + Array.from(new Set(classes.reverse())).join('\n\n');
}
