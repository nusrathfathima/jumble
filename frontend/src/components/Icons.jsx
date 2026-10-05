// Small line icons drawn inline, so they inherit the text colour around
// them (currentColor) and need no icon library. All share one 24x24 grid
// and stroke style, which keeps them looking like one set.

function Icon({ size = 24, strokeWidth = 2, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const HouseIcon = (p) => (
  <Icon {...p}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Icon>
)

export const TreeIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v6M9 21h6" />
  </Icon>
)

export const EitherIcon = (p) => (
  <Icon {...p}>
    <path d="M7 7h12l-3-3" />
    <path d="M17 17H5l3 3" />
  </Icon>
)

export const TidyIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </Icon>
)

export const DropIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" />
  </Icon>
)

export const SplatIcon = (p) => (
  <Icon {...p}>
    <circle cx="8" cy="9" r="3" />
    <circle cx="16.5" cy="7.5" r="2" />
    <circle cx="14" cy="16" r="4" />
  </Icon>
)

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)

export const SmileIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" />
  </Icon>
)

export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const SettingsIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icon>
)

export const CloudRainIcon = (p) => (
  <Icon {...p}>
    <path d="M7 15a4 4 0 1 1 .8-7.9A5 5 0 0 1 17.5 8 3.5 3.5 0 0 1 17 15H7z" />
    <path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2" />
  </Icon>
)

export const CloudIcon = (p) => (
  <Icon {...p}>
    <path d="M7 18a4 4 0 1 1 .8-7.9A5 5 0 0 1 17.5 11 3.5 3.5 0 0 1 17 18H7z" />
  </Icon>
)

export const BackIcon = (p) => (
  <Icon {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
)

export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const LocationIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
)

// Activity thumbnail icons. Picked from the activity id until real
// activity images exist, so each activity keeps the same one.
const PlaneIcon = (p) => (
  <Icon {...p}>
    <path d="M3 11l18-7-7 18-3-8-8-3z" />
    <path d="M11 14l4-4" />
  </Icon>
)
const StarIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </Icon>
)
const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icon>
)
const BookIcon = (p) => (
  <Icon {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
    <path d="M19 19v2H6" />
  </Icon>
)
const PaletteIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.6 0-1-.8-1.4-.8-2.4 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10" cy="7" r="1" />
    <circle cx="15" cy="7.5" r="1" />
  </Icon>
)
const BlocksIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
    <rect x="8" y="3" width="8" height="8" rx="1.5" />
  </Icon>
)

const ACTIVITY_ICONS = [PlaneIcon, StarIcon, MoonIcon, BookIcon, PaletteIcon, BlocksIcon]

export function ActivityIcon({ activityId, ...rest }) {
  const Chosen = ACTIVITY_ICONS[Number(activityId) % ACTIVITY_ICONS.length] || StarIcon
  return <Chosen {...rest} />
}
