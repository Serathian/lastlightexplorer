import { SessionStore } from "./types";

export function getOrCreateSession() {
    let storedData = sessionStorage.getItem("sessionStore");

    if (!storedData) {
        // Initialize
        const newGUID = crypto.randomUUID().toString();
        const sessionStore = { sessionId: newGUID, DiscoveredPlanets: [] } as SessionStore;
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
    const newGUID = crypto.randomUUID().toString();
    const sessionStore = { sessionId: newGUID, DiscoveredPlanets: [] };
    sessionStorage.setItem("sessionStore", JSON.stringify(sessionStore));
}