import './style.css'
import data  from '../data/planets.json'
import { Planet, PlanetData } from './types';
import { explore } from './exploration';
import { getOrCreateSession, resetSession, updateSession } from './sessionStorage';
document.addEventListener("DOMContentLoaded", () => {

    // -- Data
    const planets: PlanetData = data;

    // -- Local Store
    let sessionStore = getOrCreateSession()

    // -- Useable Data
    let commonPlanets: Planet[] = [];
    let rarePlanets: Planet[] = [];

    // -- HTML Elements
    const buttonCommon = document.getElementById('explore-common') as HTMLButtonElement;
    const buttonRare = document.getElementById('explore-rare') as HTMLButtonElement;
    const buttonReset = document.getElementById('rest-session') as HTMLButtonElement
    const exploredPlanets = document.getElementById("planet-list") as HTMLElement;

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
        console.log(commonPlanets.length)
    }

    function updatePlanetLists() {
        if(sessionStore.DiscoveredPlanets.length == 0){
            commonPlanets = planets.common;
            rarePlanets = planets.rare;
        }else {
            commonPlanets = planets.common.filter(planet => 
                !sessionStore.DiscoveredPlanets.some(discovered => discovered.id === planet.id));
            rarePlanets = planets.rare.filter(planet => 
                !sessionStore.DiscoveredPlanets.some(discovered => discovered.id === planet.id));
        }
    }

    function checkForEndOfList() {
        if(commonPlanets.length == 0) {
            buttonCommon.disabled = true
        }
        if(rarePlanets.length == 0) {
            buttonRare.disabled = true
        }
    }

    function reset() {
        resetSession()
        sessionStore = getOrCreateSession()
        renderState()
    }


    // -- Listners
    buttonCommon.addEventListener('click', () => explorePlanet("common", commonPlanets) );
    buttonRare.addEventListener('click', () => explorePlanet("rare", rarePlanets));
    buttonReset.addEventListener('click', () => reset())
    // -- Renderer
    function renderState() {
        exploredPlanets.innerHTML = '';
    
        sessionStore.DiscoveredPlanets.forEach(planet => {

            const colour = getPlanetColour(planet.type);

            // Resource
            const resourceContent = document.createElement("span")
            resourceContent.className = colour + " uppercase font-bold text-center text-md"
            resourceContent.textContent = planet.resource
            exploredPlanets.appendChild(resourceContent)

            // effect
            const effectContent = document.createElement("span")
            effectContent.className = colour + " uppercase font- font-bold border-l text-center text-md"
            effectContent.textContent = planet.effect
            exploredPlanets.appendChild(effectContent)
        });

    }

    function getPlanetColour(type: string) {
        if(type == "common"){
            return "text-primary"
        }
        return "text-secondary"
    }

})