/** Success / error message passed back from a form action via ?ok= / ?error=. */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <div className="notice notice--err adm-flash" role="alert">{error}</div>;
  if (ok) return <div className="notice notice--ok adm-flash" role="status">{ok}</div>;
  return null;
}

export type FlashParams = Promise<{ ok?: string; error?: string; [k: string]: string | undefined }>;
