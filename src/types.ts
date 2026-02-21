export interface PlanetData {
  common: Planet[]
  rare: Planet[]
}

export interface Codex {
  id: string
  name: string
  description: string
}

export interface Planet {
  id: string
  resource: string
  effect: string
  expansion?: boolean
}

export interface SessionStore {
  sessionId: string
  DiscoveredPlanets: DiscoveredPlanet[]
  useExpansion: boolean
}

export interface DiscoveredPlanet {
  id: string
  type: string
  resource: string
  effect: string
}
