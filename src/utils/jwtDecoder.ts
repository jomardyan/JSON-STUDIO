/**
 * JWT (JSON Web Token) Decoder Utility
 */

export interface JwtDecodeResult {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  signature: string;
  headerString: string;
  payloadString: string;
  isExpired: boolean;
  isValidStructure: boolean;
  issuedAt?: Date;
  expiresAt?: Date;
  notBefore?: Date;
  timeRemainingSec?: number;
  error?: string;
}

export function decodeJwt(token: string): JwtDecodeResult {
  const empty: JwtDecodeResult = {
    header: null,
    payload: null,
    signature: '',
    headerString: '',
    payloadString: '',
    isExpired: false,
    isValidStructure: false,
  };

  const trimmed = token.trim();
  if (!trimmed) {
    return { ...empty, error: 'Please enter or paste a JWT token.' };
  }

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return {
      ...empty,
      error: 'Invalid JWT structure. A standard JWT must contain 3 dot-separated parts (Header.Payload.Signature).',
    };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const payloadStr = base64UrlDecode(parts[1]);
    const signature = parts[2];

    const header = JSON.parse(headerStr);
    const payload = JSON.parse(payloadStr);

    let isExpired = false;
    let issuedAt: Date | undefined;
    let expiresAt: Date | undefined;
    let notBefore: Date | undefined;
    let timeRemainingSec: number | undefined;

    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && typeof payload.exp === 'number') {
      expiresAt = new Date(payload.exp * 1000);
      if (payload.exp < nowSec) {
        isExpired = true;
        timeRemainingSec = 0;
      } else {
        timeRemainingSec = payload.exp - nowSec;
      }
    }

    if (payload.iat && typeof payload.iat === 'number') {
      issuedAt = new Date(payload.iat * 1000);
    }

    if (payload.nbf && typeof payload.nbf === 'number') {
      notBefore = new Date(payload.nbf * 1000);
    }

    return {
      header,
      payload,
      signature,
      headerString: JSON.stringify(header, null, 2),
      payloadString: JSON.stringify(payload, null, 2),
      isExpired,
      isValidStructure: true,
      issuedAt,
      expiresAt,
      notBefore,
      timeRemainingSec,
    };
  } catch (err: any) {
    return {
      ...empty,
      error: `Failed to decode JWT claims: ${err.message}`,
    };
  }
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}
