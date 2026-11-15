import { selectRandomPlanet } from './randomizer'
import { Planet, SessionStore } from './types'

/** Draws a random planet from `planets` and prepends it to `session.DiscoveredPlanets`. */
export function explore(
  type: string,
  planets: Planet[],
  session: SessionStore,
  rng: () => number = Math.random
) {
  const selectedPlanet = selectRandomPlanet(planets, rng)
  if (selectedPlanet) {
    session.DiscoveredPlanets.unshift({
      id: selectedPlanet.id,
      type: type,
      resource: selectedPlanet.resource,
      effect: selectedPlanet.effect,
    })
  }
}
