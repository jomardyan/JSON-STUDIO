import React from 'react';
import { X, KeyRound, Copy, Check, ShieldCheck, ShieldAlert, Clock, Calendar, ArrowRight } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { decodeJwt, JwtDecodeResult, verifyJwtSignature } from '../utils/jwtDecoder';

interface JwtDecoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyPayloadToEditor?: (payloadJson: string) => void;
  language?: SupportedLanguage;
}

export const JwtDecoderModal: React.FC<JwtDecoderModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyPayloadToEditor,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [jwtInput, setJwtInput] = React.useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );

  const [decoded, setDecoded] = React.useState<JwtDecodeResult | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [secretInput, setSecretInput] = React.useState<string>('your-256-bit-secret');
  const [sigStatus, setSigStatus] = React.useState<'unverified' | 'verified' | 'invalid'>('unverified');

  const handleVerifySignature = async () => {
    if (!secretInput.trim() || !jwtInput) return;
    const { verified } = await verifyJwtSignature(jwtInput, secretInput.trim());
    setSigStatus(verified ? 'verified' : 'invalid');
  };

  React.useEffect(() => {
    if (!isOpen) return;
    // Check if inputText looks like a JWT
    if (inputText && inputText.split('.').length === 3) {
      setJwtInput(inputText);
    }
  }, [isOpen, inputText]);

  React.useEffect(() => {
    if (!isOpen) return;
    const res = decodeJwt(jwtInput);
    setDecoded(res);
  }, [isOpen, jwtInput]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>JWT (JSON Web Token) Inspector & Decoder</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Client-Side Security
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Decode header, payload claims, expiration timestamps, and signature structure safely in browser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input JWT Field */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Paste JWT Token (Encoded)
          </label>
          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            className="w-full h-20 p-2.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
        </div>

        {/* Decoder Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {decoded?.error ? (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono">
              {decoded.error}
            </div>
          ) : (
            <>
              {/* Claims Overview & Expiration Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Expiration Status Badge */}
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  decoded?.isExpired
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {decoded?.isExpired ? (
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    )}
                    <div>
                      <span className="font-bold block text-xs">
                        {decoded?.isExpired ? 'Token Expired' : 'Token Active / Valid'}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {decoded?.expiresAt
                          ? `Expires: ${decoded.expiresAt.toLocaleString()}`
                          : 'No exp claim found'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issued At */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-bold block text-xs">Issued At (iat)</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {decoded?.issuedAt ? decoded.issuedAt.toLocaleString() : 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-bold block text-xs">Time Remaining</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {decoded?.timeRemainingSec !== undefined
                        ? `${Math.floor(decoded.timeRemainingSec / 60)} minutes`
                        : 'Infinite / N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid for Header & Payload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Header JSON */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                      Header: Algorithm & Token Type
                    </span>
                    <button
                      onClick={() => handleCopy(decoded?.headerString || '')}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-52 border border-zinc-800 leading-relaxed select-all">
                    {decoded?.headerString}
                  </pre>
                </div>

                {/* Payload JSON */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      Payload: Claims & Data
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(decoded?.payloadString || '')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>

                      {onApplyPayloadToEditor && decoded?.payloadString && (
                        <button
                          onClick={() => {
                            onApplyPayloadToEditor(decoded.payloadString);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded cursor-pointer transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Load in Editor</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-52 border border-zinc-800 leading-relaxed select-all">
                    {decoded?.payloadString}
                  </pre>
                </div>
              </div>

              {/* Signature display & verification */}
              <div className="p-3 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="break-all">
                    <span className="text-rose-400 font-bold mr-2">Signature:</span>
                    {decoded?.signature}
                  </div>
                  {sigStatus === 'verified' && (
                    <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {sigStatus === 'invalid' && (
                    <span className="shrink-0 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Invalid Key
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                  <input
                    type="password"
                    placeholder="Enter HMAC Secret / Public Key to verify signature..."
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    className="flex-1 bg-zinc-950 text-zinc-200 border border-zinc-700 rounded px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleVerifySignature}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Verify Signature
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            JWT signature verification requires secret key or public RSA/ECDSA key
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
