export const STAGE_TAGS = [
  { key: 'adulto', label: 'Adulto', re: /(^|\W)adult(?:o|os|a|as)?(\W|$)/ },
  { key: 'cachorro', label: 'Cachorro', re: /cachorr|puppy|kitten|gatit/ },
  { key: 'senior', label: 'Senior', re: /senior|vitality|vitalidad|mayores|\b7\s*a[ñn]os/ },
]

export const SIZE_TAGS = [
  { key: 'pequenio', label: 'Pequeño', re: /peque[ñn]|mini|\bchic[oa]/ },
  { key: 'mediano', label: 'Mediano', re: /median|medium|med-?grande/ },
  { key: 'grande', label: 'Grande', re: /grand|large/ },
]

export const BREED_DEFS = [
  { key: 'caniche', label: 'Caniche', re: /caniche/ },
  { key: 'ovejero', label: 'Ovejero', re: /ovejero/ },
  { key: 'salchicha', label: 'Salchicha (Dachshund)', re: /salchicha|dachshund/ },
  { key: 'bulldog', label: 'Bulldog', re: /bulldog/ },
  { key: 'labrador', label: 'Labrador', re: /labrador/ },
  { key: 'boxer', label: 'Boxer', re: /boxer/ },
  { key: 'golden', label: 'Golden', re: /golden/ },
  { key: 'cocker', label: 'Cocker', re: /cocker/ },
]

export const STAGE_KEYS = STAGE_TAGS.map((t) => t.key)
export const SIZE_KEYS = SIZE_TAGS.map((t) => t.key)
export const BREED_KEYS = BREED_DEFS.map((b) => b.key)

export const STAGE_PATTERNS = Object.fromEntries(STAGE_TAGS.map((t) => [t.key, t.re.source]))
export const SIZE_PATTERNS = Object.fromEntries(SIZE_TAGS.map((t) => [t.key, t.re.source]))
export const BREED_PATTERNS = Object.fromEntries(BREED_DEFS.map((b) => [b.key, b.re.source]))