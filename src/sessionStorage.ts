import { SessionStore } from "./types";

export function getOrCreateSession() {
    let storedData = sessionStorage.getItem("sessionStore");

    if (!storedData) {
        // Initialize
        const sessionStore = { sessionId: "from-explorer", DiscoveredPlanets: [] } as SessionStore;
        sessionStorage.setItem("sessionStore", JSON.stringify(sessionStore));
        return sessionStore;
    } else {
        return JSON.parse(storedData) as SessionStore;
    }
}

export function updateSession(sessionStore: SessionStore) {
    sessionStorage.setItem("sessionStore", JSON.stringify(sessionStore));
}

export function resetSession() {
    const sessionStore = { sessionId: "from-explorer", DiscoveredPlanets: [] };
    sessionStorage.setItem("sessionStore", JSON.stringify(sessionStore));
}