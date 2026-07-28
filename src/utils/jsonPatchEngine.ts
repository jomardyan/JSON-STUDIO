import * as jsonpatch from 'fast-json-patch';

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export interface JsonPatchResult {
  patchOps: PatchOperation[];
  patchString: string;
  error?: string;
}

export interface ApplyPatchResult {
  resultDocument: any;
  resultString: string;
  error?: string;
}

/**
 * Generates RFC 6902 JSON Patch operations array from docA to docB.
 */
export function createRfc6902Patch(jsonA: string, jsonB: string): JsonPatchResult {
  try {
    const docA = JSON.parse(jsonA);
    const docB = JSON.parse(jsonB);

    const observer = jsonpatch.generate(docA, docB);

    return {
      patchOps: observer as PatchOperation[],
      patchString: JSON.stringify(observer, null, 2),
    };
  } catch (err: any) {
    return {
      patchOps: [],
      patchString: '[]',
      error: `JSON Patch generation error: ${err.message}`,
    };
  }
}

/**
 * Applies RFC 6902 JSON Patch operations to a target JSON document.
 */
export function applyRfc6902Patch(targetJson: string, patchJson: string): ApplyPatchResult {
  try {
    const doc = JSON.parse(targetJson);
    const patchOps = JSON.parse(patchJson);

    if (!Array.isArray(patchOps)) {
      return {
        resultDocument: doc,
        resultString: targetJson,
        error: 'JSON Patch operations must be a JSON array of objects with op & path.',
      };
    }

    const res = jsonpatch.applyPatch(doc, patchOps, true, false);

    return {
      resultDocument: res.newDocument,
      resultString: JSON.stringify(res.newDocument, null, 2),
    };
  } catch (err: any) {
    return {
      resultDocument: null,
      resultString: '',
      error: `Failed to apply RFC 6902 Patch: ${err.message}`,
    };
  }
}

/**
 * Generates RFC 7386 JSON Merge Patch object.
 */
export function createMergePatch(jsonA: string, jsonB: string): { mergePatchObj: any; patchString: string; error?: string } {
  try {
    const docA = JSON.parse(jsonA);
    const docB = JSON.parse(jsonB);

    function diff(a: any, b: any): any {
      if (typeof b !== 'object' || b === null || Array.isArray(b) || typeof a !== 'object' || a === null || Array.isArray(a)) {
        return b;
      }

      const patch: Record<string, any> = {};

      for (const key of Object.keys(b)) {
        if (!(key in a)) {
          patch[key] = b[key];
        } else {
          const subPatch = diff(a[key], b[key]);
          if (subPatch !== undefined) {
            patch[key] = subPatch;
          }
        }
      }

      for (const key of Object.keys(a)) {
        if (!(key in b)) {
          patch[key] = null; // RFC 7386 null indicates deletion
        }
      }

      return patch;
    }

    const mergePatchObj = diff(docA, docB);

    return {
      mergePatchObj,
      patchString: JSON.stringify(mergePatchObj, null, 2),
    };
  } catch (err: any) {
    return {
      mergePatchObj: null,
      patchString: '{}',
      error: `Merge Patch generation error: ${err.message}`,
    };
  }
}

/**
 * Applies RFC 7386 JSON Merge Patch to target JSON document.
 */
export function applyMergePatch(targetJson: string, mergePatchJson: string): ApplyPatchResult {
  try {
    const doc = JSON.parse(targetJson);
    const patch = JSON.parse(mergePatchJson);

    function merge(target: any, patchObj: any): any {
      if (typeof patchObj !== 'object' || patchObj === null || Array.isArray(patchObj)) {
        return patchObj;
      }

      if (typeof target !== 'object' || target === null || Array.isArray(target)) {
        target = {};
      }

      for (const [key, val] of Object.entries(patchObj)) {
        if (val === null) {
          delete target[key];
        } else {
          target[key] = merge(target[key], val);
        }
      }

      return target;
    }

    const newDoc = merge(doc, patch);

    return {
      resultDocument: newDoc,
      resultString: JSON.stringify(newDoc, null, 2),
    };
  } catch (err: any) {
    return {
      resultDocument: null,
      resultString: '',
      error: `Failed to apply Merge Patch: ${err.message}`,
    };
  }
}
