import { Planet, SessionStore } from './types'

export function explore(
  type: string,
  planets: Planet[],
  session: SessionStore
) {
  if (planets.length > 0) {
    let selectedPlanet: Planet

    if (planets.length == 1) {
      selectedPlanet = planets[0]
    } else {
      const amountOfPlanets = planets.length - 1
      const randomNumber = getRandomNumber(0, amountOfPlanets)
      selectedPlanet = planets[randomNumber]
    }
    session.DiscoveredPlanets.unshift({
      id: selectedPlanet.id,
      type: type,
      resource: selectedPlanet.resource,
      effect: selectedPlanet.effect,
    })
  }
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
