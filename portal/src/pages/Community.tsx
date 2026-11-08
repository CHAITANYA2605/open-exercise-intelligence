import { Link } from 'react-router-dom'

const GITHUB_URL = 'https://github.com/CHAITANYA2605/open-exercise-intelligence'

const stats = [
  { label: 'Exercises', value: '866' },
  { label: 'Categories', value: '15' },
  { label: 'Open Since', value: '2026' },
  { label: 'License', value: 'CC0' },
]

const contributionWays = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    title: 'Add an Exercise',
    desc: 'Know an exercise that is missing from the dataset? Copy the template, fill in the fields, and open a Pull Request. All exercises are released CC0 — no attribution required.',
    action: 'View Template',
    href: `${GITHUB_URL}/blob/main/community/templates/exercise-submission.json`,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: 'Fix an Error',
    desc: 'Spotted an incorrect muscle mapping, a typo, or outdated information? Use the correction template to propose a fix. Even small corrections make a big difference.',
    action: 'View Correction Template',
    href: `${GITHUB_URL}/blob/main/community/templates/exercise-correction.json`,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'Contribute Media',
    desc: 'Original illustrations, anatomical diagrams, and exercise demonstrations are welcomed. We accept SVG, PNG, and video files under CC0, CC BY 4.0, or CC BY-SA 4.0.',
    action: 'View Media Template',
    href: `${GITHUB_URL}/blob/main/community/templates/media-submission.json`,
  },
]

const reviewStages = [
  { label: 'SUBMITTED', desc: 'PR opened; CI runs validate.js automatically', color: 'bg-slate-600' },
  { label: 'VALIDATING', desc: 'Automated checks pass; awaiting reviewer assignment', color: 'bg-blue-700' },
  { label: 'REVIEW_REQUIRED', desc: 'A maintainer is actively reviewing your submission', color: 'bg-yellow-700' },
  { label: 'APPROVED', desc: 'Merged into the dataset by a maintainer', color: 'bg-emerald-700' },
  { label: 'RELEASED', desc: 'Included in the next tagged dataset version', color: 'bg-indigo-700' },
]

const recentActivity = [
  {
    exercise: 'Single-Leg Romanian Deadlift',
    slug: 'single-leg-romanian-deadlift',
    category: 'strength',
    contributor: 'alex_m',
    date: '2026-11-07',
  },
  {
    exercise: 'Banded Clamshell',
    slug: 'banded-clamshell',
    category: 'rehabilitation',
    contributor: 'physio_sarah',
    date: '2026-11-05',
  },
  {
    exercise: 'Kettlebell Windmill',
    slug: 'kettlebell-windmill',
    category: 'strength',
    contributor: 'kettlebell_coach',
    date: '2026-11-03',
  },
]

export default function Community() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-300 text-sm px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open to everyone — no account required
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Join the
            <span className="text-emerald-400"> Community</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            OEI is built by developers, trainers, and fitness researchers who believe exercise knowledge should be open. Help us grow the most comprehensive free exercise dataset in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              Contribution Guide
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Open on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 border-y border-slate-800 bg-slate-800/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-1">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Ways to Contribute */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">3 Ways to Contribute</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            All contributions flow through GitHub Pull Requests. No special access required — just a GitHub account.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {contributionWays.map(({ icon, title, desc, action, href }) => (
              <div key={title} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col hover:border-emerald-600 transition-colors">
                <div className="text-emerald-400 mb-4">{icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{desc}</p>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
                >
                  {action}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines summary */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Contribution Guidelines</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Original Content Only',
                body: 'All exercise descriptions must be written in your own words. Do not copy text from copyrighted sources such as fitness websites, books, or apps. Factual information (muscle names, anatomy) is not copyrightable.',
              },
              {
                title: 'CC0 License Required',
                body: 'By submitting an exercise you release it into the public domain under CC0 1.0. This means anyone can use the data without attribution or restriction. Media assets may use CC0, CC BY 4.0, or CC BY-SA 4.0.',
              },
              {
                title: 'Accuracy Standards',
                body: 'Muscle activations should reflect current sports science consensus. If you cite sources, link to peer-reviewed research or reputable textbooks — not commercial fitness content.',
              },
              {
                title: 'Formatting Rules',
                body: 'Use slugs from the official muscle and equipment registries. Exercise names use Title Case. Slugs use lowercase-with-hyphens. Run node scripts/validate.js before submitting.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a
              href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
            >
              Read the full CONTRIBUTING.md
            </a>
          </div>
        </div>
      </section>

      {/* Review Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Review Process</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Every submission passes through a 5-stage lifecycle before it is released. Target review time is 14 days.
          </p>
          {/* Stepper */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-700" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row justify-between gap-4 relative">
              {reviewStages.map(({ label, desc, color }, i) => (
                <div key={label} className="flex flex-col items-center text-center flex-1 relative">
                  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm mb-3 z-10 ring-4 ring-slate-900`}>
                    {i + 1}
                  </div>
                  <div className="text-white text-xs font-semibold mb-1 tracking-wide">{label}</div>
                  <div className="text-slate-500 text-xs leading-relaxed max-w-[140px]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-white font-semibold mb-1">14-day SLA</div>
              <div className="text-slate-400 text-sm">Target review time for new exercises and corrections</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-white font-semibold mb-1">72-hour Priority</div>
              <div className="text-slate-400 text-sm">Critical corrections (dangerous instructions, serious errors)</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-white font-semibold mb-1">21-day Media SLA</div>
              <div className="text-slate-400 text-sm">Media submissions (licensing verification takes additional time)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Recently Approved</h2>
          <div className="space-y-3">
            {recentActivity.map(({ exercise, slug, category, contributor, date }) => (
              <div key={slug} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{exercise}</div>
                    <div className="text-slate-500 text-xs">by {contributor} · <span className="text-slate-600">{category}</span></div>
                  </div>
                </div>
                <div className="text-slate-600 text-xs">{date}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <a
              href={`${GITHUB_URL}/pulls?q=is%3Apr+is%3Amerged+label%3Aexercise`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              View all merged contributions on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to contribute?</h2>
          <p className="text-slate-400 mb-8">
            Fork the repository, copy a template, and open a Pull Request. The maintainer team reviews every submission personally.
          </p>
          <a
            href={`${GITHUB_URL}/fork`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Fork on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <span>© 2026 OEI Contributors · Data: CC0 1.0 · Code: MIT</span>
          <div className="flex gap-6">
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
