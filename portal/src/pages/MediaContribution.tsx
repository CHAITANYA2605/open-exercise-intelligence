import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

const ACCEPTED_LICENSES = [
  { spdx: 'CC0-1.0', name: 'Creative Commons Zero 1.0', preferred: true, requiresAttribution: false, copyleft: false },
  { spdx: 'Unlicense', name: 'The Unlicense', preferred: true, requiresAttribution: false, copyleft: false },
  { spdx: 'CC-BY-4.0', name: 'Creative Commons Attribution 4.0', preferred: false, requiresAttribution: true, copyleft: false },
  { spdx: 'CC-BY-SA-4.0', name: 'Creative Commons Attribution-ShareAlike 4.0', preferred: false, requiresAttribution: true, copyleft: true },
  { spdx: 'CC-BY-3.0', name: 'Creative Commons Attribution 3.0', preferred: false, requiresAttribution: true, copyleft: false },
  { spdx: 'CC-BY-2.5', name: 'Creative Commons Attribution 2.5', preferred: false, requiresAttribution: true, copyleft: false },
  { spdx: 'CC-BY-2.0', name: 'Creative Commons Attribution 2.0', preferred: false, requiresAttribution: true, copyleft: false },
  { spdx: 'Apache-2.0', name: 'Apache License 2.0 (software assets)', preferred: false, requiresAttribution: true, copyleft: false },
  { spdx: 'MIT', name: 'MIT License (software assets)', preferred: false, requiresAttribution: true, copyleft: false },
]

const NOT_ACCEPTED = [
  { label: 'Gym Visual diagrams', reason: 'Proprietary — copyright retained by Gym Visual' },
  { label: 'ExRx.net diagrams', reason: 'Proprietary — copyright retained by ExRx.net' },
  { label: 'ExerciseDB images', reason: 'License unclear / proprietary' },
  { label: 'Screenshots from fitness apps', reason: 'Proprietary — copyright retained by app developers' },
  { label: 'Watermarked stock images', reason: 'Proprietary — requires purchase of a license' },
  { label: 'CC-BY-NC-* (Non-Commercial)', reason: 'Non-commercial clause conflicts with OEI\'s open use requirements' },
  { label: 'CC-BY-ND-* (No Derivatives)', reason: 'No-derivatives clause prevents creating thumbnails or crops' },
  { label: '"Free for personal use"', reason: 'Commercial use not permitted' },
  { label: 'All Rights Reserved', reason: 'No redistribution permitted' },
]

const EXAMPLE_REGISTRY_ENTRY = `{
  "asset_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise_slug": "barbell-back-squat",
  "asset_type": "anatomical_illustration",
  "filename": "barbell-back-squat-muscles.svg",
  "url": "https://upload.wikimedia.org/wikipedia/commons/example.svg",
  "width": 800,
  "height": 600,
  "duration_seconds": null,
  "file_size_bytes": 45678,
  "mime_type": "image/svg+xml",
  "license": {
    "spdx": "CC0-1.0",
    "human_readable": "Creative Commons Zero 1.0",
    "allows_commercial_use": true,
    "requires_attribution": false,
    "attribution_text": null,
    "source_url": "https://creativecommons.org/publicdomain/zero/1.0/",
    "retrieved_at": "2026-11-08T00:00:00Z",
    "verified_by": "your-github-username",
    "verification_notes": null
  },
  "provenance": {
    "original_source": "Wikimedia Commons",
    "original_author": "ExampleAuthor",
    "original_url": "https://commons.wikimedia.org/wiki/File:example.svg",
    "modifications": [],
    "contributed_by": "your-github-username",
    "contributed_at": "2026-11-08T00:00:00Z"
  },
  "status": "pending",
  "review_notes": null
}`

export default function MediaContribution() {
  const [copiedEntry, setCopiedEntry] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(EXAMPLE_REGISTRY_ENTRY).then(() => {
      setCopiedEntry(true)
      setTimeout(() => setCopiedEntry(false), 2000)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 mb-4">
          <span className="text-indigo-400 text-xs font-medium uppercase tracking-wide">Contributing</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Contribute Media Assets</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Help OEI build the most comprehensive open exercise illustration library on the internet.
          We accept CC0, CC-BY, and other commercially compatible media assets for exercises in the dataset.
        </p>
      </div>

      {/* Preferred source callout */}
      <div className="bg-indigo-900/30 border border-indigo-500/40 rounded-xl p-5 mb-10">
        <div className="flex gap-3">
          <div className="text-2xl">🏛️</div>
          <div>
            <p className="text-indigo-300 font-semibold mb-1">Preferred Source: Wikimedia Commons</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <a
                href="https://commons.wikimedia.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Wikimedia Commons
              </a>{' '}
              hosts thousands of CC0 and CC-BY anatomical illustrations, muscle diagrams, and exercise
              photographs. It is the fastest path to a licensable exercise image. Filter by license
              after searching, or browse the{' '}
              <a
                href="https://commons.wikimedia.org/wiki/Category:Exercises"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Exercises category
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Accepted licenses */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Accepted Licenses</h2>
        <p className="text-slate-400 text-sm mb-4">
          OEI only accepts media assets with commercially compatible open licenses. CC0 is strongly
          preferred because it has no attribution requirements and no share-alike restrictions.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">SPDX Identifier</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Attribution</th>
                <th className="px-4 py-3 text-center">Share-Alike</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {ACCEPTED_LICENSES.map((lic) => (
                <tr key={lic.spdx} className="bg-slate-800/40 hover:bg-slate-800/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-indigo-300">{lic.spdx}</td>
                  <td className="px-4 py-3 text-slate-300">{lic.name}</td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {lic.requiresAttribution ? '✅ Required' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {lic.copyleft ? '⚠️ Yes' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lic.preferred ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-medium">
                        Preferred
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium">
                        Accepted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          ⚠️ CC-BY-SA-4.0 is accepted but has copyleft requirements — any derivative work must use the same license.
        </p>
      </section>

      {/* NOT accepted */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Not Accepted</h2>
        <p className="text-slate-400 text-sm mb-4">
          The following sources and license types are explicitly excluded from OEI.
          Submitting assets from these sources will result in rejection.
        </p>
        <div className="rounded-xl border border-red-900/40 overflow-hidden">
          {NOT_ACCEPTED.map((item, i) => (
            <div
              key={i}
              className={`flex gap-3 px-5 py-3.5 ${i % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/20'}`}
            >
              <span className="text-red-400 mt-0.5 flex-shrink-0">❌</span>
              <div>
                <span className="text-slate-200 font-medium">{item.label}</span>
                <span className="text-slate-500 text-sm ml-2">— {item.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to submit */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">How to Submit a Media Asset</h2>
        <ol className="space-y-6">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-slate-200 font-medium mb-1">Find a CC0-licensed asset</p>
              <p className="text-slate-400 text-sm">
                Search Wikimedia Commons, Unsplash, or Pixabay. Verify the license before proceeding.
                Screenshot the license page and note the exact URL.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-slate-200 font-medium mb-1">Add an entry to <code className="text-indigo-300 font-mono text-sm">data/media/registry.json</code></p>
              <p className="text-slate-400 text-sm mb-3">
                Generate a UUID v4 for <code className="text-indigo-300 font-mono text-xs">asset_id</code> (use{' '}
                <code className="text-indigo-300 font-mono text-xs">node -e "const c=require('crypto');console.log(c.randomUUID())"</code>).
                Fill in all required fields using the format below.
                Set <code className="text-indigo-300 font-mono text-xs">status: "pending"</code>.
              </p>
              <div className="relative">
                <CodeBlock code={EXAMPLE_REGISTRY_ENTRY} language="json" />
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors"
                >
                  {copiedEntry ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-slate-200 font-medium mb-1">Validate your entry</p>
              <p className="text-slate-400 text-sm mb-2">Run the validation script from the repo root:</p>
              <CodeBlock code="node scripts/validate-media.js --verbose" language="bash" />
              <p className="text-slate-400 text-sm mt-2">Fix any errors before opening a PR.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
            <div>
              <p className="text-slate-200 font-medium mb-1">Open a pull request</p>
              <p className="text-slate-400 text-sm">
                Submit a PR with your registry entry. Include a link to the original asset page and
                a screenshot of the license confirmation. The review team will verify the license,
                check provenance, and approve or reject within 7 days.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Review process */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Review Process</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: 'License', desc: 'SPDX identifier verified against original source page' },
            { step: 'Provenance', desc: 'Origin URL reachable, author information accurate' },
            { step: 'Quality', desc: 'Image resolution and relevance to exercise checked' },
            { step: 'Merge', desc: 'Status updated to "approved", entry appears in API' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-indigo-400 font-semibold text-sm mb-1">{i + 1}. {s.step}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Attribution Requirements</h2>
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-5">
          <p className="text-amber-300 font-medium mb-2">For CC-BY assets — attribution is mandatory</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            If your asset requires attribution (<code className="text-indigo-300 font-mono text-xs">requires_attribution: true</code>),
            you <strong>must</strong> provide both <code className="text-indigo-300 font-mono text-xs">attribution_text</code> and{' '}
            <code className="text-indigo-300 font-mono text-xs">source_url</code> in the license object.
            Missing attribution on a CC-BY asset will cause validation to fail and the PR to be rejected.
          </p>
          <p className="text-slate-400 text-sm mt-3">
            OEI auto-generates <code className="text-indigo-300 font-mono text-xs">data/media/ATTRIBUTIONS.md</code> from all approved
            CC-BY assets. This file is published alongside the dataset.
          </p>
        </div>
      </section>

      {/* Links */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/', desc: 'Preferred source for CC0 anatomical images' },
            { label: 'Creative Commons', url: 'https://creativecommons.org/licenses/', desc: 'Understand CC license versions and terms' },
            { label: 'CONTRIBUTING.md', url: 'https://github.com/CHAITANYA2605/open-exercise-intelligence/blob/main/CONTRIBUTING.md', desc: 'Full contributor guide including media section' },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-800/60 border border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 transition-colors group"
            >
              <div className="text-indigo-400 group-hover:text-indigo-300 font-medium text-sm mb-1 transition-colors">
                {link.label} →
              </div>
              <p className="text-slate-400 text-xs">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
