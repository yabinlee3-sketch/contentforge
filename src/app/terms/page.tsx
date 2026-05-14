export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-zinc-300">
        <p><strong>Last updated:</strong> May 14, 2026</p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance</h2>
        <p>By using ContentForge ("the Service"), you agree to these Terms. If you do not agree, do not use the Service.</p>

        <h2 className="text-xl font-semibold text-white mt-8">2. The Service</h2>
        <p>ContentForge provides AI-powered content repurposing. You input content (text or URL), and we generate platform-specific versions using AI.</p>

        <h2 className="text-xl font-semibold text-white mt-8">3. User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>You are responsible for the content you submit.</li>
          <li>Do not submit illegal, infringing, or harmful content.</li>
          <li>You must comply with applicable laws when using AI-generated content.</li>
          <li>You are responsible for reviewing and editing AI-generated output before publishing.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">4. Intellectual Property</h2>
        <p>You retain all rights to content you submit. AI-generated output is yours to use as you see fit. We do not claim ownership of your content or the generated output.</p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Payments & Subscriptions</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pro plan: $9/month, billed via LemonSqueezy.</li>
          <li>You can cancel anytime. Access continues until the end of the billing period.</li>
          <li>Refunds are handled on a case-by-case basis. Contact contentforge@proton.me.</li>
          <li>Prices may change with 30 days notice.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">6. Limitation of Liability</h2>
        <p>The Service is provided "as is" without warranties. We are not liable for damages arising from use of the Service or AI-generated content. AI outputs may contain inaccuracies — always review before publishing.</p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Changes</h2>
        <p>We may update these Terms. Continued use after changes constitutes acceptance.</p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Contact</h2>
        <p>Email: <a href="mailto:contentforge@proton.me" className="text-amber-400 hover:underline">contentforge@proton.me</a></p>
      </div>
    </div>
  );
}
