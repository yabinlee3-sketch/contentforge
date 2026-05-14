export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-zinc-300">
        <p><strong>Last updated:</strong> May 14, 2026</p>

        <h2 className="text-xl font-semibold text-white mt-8">1. What We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Content you submit</strong> (text or URL content) — sent to DeepSeek API for processing. Not stored on our servers.</li>
          <li><strong>Usage data</strong> (generation count) — stored in your browser via localStorage.</li>
          <li><strong>Anonymous analytics</strong> via Plausible — page views only, no personal data, no cookies.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">2. What We Don&apos;t Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No accounts or passwords</li>
          <li>No cookies for tracking</li>
          <li>No IP logging</li>
          <li>No personal information (unless you email us)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">3. AI Processing</h2>
        <p>Your content is sent to DeepSeek API for generation. DeepSeek&apos;s privacy policy applies to your content during processing. We do not store, log, or retain the content you submit.</p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Data Retention</h2>
        <p>We do not store your content or generated results. LocalStorage usage counters can be cleared by clearing your browser data.</p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Third Parties</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>DeepSeek</strong> — AI processing (China-based, see <a href="https://platform.deepseek.com/privacy" className="text-amber-400 hover:underline">their policy</a>)</li>
          <li><strong>LemonSqueezy</strong> — Payment processing (see <a href="https://www.lemonsqueezy.com/privacy" className="text-amber-400 hover:underline">their policy</a>)</li>
          <li><strong>Plausible</strong> — Analytics (cookie-free, privacy-first)</li>
          <li><strong>Vercel</strong> — Hosting (see <a href="https://vercel.com/legal/privacy-policy" className="text-amber-400 hover:underline">their policy</a>)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">6. GDPR</h2>
        <p>If you are in the EU, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your data (we have very little to share)</li>
          <li>Request deletion</li>
          <li>Object to processing</li>
        </ul>
        <p>Email <a href="mailto:contentforge@proton.me" className="text-amber-400 hover:underline">contentforge@proton.me</a> for any requests.</p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Contact</h2>
        <p>Email: <a href="mailto:contentforge@proton.me" className="text-amber-400 hover:underline">contentforge@proton.me</a></p>
      </div>
    </div>
  );
}
