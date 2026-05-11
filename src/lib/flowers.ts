import type { FlowerColor } from './assets'

export interface Flower {
  id: string
  color: FlowerColor
  tema: string
  nota: string
  createdAt: number
}

const FLOWERS_KEY = 'reencuentro_flowers'

export function getFlowers(): Flower[] {
  try {
    const stored = localStorage.getItem(FLOWERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addFlower(flower: Omit<Flower, 'id' | 'createdAt'>): Flower {
  const newFlower: Flower = {
    ...flower,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  const flowers = getFlowers()
  flowers.push(newFlower)
  localStorage.setItem(FLOWERS_KEY, JSON.stringify(flowers))
  return newFlower
}
