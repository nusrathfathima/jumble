import './Children.css'

export function ChildList({ childList, tags }) {
  if (childList.length === 0) {
    return <p className="status">No children added yet — add one below.</p>
  }

  const displayNameFor = (slug) => tags.find((t) => t.slug === slug)?.displayName || slug

  return (
    <ul className="children-list">
      {childList.map((child) => (
        <li className="child-card" key={child.id}>
          <div className="child-name">{child.name}</div>
          <div className="child-age">{child.age} years old</div>
          {child.interestTagSlugs.length > 0 && (
            <div className="child-tags">
              {child.interestTagSlugs.map((slug) => (
                <span className="child-tag-pill" key={slug}>
                  {displayNameFor(slug)}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
