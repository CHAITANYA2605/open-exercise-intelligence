import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export default function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {title && (
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <span className="text-slate-400 text-xs font-medium">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">{language}</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-slate-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      <div className="relative">
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-slate-700 z-10"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <pre className="bg-slate-950 p-4 overflow-x-auto text-sm text-slate-200 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
