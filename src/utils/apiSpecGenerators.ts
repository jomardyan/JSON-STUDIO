/**
 * API & Specification Generators
 * - OpenAPI 3.0 / Swagger Schema Generator
 * - cURL to JSON & Request Snippets Generator (fetch, axios, python, go)
 * - GraphQL Schema Generator
 */

export interface OpenApiSchemaResult {
  schemaJson: string;
  schemaYaml: string;
  error?: string;
}

export interface CurlParseResult {
  extractedJson: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  snippets: {
    fetch: string;
    axios: string;
    python: string;
    go: string;
  };
  error?: string;
}

export interface GraphQLSchemaResult {
  schema: string;
  error?: string;
}

// ----------------------------------------------------------------------
// 1. OpenAPI 3.0 / Swagger Generator
// ----------------------------------------------------------------------
export function generateOpenApiSchema(
  jsonInput: string,
  typeName = 'ResponseSchema'
): OpenApiSchemaResult {
  try {
    const parsed = JSON.parse(jsonInput);

    function inferSchema(val: any): any {
      if (val === null) {
        return { type: 'string', nullable: true };
      }
      if (typeof val === 'boolean') {
        return { type: 'boolean', example: val };
      }
      if (typeof val === 'number') {
        return Number.isInteger(val)
          ? { type: 'integer', format: 'int64', example: val }
          : { type: 'number', format: 'double', example: val };
      }
      if (typeof val === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
          return { type: 'string', format: 'date-time', example: val };
        }
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return { type: 'string', format: 'email', example: val };
        }
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
          return { type: 'string', format: 'uuid', example: val };
        }
        return { type: 'string', example: val };
      }

      if (Array.isArray(val)) {
        if (val.length === 0) {
          return { type: 'array', items: { type: 'string' } };
        }
        return {
          type: 'array',
          items: inferSchema(val[0]),
        };
      }

      if (typeof val === 'object') {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [k, v] of Object.entries(val)) {
          properties[k] = inferSchema(v);
          required.push(k);
        }

        return {
          type: 'object',
          required: required.length > 0 ? required : undefined,
          properties,
        };
      }

      return { type: 'string' };
    }

    const schemaObj = {
      openapi: '3.0.3',
      info: {
        title: `${typeName} API Specification`,
        version: '1.0.0',
      },
      paths: {
        '/api/resource': {
          post: {
            summary: `Submit ${typeName}`,
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${typeName}`,
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Successful Response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: `#/components/schemas/${typeName}`,
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          [typeName]: inferSchema(parsed),
        },
      },
    };

    const schemaJson = JSON.stringify(schemaObj, null, 2);
    const schemaYaml = jsonToYaml(schemaObj);

    return { schemaJson, schemaYaml };
  } catch (err: any) {
    return { schemaJson: '', schemaYaml: '', error: err.message };
  }
}

function jsonToYaml(obj: any, indent = 0): string {
  const pad = ' '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map((item) => `${pad}- ${jsonToYaml(item, indent + 2)}`).join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          return `${pad}${k}:\n${jsonToYaml(v, indent + 2)}`;
        }
        if (Array.isArray(v)) {
          return `${pad}${k}:\n${jsonToYaml(v, indent + 2)}`;
        }
        return `${pad}${k}: ${jsonToYaml(v, indent + 2)}`;
      })
      .join('\n');
  }

  return String(obj);
}

// ----------------------------------------------------------------------
// 2. cURL Parser & Client Code Snippets
// ----------------------------------------------------------------------
export function parseCurlAndGenerateSnippets(curlString: string): CurlParseResult {
  const emptyResult: CurlParseResult = {
    extractedJson: '',
    method: 'GET',
    url: '',
    headers: {},
    snippets: { fetch: '', axios: '', python: '', go: '' },
  };

  if (!curlString || !curlString.trim()) {
    return { ...emptyResult, error: 'Please enter a valid cURL command.' };
  }

  try {
    let command = curlString.replace(/\\\n/g, ' ').trim();

    // Method
    let method = 'GET';
    const methodMatch = command.match(/-X\s+([A-Z]+)|--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = (methodMatch[1] || methodMatch[2]).toUpperCase();
    }

    // Headers
    const headers: Record<string, string> = {};
    const headerRegex = /(?:-H|--header)\s+["']?([^"']+)["']?/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(command)) !== null) {
      const parts = hMatch[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }

    // URL
    let url = 'https://api.example.com/v1/data';
    const urlMatch = command.match(/https?:\/\/[^\s"'\\]+/i);
    if (urlMatch) {
      url = urlMatch[0];
    }

    // Data / Body
    let bodyDataStr = '';
    const dataMatch = command.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?=\s+-[a-zA-Z]|\s*$)/);
    if (dataMatch) {
      bodyDataStr = dataMatch[1];
      if (method === 'GET') method = 'POST';
    } else {
      const rawDataMatch = command.match(/(?:-d|--data|--data-raw)\s+(\{[^}]+\})/);
      if (rawDataMatch) {
        bodyDataStr = rawDataMatch[1];
        if (method === 'GET') method = 'POST';
      }
    }

    let extractedJson = '';
    if (bodyDataStr) {
      try {
        const parsed = JSON.parse(bodyDataStr);
        extractedJson = JSON.stringify(parsed, null, 2);
      } catch {
        extractedJson = bodyDataStr;
      }
    }

    // Generate Snippets
    const snippets = {
      fetch: generateFetchSnippet(method, url, headers, extractedJson),
      axios: generateAxiosSnippet(method, url, headers, extractedJson),
      python: generatePythonSnippet(method, url, headers, extractedJson),
      go: generateGoSnippet(method, url, headers, extractedJson),
    };

    return {
      extractedJson,
      method,
      url,
      headers,
      snippets,
    };
  } catch (err: any) {
    return { ...emptyResult, error: `Failed to parse cURL: ${err.message}` };
  }
}

function generateFetchSnippet(method: string, url: string, headers: Record<string, string>, jsonBody: string): string {
  const filteredHeaders = { ...headers };
  delete filteredHeaders['Content-Type'];
  delete filteredHeaders['content-type'];

  const customHeaderLines = Object.entries(filteredHeaders)
    .map(([k, v]) => `    '${k}': '${v}',`)
    .join('\n');

  const headersStr = `    'Content-Type': 'application/json'${customHeaderLines ? ',\n' + customHeaderLines : ''}`;

  let bodyStr = 'null';
  if (jsonBody) {
    bodyStr = jsonBody;
  }

  return `const response = await fetch('${url}', {
  method: '${method}',
  headers: {
${headersStr}
  },
  body: ${bodyStr !== 'null' ? `JSON.stringify(${bodyStr})` : 'null'}
});

const data = await response.json();
console.log(data);`;
}

function generateAxiosSnippet(method: string, url: string, headers: Record<string, string>, jsonBody: string): string {
  return `import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 4)},
  data: ${jsonBody || 'null'}
});

console.log(response.data);`;
}

function generatePythonSnippet(method: string, url: string, headers: Record<string, string>, jsonBody: string): string {
  let pyPayload = 'None';
  if (jsonBody) {
    try {
      const parsed = JSON.parse(jsonBody);
      pyPayload = JSON.stringify(parsed, null, 4)
        .replace(/\btrue\b/g, 'True')
        .replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b/g, 'None');
    } catch {
      pyPayload = `"${jsonBody.replace(/"/g, '\\"')}"`;
    }
  }

  return `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
payload = ${pyPayload}

response = requests.${method.toLowerCase()}(
    url,
    headers=headers,
    json=payload
)

print(response.json())`;
}

function generateGoSnippet(method: string, url: string, headers: Record<string, string>, jsonBody: string): string {
  return `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "${url}"
	var jsonBody = []byte(\`${jsonBody || ''}\`)

	req, err := http.NewRequest("${method}", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
}

// ----------------------------------------------------------------------
// 3. GraphQL Schema Generator
// ----------------------------------------------------------------------
export function generateGraphQLSchema(
  jsonInput: string,
  rootTypeName = 'User'
): GraphQLSchemaResult {
  try {
    const parsed = JSON.parse(jsonInput);
    const typesMap: Map<string, string> = new Map();

    function sanitizeName(name: string): string {
      const clean = name.replace(/[^a-zA-Z0-9_$]/g, '');
      if (!clean) return 'Type';
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    function singularize(str: string): string {
      if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
      if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
      return str;
    }

    function inferFieldType(val: any, fieldName: string): string {
      if (val === null || val === undefined) return 'String';

      if (fieldName.toLowerCase() === 'id' || fieldName.toLowerCase() === '_id') {
        return 'ID!';
      }

      if (typeof val === 'boolean') return 'Boolean!';
      if (typeof val === 'number') return Number.isInteger(val) ? 'Int!' : 'Float!';
      if (typeof val === 'string') return 'String!';

      if (Array.isArray(val)) {
        if (val.length === 0) return '[String!]!';
        const elemType = inferFieldType(val[0], singularize(fieldName));
        return `[${elemType}]!`;
      }

      if (typeof val === 'object') {
        const typeName = sanitizeName(fieldName);
        generateObjectType(val, typeName);
        return `${typeName}!`;
      }

      return 'String!';
    }

    function generateObjectType(obj: any, typeName: string) {
      if (typesMap.has(typeName)) return;

      const fields: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        const gqlType = inferFieldType(v, k);
        fields.push(`  ${k}: ${gqlType}`);
      }

      const typeDef = `type ${typeName} {\n${fields.join('\n')}\n}`;
      typesMap.set(typeName, typeDef);
    }

    const rootName = sanitizeName(rootTypeName);

    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        generateObjectType(parsed[0], rootName);
      } else {
        generateObjectType({ id: '1' }, rootName);
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      generateObjectType(parsed, rootName);
    } else {
      return { schema: '', error: 'Root JSON must be an object or an array of objects.' };
    }

    const allTypes = Array.from(typesMap.values()).join('\n\n');
    const queryType = `type Query {\n  get${rootName}(id: ID!): ${rootName}\n  list${rootName}s: [${rootName}!]!\n}`;

    const fullSchema = `${allTypes}\n\n${queryType}`;

    return { schema: fullSchema };
  } catch (err: any) {
    return { schema: '', error: `GraphQL schema inference error: ${err.message}` };
  }
}
