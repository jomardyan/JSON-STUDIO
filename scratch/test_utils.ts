import { createRfc6902Patch, applyRfc6902Patch, createMergePatch, applyMergePatch } from '../src/utils/jsonPatchEngine';
import { evaluateJq } from '../src/utils/jqEngine';
import { decodeJwt } from '../src/utils/jwtDecoder';
import { profileJsonPayload } from '../src/utils/jsonProfiler';
import { generateCodeModel, TargetLanguage } from '../src/utils/codeGenerators';
import { generateOpenApiSchema, parseCurlAndGenerateSnippets, generateGraphQLSchema } from '../src/utils/apiSpecGenerators';
import {
  detectFormat, validateJson, repairJson, sortJsonKeys,
  jsonToCsv, csvToJson, jsonToXml, xmlToJson, jsonToYaml,
  sqlToJson, jsonToSql, jsonToHtmlTable, jsonToUrlEncoded, urlEncodedToJson,
  jsonToProperties, propertiesToJson, jsonToToml, tomlToJson,
  jsonToMarkdownTable, markdownTableToJson, jsonToNdjson, ndjsonToJson,
  jsonToPythonDict, jsonToPhpArray, convertAnyFormat, convertKeyCase,
  maskSensitiveData, queryJsonPath, diffJsonObjects
} from '../src/utils/jsonUtils';

console.log("=== EXPANDED ALL UTILS FUNCTIONALITY TEST ===");
let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`, detail !== undefined ? detail : '');
    failed++;
  }
}

const testObj = {
  user_id: 42,
  user_name: 'Alice Smith',
  user_email: 'alice@example.com',
  is_admin: true,
  scores: [95, 88, 100],
  address: { city: 'New York', zip: '10001' }
};
const testJsonStr = JSON.stringify(testObj, null, 2);

// 1. Format Conversions
console.log("\n--- Testing Format Conversions ---");
try {
  const csv = jsonToCsv([testObj]);
  assert(csv.includes('user_name') && csv.includes('Alice Smith'), 'jsonToCsv', csv);

  const csvBack = csvToJson(csv);
  assert(Array.isArray(csvBack) && csvBack.length === 1 && csvBack[0].user_name === 'Alice Smith', 'csvToJson', csvBack);

  const xml = jsonToXml(testObj);
  assert(xml.includes('<user_name>Alice Smith</user_name>'), 'jsonToXml', xml);

  const xmlBack = xmlToJson(xml);
  assert(xmlBack !== null, 'xmlToJson', xmlBack);

  const yaml = jsonToYaml(testJsonStr);
  assert(!yaml.error && yaml.result.includes('user_name: Alice Smith'), 'jsonToYaml', yaml);

  const toml = jsonToToml(testJsonStr);
  assert(!toml.error && toml.result.includes('user_name = "Alice Smith"'), 'jsonToToml', toml);

  const tomlBack = tomlToJson(toml.result);
  assert(!tomlBack.error && tomlBack.result.includes('Alice Smith'), 'tomlToJson', tomlBack);

  const sql = jsonToSql(testJsonStr);
  assert(!sql.error && sql.result.includes('INSERT INTO'), 'jsonToSql', sql);

  const html = jsonToHtmlTable(testJsonStr);
  assert(!html.error && html.result.includes('<table'), 'jsonToHtmlTable', html);

  const urlEnc = jsonToUrlEncoded(testJsonStr);
  assert(!urlEnc.error && urlEnc.result.includes('user_name=Alice+Smith'), 'jsonToUrlEncoded', urlEnc);

  const urlEncBack = urlEncodedToJson(urlEnc.result);
  assert(!urlEncBack.error && urlEncBack.result.includes('Alice Smith'), 'urlEncodedToJson', urlEncBack);

  const props = jsonToProperties(testJsonStr);
  assert(!props.error && props.result.includes('user_name=Alice Smith'), 'jsonToProperties', props);

  const propsBack = propertiesToJson(props.result);
  assert(!propsBack.error && propsBack.result.includes('Alice Smith'), 'propertiesToJson', propsBack);

  const mdTable = jsonToMarkdownTable(JSON.stringify([testObj]));
  assert(!mdTable.error && mdTable.result.includes('| user_name |'), 'jsonToMarkdownTable', mdTable);

  const mdTableBack = markdownTableToJson(mdTable.result);
  assert(!mdTableBack.error && mdTableBack.result.includes('Alice Smith'), 'markdownTableToJson', mdTableBack);

  const ndjson = jsonToNdjson(JSON.stringify([testObj, testObj]));
  assert(!ndjson.error && ndjson.result.split('\n').length === 2, 'jsonToNdjson', ndjson);

  const ndjsonBack = ndjsonToJson(ndjson.result);
  assert(!ndjsonBack.error && ndjsonBack.result.includes('Alice Smith'), 'ndjsonToJson', ndjsonBack);

  const pyDict = jsonToPythonDict(testJsonStr);
  assert(!pyDict.error && pyDict.result.includes('"user_name": "Alice Smith"'), 'jsonToPythonDict', pyDict);

  const phpArr = jsonToPhpArray(testJsonStr);
  assert(!phpArr.error && phpArr.result.includes("'user_name' => 'Alice Smith'"), 'jsonToPhpArray', phpArr);
} catch (e) {
  assert(false, 'Format Conversions Exception', e);
}

// 2. High level convertAnyFormat & Transformations
console.log("\n--- Testing High-Level Utilities & Transformations ---");
try {
  const convRes = convertAnyFormat(testJsonStr, 'json', 'csv');
  assert(!convRes.error && convRes.result.includes('Alice Smith'), 'convertAnyFormat JSON to CSV', convRes);

  const camelKeyRes = convertKeyCase(testJsonStr, 'camel');
  assert(!camelKeyRes.error && camelKeyRes.result.includes('userName'), 'convertKeyCase to camelCase', camelKeyRes);

  const snakeKeyRes = convertKeyCase(camelKeyRes.result, 'snake');
  assert(!snakeKeyRes.error && snakeKeyRes.result.includes('user_name'), 'convertKeyCase to snake_case', snakeKeyRes);

  const masked = maskSensitiveData(testJsonStr);
  assert(!masked.error && masked.result.includes('"user_email": "***REDACTED***"'), 'maskSensitiveData masks email', masked);

  const queryRes = queryJsonPath(testJsonStr, '$.address.city', 2);
  assert(queryRes.result.includes('New York'), 'queryJsonPath $.address.city', queryRes);

  const diffRes = diffJsonObjects(testJsonStr, JSON.stringify({ ...testObj, user_name: 'Alice Brown' }));
  assert(diffRes.modifiedKeys.length > 0, 'diffJsonObjects detects difference', diffRes);
} catch (e) {
  assert(false, 'Transformations Exception', e);
}

console.log(`\nFinal Summary: ${passed} Passed, ${failed} Failed.`);
