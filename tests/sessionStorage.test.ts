import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getOrCreateSession,
  resetSession,
  updateSession,
} from '../src/sessionStorage'
import { SessionStore } from '../src/types'

function createStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('sessionStorage helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates and persists a default session when none exists', () => {
    const session = getOrCreateSession()
    expect(session).toEqual({
      sessionId: 'from-explorer',
      DiscoveredPlanets: [],
      useExpansion: false,
    })

    const stored = getOrCreateSession()
    expect(stored).toEqual(session)
  })

  it('persists session updates and resets discovered planets', () => {
    const session: SessionStore = getOrCreateSession()
    session.useExpansion = true
    session.DiscoveredPlanets.push({
      id: 'c01',
      type: 'common',
      resource: 'common',
      effect: 'wormhole',
    })
    updateSession(session)

    expect(getOrCreateSession()).toEqual(session)

    resetSession()
    const reset = getOrCreateSession()
    expect(reset.DiscoveredPlanets).toEqual([])
  })
})
