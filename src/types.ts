export interface PlanetData {
    common: Planet[],
    rare: Planet[],
}

export interface Planet {
    id: string,
    resource: string,
    effect: string,
}

export interface SessionStore {
    sessionId: string,
    DiscoveredPlanets: DiscoveredPlanet[]
}

export interface DiscoveredPlanet {
    id: string,
    type: string,
    resource: string,
    effect: string
}