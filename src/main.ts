import './style.css'
import planetData from '../data/planets.json'
import dictionaryData from '../data/dictionary.json'
import { Planet, PlanetData, Codex } from './types'
import { explore } from './exploration'
import { populateExploreModal } from './modal'
import {
  getOrCreateSession,
  resetSession,
  updateSession,
} from './sessionStorage'
document.addEventListener('DOMContentLoaded', () => {
  // -- Data
  const planets: PlanetData = planetData
  const dictionary: Codex[] = dictionaryData

  // -- Local Store
  let sessionStore = getOrCreateSession()

  // -- Useable Data
  let commonPlanets: Planet[] = []
  let rarePlanets: Planet[] = []

  // -- HTML Elements
  const buttonCommon = document.getElementById(
    'explore-common'
  ) as HTMLButtonElement
  const buttonRare = document.getElementById(
    'explore-rare'
  ) as HTMLButtonElement
  const buttonReset = document.getElementById(
    'reset-session'
  ) as HTMLButtonElement
  const exploredPlanets = document.getElementById(
    'planet-list'
  ) as HTMLDivElement
  const infoModal = document.getElementById(
    'planet-info-modal'
  ) as HTMLDialogElement

  // -- Init
  updatePlanetLists()
  renderState()

  // -- Function
  function explorePlanet(type: string, possiblePlanets: Planet[]) {
    explore(type, possiblePlanets, sessionStore)
    updatePlanetLists()
    checkForEndOfList()
    renderState()
    updateSession(sessionStore)
  }

  function updatePlanetLists() {
    if (sessionStore.DiscoveredPlanets.length == 0) {
      commonPlanets = planets.common
      rarePlanets = planets.rare
    } else {
      commonPlanets = planets.common.filter(
        (planet) =>
          !sessionStore.DiscoveredPlanets.some(
            (discovered) => discovered.id === planet.id
          )
      )
      rarePlanets = planets.rare.filter(
        (planet) =>
          !sessionStore.DiscoveredPlanets.some(
            (discovered) => discovered.id === planet.id
          )
      )
    }
  }

  function checkForEndOfList() {
    if (commonPlanets.length == 0) {
      buttonCommon.disabled = true
    } else {
      buttonCommon.disabled = false
    }
    if (rarePlanets.length == 0) {
      buttonRare.disabled = true
    } else {
      buttonRare.disabled = false
    }
  }

  function reset() {
    resetSession()
    sessionStore = getOrCreateSession()
    renderState()
  }

  function handleExploreTooltip(key: string) {
    populateExploreModal(key, dictionary)
    infoModal.showModal()
  }

  // -- Listners
  buttonCommon.addEventListener('click', () =>
    explorePlanet('common', commonPlanets)
  )
  buttonRare.addEventListener('click', () => explorePlanet('rare', rarePlanets))
  buttonReset.addEventListener('click', () => reset())
  exploredPlanets.addEventListener('click', function (event: Event) {
    const target = event.target as HTMLElement

    if (
      event.target &&
      target.classList.contains('clickable') &&
      target.textContent != null
    ) {
      handleExploreTooltip(target.id)
    }
  })

  // -- Renderer
  function renderState() {
    exploredPlanets.innerHTML = ''

    sessionStore.DiscoveredPlanets.forEach((planet) => {
      const colour = getPlanetColour(planet.type)

      // Resource
      const resourceContent = document.createElement('span')
      resourceContent.id = 'resource_' + planet.resource
      resourceContent.className =
        colour + ' uppercase font-bold text-center text-md cursor-pointer'
      resourceContent.textContent = planet.resource
      resourceContent.classList.add('clickable')
      exploredPlanets.appendChild(resourceContent)

      // effect
      const effectContent = document.createElement('span')
      effectContent.id = 'effect_' + planet.effect
      effectContent.className =
        colour +
        ' uppercase font- font-bold border-l text-center text-md cursor-pointer'
      effectContent.textContent = planet.effect
      effectContent.classList.add('clickable')
      exploredPlanets.appendChild(effectContent)
    })
  }

  function getPlanetColour(type: string) {
    if (type == 'common') {
      return 'text-primary'
    }
    return 'text-secondary'
  }
})
