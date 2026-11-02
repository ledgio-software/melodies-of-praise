/** Shown when the dashboard is opened before the database has been connected. */
export function NotConnected() {
  return (
    <div className="adm-auth">
      <div className="adm-auth__box" style={{ maxWidth: 560 }}>
        <img src="/brand/mop-emblem.png" alt="" width={64} height={64} className="adm-auth__logo" />
        <h1>Almost there</h1>
        <p>The dashboard needs its database before anyone can log in. In Vercel, open the <strong>melodies-of-praise</strong> project:</p>
        <ol>
          <li><strong>Storage → Create Database → Neon</strong> (free plan), connect it to this project.</li>
          <li><strong>Storage → Create → Blob</strong>, connect it to this project (for photo uploads).</li>
          <li><strong>Settings → Environment Variables</strong>: add <code>ADMIN_SETUP_CODE</code> with a long secret phrase only you know.</li>
          <li><strong>Deployments → Redeploy</strong>, then come back to <code>/admin/setup</code>.</li>
        </ol>
      </div>
    </div>
  );
}
