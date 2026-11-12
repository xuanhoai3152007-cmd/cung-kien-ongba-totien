export type ProductIllustrationKind =
  | 'offering' | 'incense' | 'altar-set' | 'fruit' | 'lantern' | 'tea'
  | 'paper-car' | 'paper-clothes' | 'paper-house' | 'paper-horse'
  | 'incense-coil' | 'incense-cone' | 'colored-candle' | 'lotus-candle' | 'led-lamp'

type ProductIllustrationProps = {
  kind: ProductIllustrationKind
}

export function ProductIllustration({ kind }: ProductIllustrationProps) {
  return (
    <svg className="product-illustration" viewBox="0 0 320 220" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#f8e6b4" />
          <stop offset="1" stopColor="#c99d5c" />
        </linearGradient>
        <linearGradient id="lacquer" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#c94530" />
          <stop offset=".55" stopColor="#8b1e1e" />
          <stop offset="1" stopColor="#531719" />
        </linearGradient>
        <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#fff0a8" />
          <stop offset=".45" stopColor="#d7a645" />
          <stop offset="1" stopColor="#986522" />
        </linearGradient>
        <linearGradient id="ceramic" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#fffdf5" />
          <stop offset=".6" stopColor="#e9ddc9" />
          <stop offset="1" stopColor="#bca987" />
        </linearGradient>
        <linearGradient id="green" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#789765" />
          <stop offset="1" stopColor="#31533b" />
        </linearGradient>
        <radialGradient id="glow">
          <stop stopColor="#fff4be" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffc55b" stopOpacity="0" />
        </radialGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4a2d1b" floodOpacity=".22" />
        </filter>
      </defs>
      <rect width="320" height="220" rx="14" fill="#f3e8d7" />
      <path d="M0 166 Q160 135 320 166 V220 H0Z" fill="#e7d4b8" />
      <ellipse cx="160" cy="177" rx="91" ry="13" fill="#8a6544" opacity=".18" />
      {kind === 'paper-car' && (
        <g filter="url(#shadow)">
          <path d="M58 127 72 105 109 96 138 70 217 74 246 101 270 109 278 139 258 151 69 151 50 140Z" fill="url(#lacquer)" stroke="#6b3020" strokeWidth="3" />
          <path d="m120 97 25-22 63 3 21 20Z" fill="#6e9a9b" stroke="#f2d89e" strokeWidth="4" />
          <path d="m154 78-3 19m47-18 5 19" stroke="#f4dca6" strokeWidth="3" />
          <path d="m69 111 42-9m129 3 19 8" stroke="url(#gold)" strokeWidth="5" />
          <path d="m55 128 18-3v13l-18 2m199-20 17 4v13l-14 3" fill="#ffe7a4" />
          <circle cx="101" cy="146" r="20" fill="#332722" stroke="#d6b568" strokeWidth="5" />
          <circle cx="101" cy="146" r="8" fill="#d9c9a9" />
          <circle cx="232" cy="146" r="20" fill="#332722" stroke="#d6b568" strokeWidth="5" />
          <circle cx="232" cy="146" r="8" fill="#d9c9a9" />
          <path d="M80 119h16m150 0h12" stroke="#fff0c1" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {kind === 'paper-clothes' && (
        <g filter="url(#shadow)" stroke="#d4ae6e" strokeWidth="2">
          <path d="m111 57 24-12 24 16 24-16 24 12 23 25-20 18-13-14 8 68h-93l8-68-13 14-20-18Z" fill="url(#lacquer)" />
          <path d="m135 46 24 15 24-15 10 5-18 32-16-9-16 9-18-32Z" fill="url(#gold)" />
          <path d="m159 61 1 95m-37-52 16 6m42-6 16-6" fill="none" stroke="#f6dfaa" strokeWidth="3" />
          <path d="m114 92-24 47 17 9 23-42m91-14 24 47-17 9-23-42" fill="#ba3830" />
          <path d="M126 124h67m-65 11h64" stroke="#e9c477" opacity=".7" />
        </g>
      )}
      {kind === 'paper-house' && (
        <g filter="url(#shadow)" stroke="#8c542d" strokeWidth="3" strokeLinejoin="round">
          <path d="m76 103 83-56 85 56-10 12-75-48-72 49Z" fill="url(#lacquer)" />
          <path d="M91 111h137v53H91z" fill="url(#paper)" />
          <path d="M145 164v-37q15-24 30 0v37" fill="#805132" />
          <path d="M105 122h25v24h-25zm83 0h25v24h-25z" fill="#88a4a0" stroke="#d9ad5b" />
          <path d="M158 47V32m0 0h21" stroke="#d3a84f" strokeWidth="5" />
          <path d="M99 111h122" stroke="#d3a84f" strokeWidth="5" />
        </g>
      )}
      {kind === 'paper-horse' && (
        <g filter="url(#shadow)" fill="url(#paper)" stroke="#80512d" strokeWidth="4" strokeLinejoin="round">
          <path d="M85 104q8-30 47-30l34 13 29-8 20 16-4 18-24 9-24-9-24 16-32-3-18 20-10-5 8-24-13-13Z" />
          <path d="m190 87 17-28 25-5 14 13-9 24-20 12" fill="url(#gold)" />
          <path d="m220 63 9-13 11 8m-115 18 2-17 9-12 9 18m-67 81-6 30h-9l2-32m38-2-2 34h-9l-3-35m68-27 4 29-8 30h-9l2-33-14-20m48-9 19 21 8 28h-9l-13-23-25-10" fill="url(#lacquer)" />
          <path d="M225 78h2m17 16q11-3 12 2m-42 9 16 4" fill="none" stroke="#4b3527" strokeWidth="3" strokeLinecap="round" />
          <path d="m108 99 32 7 28-8m-45 24 27 3" fill="none" stroke="#c5974f" strokeWidth="3" />
        </g>
      )}
      {kind === 'incense' && (
        <g filter="url(#shadow)">
          <path d="M103 101h114v59H103z" fill="url(#lacquer)" stroke="#6d3626" strokeWidth="3" />
          <path d="M112 110h96v40h-96z" fill="url(#paper)" />
          <path d="M127 151 151 65m22 86 5-98m16 98 18-75" stroke="#8d4a2a" strokeWidth="5" strokeLinecap="round" />
          <path d="M152 65q-13-13 0-23m24 11q-11-13 2-24m15 43q-10-13 3-23" fill="none" stroke="#a9a092" strokeWidth="3" strokeLinecap="round" />
          <path d="m130 117 20 5m25-5 22-4m-67 20 71 1" stroke="#fff0c0" strokeWidth="2" opacity=".8" />
          <path d="M139 135h44" stroke="#b53a2a" strokeWidth="4" />
        </g>
      )}
      {kind === 'incense-coil' && (
        <g filter="url(#shadow)">
          <path d="M150 80h20v82h-20z" fill="url(#gold)" />
          <path d="M124 95q36-29 72 0-36 29-72 0Zm9 17q27-21 54 0-27 22-54 0Zm7 16q20-14 40 0-20 16-40 0Z" fill="none" stroke="#8d4a2a" strokeWidth="7" />
          <path d="M125 95q35-25 70 0m-61 17q26-17 52 0m-43 16q17-11 34 0" fill="none" stroke="#d8a66a" strokeWidth="2" />
          <path d="M137 163h46" stroke="#6e4a2d" strokeWidth="5" strokeLinecap="round" />
          <path d="M159 81q-12-13 1-24m9 10q-8-12 2-20" fill="none" stroke="#a9a092" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === 'incense-cone' && (
        <g filter="url(#shadow)">
          <path d="M116 154h89l-11 13h-68Z" fill="url(#gold)" />
          <path d="m160 74 34 80h-68Z" fill="url(#lacquer)" stroke="#713523" strokeWidth="3" />
          <path d="M155 79q-13-13 2-23m12 18q-8-13 5-23m-24 36 20 50" fill="none" stroke="#b99b78" strokeWidth="3" strokeLinecap="round" />
          <path d="M144 148h32" stroke="#e7aa61" strokeWidth="3" />
        </g>
      )}
      {kind === 'colored-candle' && (
        <g filter="url(#shadow)">
          <ellipse cx="117" cy="156" rx="34" ry="10" fill="#9d3126" />
          <path d="M83 115h68v39q-34 20-68 0Z" fill="url(#lacquer)" />
          <ellipse cx="117" cy="115" rx="34" ry="11" fill="#f1c56c" />
          <ellipse cx="117" cy="115" rx="24" ry="7" fill="#f7ead1" />
          <path d="M117 109q-11-20 0-35 12 14 0 35Z" fill="#ffb63f" />
          <ellipse cx="202" cy="156" rx="34" ry="10" fill="#9e792d" />
          <path d="M168 115h68v39q-34 20-68 0Z" fill="url(#green)" />
          <ellipse cx="202" cy="115" rx="34" ry="11" fill="url(#gold)" />
          <ellipse cx="202" cy="115" rx="24" ry="7" fill="#f7ead1" />
          <path d="M202 109q-11-20 0-35 12 14 0 35Z" fill="#ffb63f" />
          <circle cx="117" cy="102" r="42" fill="url(#glow)" />
          <circle cx="202" cy="102" r="42" fill="url(#glow)" />
        </g>
      )}
      {kind === 'lotus-candle' && (
        <g filter="url(#shadow)" stroke="#b94736" strokeWidth="2">
          <path d="M160 154q-63 2-71-26 37-1 71 26Zm0 0q-54-28-46-57 31 16 46 57Zm0 0q-23-55 0-77 22 33 0 77Zm0 0q16-49 47-57 7 30-47 57Zm0 0q31-26 71-26-10 29-71 26Z" fill="#e78b70" />
          <path d="M160 154q-35-31-24-54 22 14 24 54Zm0 0q5-42 28-53 11 27-28 53Z" fill="#f2bd78" />
          <ellipse cx="160" cy="160" rx="60" ry="14" fill="url(#gold)" stroke="#a57939" />
          <path d="M160 100q-10-17 0-28 11 12 0 28Z" fill="#ffbd4d" stroke="none" />
        </g>
      )}
      {kind === 'led-lamp' && (
        <g filter="url(#shadow)">
          <circle cx="112" cy="113" r="58" fill="url(#glow)" />
          <circle cx="210" cy="113" r="58" fill="url(#glow)" />
          <path d="M80 87h64v55q-32 31-64 0Zm98 0h64v55q-32 31-64 0Z" fill="url(#lacquer)" stroke="#70401f" strokeWidth="3" />
          <path d="M85 94h54v43H85zm98 0h54v43h-54z" fill="#f9d980" />
          <path d="M96 99h32v33H96zm98 0h32v33h-32z" fill="#fff1bc" />
          <path d="M112 69V50m98 19V50M75 85h74m24 0h74M91 151h42m56 0h42" stroke="url(#gold)" strokeWidth="7" strokeLinecap="round" />
          <path d="M112 47q-10-12 0-21m98 21q-10-12 0-21" fill="none" stroke="#d2a148" strokeWidth="3" />
        </g>
      )}
      {kind === 'fruit' && (
        <g filter="url(#shadow)">
          <ellipse cx="160" cy="148" rx="81" ry="29" fill="url(#ceramic)" stroke="#b7a486" strokeWidth="3" />
          <path d="M83 140q77 43 154 0" fill="none" stroke="#c3a76f" strokeWidth="4" />
          <circle cx="124" cy="112" r="27" fill="#c7352b" />
          <circle cx="168" cy="105" r="30" fill="#e5b448" />
          <circle cx="204" cy="119" r="25" fill="#ca3829" />
          <path d="M124 84q5-13 17-11m27 3q7-13 17-10m18 39q6-11 15-10" fill="none" stroke="#477342" strokeWidth="6" strokeLinecap="round" />
          <path d="M116 104q8-8 16-5m27-8q8-8 16-4m22 19q8-7 14-4" fill="none" stroke="#ffdda0" strokeWidth="4" strokeLinecap="round" opacity=".8" />
          <path d="M99 141q-10-13-3-23 13 2 15 17m96 6q12-14 24-8-1 12-15 18" fill="url(#green)" />
        </g>
      )}
      {kind === 'tea' && (
        <g filter="url(#shadow)">
          <path d="M108 101h102v47q-51 26-102 0Z" fill="url(#lacquer)" stroke="#6d3427" strokeWidth="3" />
          <path d="M118 108h82v33q-41 19-82 0Z" fill="url(#paper)" />
          <path d="M210 112h22q19 0 13 20-6 14-35 9" fill="none" stroke="#9c392b" strokeWidth="9" />
          <ellipse cx="160" cy="102" rx="53" ry="13" fill="url(#gold)" />
          <path d="M111 153h105" stroke="#d9b469" strokeWidth="5" strokeLinecap="round" />
          <path d="M139 84q-13-13 0-24m23 24q-13-13 0-24m22 24q-13-13 0-24" fill="none" stroke="#a99a82" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === 'altar-set' && (
        <g filter="url(#shadow)">
          <ellipse cx="160" cy="158" rx="91" ry="25" fill="url(#ceramic)" stroke="#b7a486" strokeWidth="3" />
          <path d="M75 149q85 38 170 0" fill="none" stroke="#c5a35f" strokeWidth="4" />
          <path d="M98 129q-13-14 0-28 14 14 0 28m0 0q-14-4-20-17 16-6 20 17m0 0q14-5 20-18-17-5-20 18" fill="#d94b47" />
          <circle cx="160" cy="125" r="20" fill="#e1ae46" />
          <circle cx="197" cy="133" r="17" fill="#d14334" />
          <path d="M124 145v-48m-6 8 6-14 6 14m60 50V96m-6 8 6-14 6 14" stroke="#7b3927" strokeWidth="4" />
          <path d="M111 112q-10-12 0-21m84 5q-9-12 1-21" fill="none" stroke="#aaa08e" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === 'offering' && (
        <g filter="url(#shadow)">
          <ellipse cx="160" cy="150" rx="90" ry="30" fill="url(#ceramic)" stroke="#b9a98e" strokeWidth="3" />
          <path d="M74 139q86 42 172 0" fill="none" stroke="#d0ae68" strokeWidth="5" />
          <path d="M112 136q-18-20 0-38 18 18 0 38m0 0q-20-5-29-24 23-9 29 24m0 0q19-7 28-25-24-8-28 25" fill="#db4951" />
          <circle cx="159" cy="116" r="24" fill="#d89234" />
          <circle cx="201" cy="128" r="21" fill="#b94332" />
          <path d="M159 92q4-12 15-9m22 25q8-8 16-5" fill="none" stroke="#4c7947" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {kind === 'lantern' && (
        <g filter="url(#shadow)">
          <path d="M117 75h86l-12 16v57q-31 25-62 0V91Z" fill="url(#lacquer)" stroke="#784420" strokeWidth="3" />
          <path d="M129 94h62v45q-31 20-62 0Z" fill="#f3c86c" />
          <path d="M137 98h46v39h-46z" fill="#fff0b5" opacity=".85" />
          <path d="M110 75h100m-87-12h74m-60 97h46m-23 13v13m-10 0h20" stroke="url(#gold)" strokeWidth="6" strokeLinecap="round" />
          <path d="M160 58V42m-11 17h22m-13 110q-10 11 2 18" fill="none" stroke="#8b5a2c" strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}
