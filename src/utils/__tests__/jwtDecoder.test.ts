import { describe, expect, it } from 'vitest';
import { decodeJwt, verifyJwtSignature } from '../jwtDecoder';

function encode(value: unknown): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

describe('JWT decoding and verification guardrails', () => {
  it('does not describe an expired-at-current-second token as active', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: '1', exp: now })}.signature`;

    expect(decodeJwt(token).isExpired).toBe(true);
  });

  it('rejects non-object claims', () => {
    const token = `${encode({ alg: 'HS256' })}.${encode(['not', 'claims'])}.signature`;

    const result = decodeJwt(token);
    expect(result.isValidStructure).toBe(false);
    expect(result.error).toContain('payload must be a JSON object');
  });

  it('does not verify unsupported algorithms as if they were HS256', async () => {
    const token = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ sub: '1' })}.signature`;

    const result = await verifyJwtSignature(token, 'secret');
    expect(result.verified).toBe(false);
    expect(result.error).toContain('Unsupported JWT algorithm');
  });
});
