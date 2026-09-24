import { useState } from 'react'
import { getSuggestions } from '../api/suggestions'
import { recordCompletion } from '../api/completions'
import { ApiError } from '../api/client'
import './SuggestionsPanel.css'

// Rating buttons shown on each suggestion card. The value sent to the
// backend has to match the CHECK constraint on completion.rating exactly
// (LOVED | OK | SKIPPED) — see CompletionController.RecordCompletionRequest.
const RATINGS = [
  { value: 'LOVED', label: 'Loved it' },
  { value: 'OK', label: 'It was okay' },
  { value: 'SKIPPED', label: 'Skipped' },
]

export function SuggestionsPanel({ childList }) {
  const [childId, setChildId] = useState(childList[0]?.id ?? '')
  const [availableMinutes, setAvailableMinutes] = useState(30)
  const [maxMessLevel, setMaxMessLevel] = useState(3)
  const [locationType, setLocationType] = useState('EITHER')
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Keyed by activityId: 'submitting', 'done', or an error message string.
  // A plain object rather than one shared status, since several cards can
  // be in different states at once (one already rated, another mid-submit).
  const [feedbackStatus, setFeedbackStatus] = useState({})

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    setSuggestions(null)
    setFeedbackStatus({})

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

  async function handleFeedback(activityId, rating) {
    setFeedbackStatus((prev) => ({ ...prev, [activityId]: 'submitting' }))
    try {
      await recordCompletion(childId, { activityId, rating })
      setFeedbackStatus((prev) => ({ ...prev, [activityId]: 'done' }))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save that — try again.'
      setFeedbackStatus((prev) => ({ ...prev, [activityId]: message }))
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
          {suggestions.suggestions.map((s) => {
            const status = feedbackStatus[s.activityId]
            const isDone = status === 'done'
            const isSubmitting = status === 'submitting'
            const errorMessage = status && status !== 'submitting' && status !== 'done' ? status : null

            return (
              <li className="suggestion-card" key={s.activityId}>
                <div className="suggestion-title">{s.title}</div>
                <div className="suggestion-duration">{s.durationMinutes} minutes</div>
                <div className="suggestion-explanation">{s.explanation}</div>

                {isDone ? (
                  <p className="feedback-done">
                    Thanks — that&rsquo;s saved, and it&rsquo;ll shape what gets suggested next time.
                  </p>
                ) : (
                  <div className="feedback-row">
                    <span className="feedback-label">Did you try this?</span>
                    <div className="feedback-buttons">
                      {RATINGS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          className="feedback-button"
                          disabled={isSubmitting}
                          onClick={() => handleFeedback(s.activityId, r.value)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {errorMessage && <div className="auth-error suggestions-error">{errorMessage}</div>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
