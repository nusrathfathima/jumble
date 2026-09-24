import { useState } from 'react'
import { getSuggestions } from '../api/suggestions'
import { ApiError } from '../api/client'
import './SuggestionsPanel.css'

export function SuggestionsPanel({ childList }) {
  const [childId, setChildId] = useState(childList[0]?.id ?? '')
  const [availableMinutes, setAvailableMinutes] = useState(30)
  const [maxMessLevel, setMaxMessLevel] = useState(3)
  const [locationType, setLocationType] = useState('EITHER')
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    setSuggestions(null)

    try {
      const result = await getSuggestions(childId, {
        availableMinutes: Number(availableMinutes),
        maxMessLevel: Number(maxMessLevel),
        locationType,
      })
      setSuggestions(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not get suggestions right now.')
    } finally {
      setLoading(false)
    }
  }

  if (childList.length === 0) {
    return null
  }

  return (
    <div className="suggestions-section">
      <h2>Get a suggestion</h2>

      <form onSubmit={handleSubmit}>
        <div className="suggestions-form-row">
          <div className="auth-field">
            <label htmlFor="suggestChild">For</label>
            <select id="suggestChild" value={childId} onChange={(e) => setChildId(e.target.value)}>
              {childList.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="availableMinutes">Minutes available</label>
            <input
              id="availableMinutes"
              type="number"
              min="1"
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(e.target.value)}
            />
          </div>
        </div>

        <div className="suggestions-form-row suggestions-form-row-spaced">
          <div className="auth-field">
            <label htmlFor="maxMessLevel">Mess tolerance</label>
            <select id="maxMessLevel" value={maxMessLevel} onChange={(e) => setMaxMessLevel(e.target.value)}>
              <option value={1}>Low mess only</option>
              <option value={2}>Some mess okay</option>
              <option value={3}>Any mess level</option>
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="locationType">Where</label>
            <select id="locationType" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
              <option value="EITHER">No preference</option>
              <option value="INDOOR">Indoor</option>
              <option value="OUTDOOR">Outdoor</option>
            </select>
          </div>
        </div>

        <button className="auth-submit suggestions-submit" type="submit" disabled={loading}>
          {loading ? 'Finding ideas…' : 'Get a suggestion'}
        </button>
      </form>

      {error && <div className="auth-error suggestions-error">{error}</div>}

      {suggestions && suggestions.suggestions.length === 0 && (
        <div className="suggestions-empty-block">
          <p className="suggestions-empty">
            Nothing matched those constraints exactly. Try more time, a higher mess tolerance, or a different
            location.
          </p>

          {suggestions.nearMisses.length > 0 && (
            <div className="near-misses">
              <p className="near-misses-heading">You&rsquo;re close on a few — just missing some materials:</p>
              <ul className="near-misses-list">
                {suggestions.nearMisses.map((nm) => (
                  <li className="near-miss-card" key={nm.activityId}>
                    <div className="near-miss-title">{nm.title}</div>
                    <div className="near-miss-duration">{nm.durationMinutes} minutes</div>
                    <div className="near-miss-missing">
                      Missing: {nm.missingMaterials.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {suggestions && suggestions.suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.suggestions.map((s) => (
            <li className="suggestion-card" key={s.activityId}>
              <div className="suggestion-title">{s.title}</div>
              <div className="suggestion-duration">{s.durationMinutes} minutes</div>
              <div className="suggestion-explanation">{s.explanation}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
