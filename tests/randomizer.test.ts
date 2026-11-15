import { describe, expect, it, vi } from 'vitest'
import planetData from '../data/planets.json'
import { explore } from '../src/exploration'
import {
  filterBaseGamePlanets,
  filterUndiscoveredPlanets,
  getAvailablePlanetPools,
  getRandomNumber,
  selectRandomPlanet,
} from '../src/randomizer'
import { Planet, PlanetData, SessionStore } from '../src/types'

const typedPlanetData: PlanetData = planetData

function createRngSequence(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index] ?? 0
    index += 1
    return value
  }
}

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

describe('getRandomNumber', () => {
  it('returns min when rng returns 0 and max when rng approaches 1', () => {
    expect(getRandomNumber(0, 10, () => 0)).toBe(0)
    expect(getRandomNumber(0, 10, () => 0.999999999)).toBe(10)
    expect(getRandomNumber(5, 8, () => 0)).toBe(5)
    expect(getRandomNumber(5, 8, () => 0.999999999)).toBe(8)
  })

  it('always returns min when min equals max', () => {
    expect(getRandomNumber(3, 3, () => 0)).toBe(3)
    expect(getRandomNumber(3, 3, () => 0.5)).toBe(3)
    expect(getRandomNumber(3, 3, () => 0.999999)).toBe(3)
  })

  it('supports negative bounds', () => {
    expect(getRandomNumber(-3, 2, () => 0)).toBe(-3)
    expect(getRandomNumber(-3, 2, () => 0.999999)).toBe(2)
  })

  it('distributes uniformly across all integers in [min, max]', () => {
    const min = 0
    const max = 18
    const bucketCount = max - min + 1
    const samplesPerBucket = 100
    const totalSamples = bucketCount * samplesPerBucket
    const counts = new Map<number, number>()

    for (let i = 0; i < totalSamples; i += 1) {
      const u = i / totalSamples
      const value = getRandomNumber(min, max, () => u)
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    expect(counts.size).toBe(bucketCount)
    for (let n = min; n <= max; n += 1) {
      expect(counts.get(n)).toBe(samplesPerBucket)
    }
  })
})

describe('filterBaseGamePlanets', () => {
  it('excludes expansion tokens and preserves base tokens without mutating input', () => {
    const snapshot = structuredClone(typedPlanetData.common)
    const baseCommon = filterBaseGamePlanets(typedPlanetData.common)
    const baseRare = filterBaseGamePlanets(typedPlanetData.rare)

    expect(baseCommon).toHaveLength(19)
    expect(baseRare).toHaveLength(15)
    expect(baseCommon.every((planet) => planet.expansion === undefined)).toBe(
      true
    )
    expect(baseRare.every((planet) => planet.expansion === undefined)).toBe(
      true
    )
    expect(typedPlanetData.common).toEqual(snapshot)
  })
})

describe('filterUndiscoveredPlanets', () => {
  it('removes discovered planet IDs and leaves undiscovered ones in order', () => {
    const remaining = filterUndiscoveredPlanets(typedPlanetData.common, [
      { id: 'c01', type: 'common', resource: 'common', effect: 'wormhole' },
      { id: 'c20', type: 'common', resource: 'exotic', effect: 'none' },
    ])

    expect(remaining).toHaveLength(19)
    expect(remaining.some((planet) => planet.id === 'c01')).toBe(false)
    expect(remaining.some((planet) => planet.id === 'c20')).toBe(false)
    expect(remaining[0].id).toBe('c02')
  })

  it('removes both entries sharing duplicate ID r09 when r09 is discovered', () => {
    const remaining = filterUndiscoveredPlanets(typedPlanetData.rare, [
      { id: 'r09', type: 'rare', resource: 'rare', effect: 'trade' },
    ])

    expect(remaining.filter((planet) => planet.id === 'r09')).toHaveLength(0)
    expect(remaining).toHaveLength(15)
  })
})

describe('getAvailablePlanetPools', () => {
  it('returns only base game pools when no planets are discovered and expansion is off', () => {
    const pools = getAvailablePlanetPools(typedPlanetData, {
      DiscoveredPlanets: [],
      useExpansion: false,
    })

    expect(pools.common).toHaveLength(19)
    expect(pools.rare).toHaveLength(15)
    expect(pools.common.some((planet) => planet.expansion)).toBe(false)
    expect(pools.rare.some((planet) => planet.expansion)).toBe(false)
  })

  it('returns full pools including expansion tokens when expansion is on', () => {
    const pools = getAvailablePlanetPools(typedPlanetData, {
      DiscoveredPlanets: [],
      useExpansion: true,
    })

    expect(pools.common).toHaveLength(21)
    expect(pools.rare).toHaveLength(17)
    expect(pools.common.filter((planet) => planet.expansion)).toHaveLength(2)
    expect(pools.rare.filter((planet) => planet.expansion)).toHaveLength(2)
  })

  it('filters out discovered planets once exploration has started', () => {
    const pools = getAvailablePlanetPools(typedPlanetData, {
      DiscoveredPlanets: [
        { id: 'c01', type: 'common', resource: 'common', effect: 'wormhole' },
        { id: 'r01', type: 'rare', resource: 'light', effect: 'none' },
      ],
      useExpansion: true,
    })

    expect(pools.common).toHaveLength(20)
    expect(pools.rare).toHaveLength(16)
    expect(pools.common.some((planet) => planet.id === 'c01')).toBe(false)
    expect(pools.rare.some((planet) => planet.id === 'r01')).toBe(false)
  })

  it('returns empty pool when all planets in that pool are discovered', () => {
    const allCommonDiscovered = typedPlanetData.common.map((planet) => ({
      id: planet.id,
      type: 'common',
      resource: planet.resource,
      effect: planet.effect,
    }))

    const pools = getAvailablePlanetPools(typedPlanetData, {
      DiscoveredPlanets: allCommonDiscovered,
      useExpansion: true,
    })

    expect(pools.common).toHaveLength(0)
    expect(pools.rare).toHaveLength(17)
  })
})

describe('selectRandomPlanet', () => {
  it('returns undefined and does not invoke rng for an empty pool', () => {
    const rng = vi.fn(() => 0.5)
    expect(selectRandomPlanet([], rng)).toBeUndefined()
    expect(rng).not.toHaveBeenCalled()
  })

  it('returns the sole planet and does not invoke rng for a single-element pool', () => {
    const rng = vi.fn(() => 0.5)
    const solePlanet: Planet = {
      id: 'c01',
      resource: 'common',
      effect: 'wormhole',
    }
    expect(selectRandomPlanet([solePlanet], rng)).toEqual(solePlanet)
    expect(rng).not.toHaveBeenCalled()
  })

  it('selects boundary elements at rng extremes', () => {
    const baseCommon = filterBaseGamePlanets(typedPlanetData.common)
    expect(selectRandomPlanet(baseCommon, () => 0)).toEqual(baseCommon[0])
    expect(selectRandomPlanet(baseCommon, () => 0.999999999)).toEqual(
      baseCommon[baseCommon.length - 1]
    )
  })

  it('reproduces exact base-game resource probability weights across a uniform sweep', () => {
    const baseCommon = filterBaseGamePlanets(typedPlanetData.common)
    const totalSamples = baseCommon.length * 10
    const drawnCommon: Planet[] = []

    for (let i = 0; i < totalSamples; i += 1) {
      const planet = selectRandomPlanet(baseCommon, () => i / totalSamples)
      if (planet) drawnCommon.push(planet)
    }

    const commonResourceCounts = countBy(drawnCommon, (p) => p.resource)
    expect(commonResourceCounts).toEqual({
      common: 90,
      uncommon: 90,
      'not-rare': 10,
    })

    const baseRare = filterBaseGamePlanets(typedPlanetData.rare)
    const rareSamples = baseRare.length * 10
    const drawnRare: Planet[] = []

    for (let i = 0; i < rareSamples; i += 1) {
      const planet = selectRandomPlanet(baseRare, () => i / rareSamples)
      if (planet) drawnRare.push(planet)
    }

    const rareResourceCounts = countBy(drawnRare, (p) => p.resource)
    expect(rareResourceCounts).toEqual({
      light: 60,
      rare: 70,
      'not-rare': 20,
    })
  })
})

describe('explore', () => {
  it('does nothing when the available planet pool is empty', () => {
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: false,
    }

    explore('common', [], session, () => 0)
    expect(session.DiscoveredPlanets).toEqual([])
  })

  it('prepends discovered planets in LIFO order and respects deterministic rng', () => {
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: true,
    }
    const initialPools = getAvailablePlanetPools(typedPlanetData, session)
    const rng = createRngSequence([0, 0.999999])

    explore('common', initialPools.common, session, rng)
    const afterFirstPools = getAvailablePlanetPools(typedPlanetData, session)
    explore('common', afterFirstPools.common, session, rng)

    expect(session.DiscoveredPlanets).toHaveLength(2)
    expect(session.DiscoveredPlanets[0].id).toBe('c21')
    expect(session.DiscoveredPlanets[1].id).toBe('c01')
  })

  it('draws all 19 base common planets without duplicates when filtering to base game', () => {
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: false,
    }
    const baseCommonPool = filterBaseGamePlanets(typedPlanetData.common)

    for (let i = 0; i < 19; i += 1) {
      const remaining = filterUndiscoveredPlanets(
        baseCommonPool,
        session.DiscoveredPlanets
      )
      expect(remaining.length).toBeGreaterThan(0)
      explore('common', remaining, session, () => 0)
    }

    const exhausted = filterUndiscoveredPlanets(
      baseCommonPool,
      session.DiscoveredPlanets
    )
    expect(session.DiscoveredPlanets).toHaveLength(19)
    expect(new Set(session.DiscoveredPlanets.map((d) => d.id)).size).toBe(19)
    expect(exhausted).toHaveLength(0)

    // Exploration beyond depletion should be a safe no-op
    explore('common', exhausted, session, () => 0)
    expect(session.DiscoveredPlanets).toHaveLength(19)
  })

  it('preserves main.ts pool behavior across full exploration starting with useExpansion false', () => {
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: false,
    }

    const initialPools = getAvailablePlanetPools(typedPlanetData, session)
    expect(initialPools.common).toHaveLength(19)

    for (let i = 0; i < 21; i += 1) {
      const pools = getAvailablePlanetPools(typedPlanetData, session)
      expect(pools.common.length).toBeGreaterThan(0)
      explore('common', pools.common, session, () => 0)
    }

    const finalPools = getAvailablePlanetPools(typedPlanetData, session)
    expect(session.DiscoveredPlanets).toHaveLength(21)
    expect(finalPools.common).toHaveLength(0)
  })

  it('draws all 21 common planets when expansion is enabled from the start', () => {
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: true,
    }

    for (let i = 0; i < 21; i += 1) {
      const pools = getAvailablePlanetPools(typedPlanetData, session)
      explore('common', pools.common, session, () => 0.999999)
    }

    const finalPools = getAvailablePlanetPools(typedPlanetData, session)
    expect(session.DiscoveredPlanets).toHaveLength(21)
    expect(
      session.DiscoveredPlanets.filter((p) => p.resource === 'exotic')
    ).toHaveLength(2)
    expect(finalPools.common).toHaveLength(0)
  })

  it('uses Math.random by default when no rng argument is supplied', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const session: SessionStore = {
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: false,
    }

    try {
      const pools = getAvailablePlanetPools(typedPlanetData, session)
      explore('rare', pools.rare, session)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(session.DiscoveredPlanets[0]).toEqual({
        id: 'r01',
        type: 'rare',
        resource: 'light',
        effect: 'none',
      })
    } finally {
      spy.mockRestore()
    }
  })
})
