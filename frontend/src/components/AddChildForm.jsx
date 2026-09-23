import { useState } from 'react'
import { createChild } from '../api/children'
import { ApiError } from '../api/client'
import './Children.css'

const currentYear = new Date().getFullYear()
// A reasonable birth-year range for the app's target ages (2-12 per the
// spec) plus a little slack on either side, rather than every year since
// 1900.
const birthYears = Array.from({ length: 15 }, (_, i) => currentYear - i)
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function AddChildForm({ tags, onChildAdded }) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(currentYear - 5)
  const [birthMonth, setBirthMonth] = useState(1)
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleTag(slug) {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const child = await createChild({
        name,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        interestTagSlugs: selectedTags,
      })
      setName('')
      setSelectedTags([])
      onChildAdded(child)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="add-child-form" onSubmit={handleSubmit}>
      <h2>Add a child</h2>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label htmlFor="childName">Name</label>
        <input
          id="childName"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="add-child-row">
        <div className="auth-field">
          <label htmlFor="birthMonth">Birth month</label>
          <select
            id="birthMonth"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
          >
            {months.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor="birthYear">Birth year</label>
          <select
            id="birthYear"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          >
            {birthYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="auth-field">
        <label>Interests (optional — helps tailor early suggestions)</label>
        <div className="tag-checkboxes">
          {tags.map((tag) => (
            <label className="tag-checkbox" key={tag.slug}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.slug)}
                onChange={() => toggleTag(tag.slug)}
              />
              {tag.displayName}
            </label>
          ))}
        </div>
      </div>

      <button className="auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add child'}
      </button>
    </form>
  )
}
