export default function MateLogo({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gold gradient for the badge border */}
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A843" />
          <stop offset="50%" stopColor="#F0D078" />
          <stop offset="100%" stopColor="#C4993B" />
        </linearGradient>

        {/* Mate gourd body gradient */}
        <linearGradient
          id="mateBody"
          x1="24"
          y1="24"
          x2="40"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#D4A843" />
          <stop offset="60%" stopColor="#C4993B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Rim metallic gradient */}
        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4993B" />
          <stop offset="40%" stopColor="#F0D078" />
          <stop offset="100%" stopColor="#C4993B" />
        </linearGradient>

        {/* Bombilla metallic gradient */}
        <linearGradient
          id="bombillaGrad"
          x1="36"
          y1="10"
          x2="33"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#E8CC7A" />
          <stop offset="50%" stopColor="#D4A843" />
          <stop offset="100%" stopColor="#A07828" />
        </linearGradient>
      </defs>

      {/* === OUTER BADGE === */}

      {/* Dark background circle */}
      <circle cx="32" cy="32" r="31" fill="#1A1A2E" />

      {/* Gold outer ring */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="url(#goldBorder)"
        strokeWidth="2"
      />

      {/* Inner decorative ring */}
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="#C4993B"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Decorative dots around the badge (seal rivets) */}
      {[...Array(16)].map((_, i) => {
        const angle = (i * 360) / 16 - 90;
        const rad = (angle * Math.PI) / 180;
        const cx = 32 + 28.5 * Math.cos(rad);
        const cy = 32 + 28.5 * Math.sin(rad);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="0.7"
            fill="#D4A843"
            opacity="0.5"
          />
        );
      })}

      {/* === LAUREL BRANCHES (left side) === */}
      <path
        d="M10 37 C12 35, 14.5 36, 13 38.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <path
        d="M11 40 C13 38, 15.5 39, 14 41.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.45"
      />
      <path
        d="M12.5 43 C14.5 41, 17 42, 15.5 44.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.4"
      />
      <path
        d="M14.5 46 C16.5 44, 19 45, 17 47"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.35"
      />
      {/* Left stem */}
      <path
        d="M12 35 C14 40, 16 45, 19 49"
        stroke="#C4993B"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />

      {/* === LAUREL BRANCHES (right side) === */}
      <path
        d="M54 37 C52 35, 49.5 36, 51 38.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <path
        d="M53 40 C51 38, 48.5 39, 50 41.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.45"
      />
      <path
        d="M51.5 43 C49.5 41, 47 42, 48.5 44.5"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.4"
      />
      <path
        d="M49.5 46 C47.5 44, 45 45, 47 47"
        fill="#C4993B"
        stroke="#C4993B"
        strokeWidth="0.3"
        opacity="0.35"
      />
      {/* Right stem */}
      <path
        d="M52 35 C50 40, 48 45, 45 49"
        stroke="#C4993B"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />

      {/* === YERBA MATE HERBS (peeking above rim) === */}
      <path
        d="M25 26.5 C27 22, 30 20, 32 19.5 C34 20, 37 22, 39 26.5"
        fill="#3D5A1E"
        opacity="0.7"
      />
      {/* Leaf details */}
      <path
        d="M28 24 C29 21.5, 30.5 21, 30 23.5"
        stroke="#5A7A2E"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M34 23 C35 20.5, 37 21.5, 36 24"
        stroke="#5A7A2E"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M31 22 C31.5 19.5, 33 19.5, 32.5 22"
        stroke="#4A6B25"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* === MATE GOURD BODY === */}
      <path
        d="M24 28
           C22 32, 22 37, 23.5 42
           C25 47, 28 50, 32 51
           C36 50, 39 47, 40.5 42
           C42 37, 42 32, 40 28"
        fill="url(#mateBody)"
        stroke="#8B6914"
        strokeWidth="0.6"
      />

      {/* Gourd 3D highlight */}
      <path
        d="M27 31 C26 34, 26 38, 27 42"
        stroke="#F0D078"
        strokeWidth="0.8"
        fill="none"
        opacity="0.25"
        strokeLinecap="round"
      />

      {/* Decorative carved band on gourd */}
      <path
        d="M25 38 C28 39.5, 36 39.5, 39 38"
        stroke="#8B6914"
        strokeWidth="0.7"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M25.5 39.5 C28.5 41, 35.5 41, 38.5 39.5"
        stroke="#8B6914"
        strokeWidth="0.4"
        fill="none"
        opacity="0.3"
      />

      {/* Subtle gourd texture */}
      <path
        d="M25 34 C29 35, 35 35, 39 34"
        stroke="#A07828"
        strokeWidth="0.3"
        fill="none"
        opacity="0.3"
      />

      {/* === VIROLA (metallic rim) === */}
      <ellipse
        cx="32"
        cy="27.5"
        rx="9"
        ry="2.8"
        fill="url(#rimGrad)"
        stroke="#8B6914"
        strokeWidth="0.5"
      />
      {/* Rim top highlight */}
      <ellipse
        cx="32"
        cy="26.8"
        rx="6"
        ry="1"
        fill="none"
        stroke="#F0D078"
        strokeWidth="0.4"
        opacity="0.5"
      />

      {/* === BOMBILLA (metal straw) === */}

      {/* Main shaft */}
      <line
        x1="37.5"
        y1="13"
        x2="34"
        y2="40"
        stroke="url(#bombillaGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Shaft highlight */}
      <line
        x1="37.9"
        y1="14"
        x2="34.5"
        y2="39"
        stroke="#F0D078"
        strokeWidth="0.35"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Mouthpiece */}
      <path
        d="M35.8 12 L39.2 12 L39.5 13.5 L38 14 L37 14 L35.5 13.5 Z"
        fill="#D4A843"
        stroke="#A07828"
        strokeWidth="0.4"
      />

      {/* Filter (spoon end) */}
      <ellipse
        cx="33.8"
        cy="41"
        rx="2.5"
        ry="1.3"
        fill="#D4A843"
        stroke="#A07828"
        strokeWidth="0.4"
      />
      {/* Filter holes */}
      <circle cx="32.8" cy="41" r="0.3" fill="#8B6914" />
      <circle cx="34" cy="40.5" r="0.3" fill="#8B6914" />
      <circle cx="34.8" cy="41" r="0.3" fill="#8B6914" />
      <circle cx="33.5" cy="41.5" r="0.3" fill="#8B6914" />

      {/* === BOTTOM DECORATIVE ELEMENTS === */}

      {/* Small diamond at bottom */}
      <path
        d="M32 57 L33 55.5 L32 54 L31 55.5Z"
        fill="#D4A843"
        opacity="0.6"
      />

      {/* Top diamond accent */}
      <path
        d="M32 5.5 L33 7 L32 8.5 L31 7Z"
        fill="#D4A843"
        opacity="0.6"
      />
    </svg>
  );
}
