'use client'

import { useState } from 'react'
import { api, type ProspectSearchRequest, type ProspectSearchResult } from '@/lib/api'

export default function ProspectSearch() {
  const [filters, setFilters] = useState<ProspectSearchRequest>({
    bransch: '',
    region: '',
    min_anstallda: undefined,
    max_anstallda: undefined,
    min_omsattning_msek: undefined,
    max_omsattning_msek: undefined,
    max_results: 20,
  })

  const [results, setResults] = useState<ProspectSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingProspect, setAddingProspect] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.ai.prospectSearch(filters)
      setResults(response.prospects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPipeline = async (prospect: ProspectSearchResult) => {
    setAddingProspect(prospect.name)
    try {
      await api.prospects.create({
        name: prospect.name,
        industry: filters.bransch || 'unknown',
        revenue_msek: prospect.revenue_msek,
        employees: prospect.employees,
        profitability: 'unknown',
        tech_stack: [],
        website: prospect.allabolag_url || null,
      })
      alert(`${prospect.name} har lagts till i pipeline!`)
    } catch (err) {
      alert(`Kunde inte lägga till: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setAddingProspect(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sök Prospects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bransch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bransch
            </label>
            <select
              value={filters.bransch}
              onChange={(e) => setFilters({ ...filters, bransch: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alla branscher</option>
              <option value="IT">IT</option>
              <option value="Bygg">Bygg</option>
              <option value="Logistik">Logistik</option>
              <option value="E-handel">E-handel</option>
              <option value="Bemanning">Bemanning</option>
              <option value="Fastighet">Fastighet</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <input
              type="text"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              placeholder="t.ex. Stockholm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Anställda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Anställda
            </label>
            <input
              type="number"
              value={filters.min_anstallda || ''}
              onChange={(e) => setFilters({ ...filters, min_anstallda: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="t.ex. 20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Anställda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Anställda
            </label>
            <input
              type="number"
              value={filters.max_anstallda || ''}
              onChange={(e) => setFilters({ ...filters, max_anstallda: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="t.ex. 200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Omsättning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Omsättning (MSEK)
            </label>
            <input
              type="number"
              value={filters.min_omsattning_msek || ''}
              onChange={(e) => setFilters({ ...filters, min_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="t.ex. 50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Omsättning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Omsättning (MSEK)
            </label>
            <input
              type="number"
              value={filters.max_omsattning_msek || ''}
              onChange={(e) => setFilters({ ...filters, max_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="t.ex. 300"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Söker...' : 'Sök Prospects'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Hittade {results.length} prospects
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((prospect, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{prospect.name}</h4>
                  {prospect.has_gasell && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🏆 Gasell
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {prospect.revenue_msek && (
                    <p>💰 Omsättning: {prospect.revenue_msek.toFixed(1)} MSEK</p>
                  )}
                  {prospect.employees && (
                    <p>👥 Anställda: {prospect.employees}</p>
                  )}
                  {prospect.address && (
                    <p>📍 {prospect.address}</p>
                  )}
                </div>

                <button
                  onClick={() => handleAddToPipeline(prospect)}
                  disabled={addingProspect === prospect.name}
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingProspect === prospect.name ? 'Lägger till...' : 'Lägg till i pipeline'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">
          Inga resultat ännu. Använd filtren ovan för att söka efter prospects.
        </div>
      )}
    </div>
  )
}
