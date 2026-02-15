import { useState } from 'react'
import type { ServiceEntry, ServiceCategory } from '../types'
import { AmbientBackground } from '../components/AmbientBackground'

const CATEGORIES: ServiceCategory[] = [
  'Travel',
  'Health',
  'Beauty / Wellness',
  'Shopping',
  'Finance',
  'Daily Life',
  'Special Occasions',
]

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  'Travel': '#60A5FA',
  'Health': '#34D399',
  'Beauty / Wellness': '#FB7185',
  'Shopping': '#FBBF24',
  'Finance': '#A78BFA',
  'Daily Life': '#FB923C',
  'Special Occasions': '#2DD4BF',
}

interface ServicesDirectoryProps {
  services: ServiceEntry[]
  onBack: () => void
}

export function ServicesDirectory({ services, onBack }: ServicesDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All')

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory)

  const grouped = CATEGORIES
    .filter(cat => activeCategory === 'All' || cat === activeCategory)
    .map(cat => ({
      category: cat,
      entries: filtered.filter(s => s.category === cat),
    }))
    .filter(g => g.entries.length > 0)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AmbientBackground palette="violet" isActive={false} />

      <div className="content-layer flex flex-col h-full">
        {/* Header */}
        <header className="px-8 pt-6 pb-4 border-b border-[--color-border]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[--color-surface-raised] hover:bg-[--color-surface-elevated] transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-label mb-1">Directory</p>
              <h1 className="text-2xl text-headline text-[--color-text]">Services</h1>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('All')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer
                ${activeCategory === 'All'
                  ? 'bg-[--color-surface-elevated] text-[--color-text]'
                  : 'text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-surface]/50'
                }
              `}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer
                  ${activeCategory === cat
                    ? 'bg-[--color-surface-elevated] text-[--color-text]'
                    : 'text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-surface]/50'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Table Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            {grouped.map(({ category, entries }) => (
              <section key={category} className="mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <h2 className="text-lg font-semibold text-[--color-text]">
                    {category}
                  </h2>
                  <span className="text-xs text-[--color-text-subtle]">
                    {entries.length} {entries.length === 1 ? 'service' : 'services'}
                  </span>
                </div>

                <div className="rounded-xl border border-[--color-border] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[--color-surface]/60">
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Service</th>
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Contact</th>
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Access</th>
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Notes</th>
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Agent</th>
                        <th className="text-left px-4 py-3 text-[--color-text-muted] font-semibold text-xs uppercase tracking-wide">Check-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <tr
                          key={entry.id}
                          className={`
                            border-t border-[--color-border-subtle]
                            hover:bg-[--color-surface-raised]/40 transition-colors
                            ${i % 2 === 0 ? '' : 'bg-[--color-surface]/20'}
                          `}
                        >
                          <td className="px-4 py-3 text-[--color-text] font-medium">{entry.serviceName}</td>
                          <td className="px-4 py-3 text-[--color-text-secondary]">{entry.contactInfo}</td>
                          <td className="px-4 py-3 text-[--color-text-secondary]">{entry.apiAccessDetails}</td>
                          <td className="px-4 py-3 text-[--color-text-muted]">{entry.notes}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[entry.category as ServiceCategory]}20`,
                                color: CATEGORY_COLORS[entry.category as ServiceCategory],
                              }}
                            >
                              {entry.assignedAgent}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[--color-text-subtle] text-xs">{entry.checkInFrequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
