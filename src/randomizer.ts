import { DiscoveredPlanet, Planet, PlanetData, SessionStore } from './types'

/** Returns a random integer between `min` and `max` (inclusive) using `rng`. */
export function getRandomNumber(
  min: number,
  max: number,
  rng: () => number = Math.random
): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** Filters a planet pool to exclude expansion-only tokens. */
export function filterBaseGamePlanets(planets: Planet[]): Planet[] {
  return planets.filter((planet) => planet.expansion == undefined)
}

/** Filters a planet pool to exclude any tokens already discovered in the session. */
export function filterUndiscoveredPlanets(
  planets: Planet[],
  discoveredPlanets: DiscoveredPlanet[]
): Planet[] {
  return planets.filter(
    (planet) =>
      !discoveredPlanets.some((discovered) => discovered.id === planet.id)
  )
}

/** Computes the remaining common and rare planet pools for the current session. */
export function getAvailablePlanetPools(
  planets: PlanetData,
  session: Pick<SessionStore, 'DiscoveredPlanets' | 'useExpansion'>
): PlanetData {
  if (session.DiscoveredPlanets.length === 0) {
    if (session.useExpansion) {
      return {
        common: planets.common,
        rare: planets.rare,
      }
    }

    return {
      common: filterBaseGamePlanets(planets.common),
      rare: filterBaseGamePlanets(planets.rare),
    }
  }

  return {
    common: filterUndiscoveredPlanets(
      planets.common,
      session.DiscoveredPlanets
    ),
    rare: filterUndiscoveredPlanets(planets.rare, session.DiscoveredPlanets),
  }
}

/** Selects a single planet uniformly at random from `planets`, or `undefined` if empty. */
export function selectRandomPlanet(
  planets: Planet[],
  rng: () => number = Math.random
): Planet | undefined {
  if (planets.length === 0) {
    return undefined
  }
  if (planets.length === 1) {
    return planets[0]
  }
  const randomIndex = getRandomNumber(0, planets.length - 1, rng)
  return planets[randomIndex]
}
