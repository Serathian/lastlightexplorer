import { describe, expect, it } from 'vitest'
import dictionaryData from '../data/dictionary.json'
import planetData from '../data/planets.json'
import { getCodex } from '../src/codex'
import { filterBaseGamePlanets } from '../src/randomizer'
import { Codex, Planet, PlanetData } from '../src/types'

const typedPlanetData: PlanetData = planetData
const typedDictionary: Codex[] = dictionaryData

function countField(planets: Planet[], field: 'resource' | 'effect') {
  return planets.reduce<Record<string, number>>((acc, planet) => {
    const value = planet[field]
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

describe('planets.json token distributions and counts', () => {
  it('has expected common and rare tile counts for base game and expansion', () => {
    expect(typedPlanetData.common).toHaveLength(21)
    expect(typedPlanetData.rare).toHaveLength(17)

    const baseCommon = filterBaseGamePlanets(typedPlanetData.common)
    const baseRare = filterBaseGamePlanets(typedPlanetData.rare)
    expect(baseCommon).toHaveLength(19)
    expect(baseRare).toHaveLength(15)

    const expansionCommon = typedPlanetData.common.filter((p) => p.expansion)
    const expansionRare = typedPlanetData.rare.filter((p) => p.expansion)
    expect(expansionCommon).toHaveLength(2)
    expect(expansionRare).toHaveLength(2)
  })

  it('preserves retail base-game common resource and effect distributions', () => {
    const baseCommon = filterBaseGamePlanets(typedPlanetData.common)

    expect(countField(baseCommon, 'resource')).toEqual({
      common: 9,
      uncommon: 9,
      'not-rare': 1,
    })

    expect(countField(baseCommon, 'effect')).toEqual({
      wormhole: 2,
      rare: 1,
      pickup: 2,
      trade: 1,
      extractor: 2,
      research: 1,
      light: 1,
      tech: 2,
      uncommon: 2,
      common: 1,
      ship: 2,
      none: 2,
    })
  })

  it('preserves retail base-game rare resource and effect distributions', () => {
    const baseRare = filterBaseGamePlanets(typedPlanetData.rare)

    expect(countField(baseRare, 'resource')).toEqual({
      light: 6,
      'not-rare': 2,
      rare: 7,
    })

    expect(countField(baseRare, 'effect')).toEqual({
      none: 8,
      tech: 2,
      common: 2,
      trade: 1,
      wormhole: 2,
    })
  })

  it('adds 2 exotic/none tokens to each pool for the expansion', () => {
    expect(countField(typedPlanetData.common, 'resource').exotic).toBe(2)
    expect(countField(typedPlanetData.rare, 'resource').exotic).toBe(2)

    const expansionTokens = [
      ...typedPlanetData.common.filter((p) => p.expansion),
      ...typedPlanetData.rare.filter((p) => p.expansion),
    ]
    for (const token of expansionTokens) {
      expect(token.resource).toBe('exotic')
      expect(token.effect).toBe('none')
    }
  })

  it('keeps expected ID structure across common and rare pools', () => {
    const commonIds = typedPlanetData.common.map((p) => p.id)
    expect(new Set(commonIds).size).toBe(21)

    const rareIds = typedPlanetData.rare.map((p) => p.id)
    expect(rareIds.filter((id) => id === 'r09')).toHaveLength(2)
    expect(new Set(rareIds).size).toBe(16)
  })
})

describe('dictionary.json & getCodex', () => {
  it('resolves every planet resource and effect in planets.json', () => {
    const allPlanets = [...typedPlanetData.common, ...typedPlanetData.rare]

    for (const planet of allPlanets) {
      const resourceCodex = getCodex(planet.resource, typedDictionary)
      const effectCodex = getCodex(planet.effect, typedDictionary)

      expect(resourceCodex.id).toBe(planet.resource)
      expect(resourceCodex.name).not.toBe('not-found')
      expect(effectCodex.id).toBe(planet.effect)
      expect(effectCodex.name).not.toBe('not-found')
    }
  })

  it('returns fallback entry when codex key is unknown', () => {
    expect(getCodex('unknown-key', typedDictionary)).toEqual({
      id: ' not-found',
      name: 'not-found',
      description: 'not-found',
    })
    expect(getCodex('', typedDictionary).name).toBe('not-found')
  })
})
