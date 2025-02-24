import { getCodex } from "./codex";
import { Codex } from "./types";

export function populateExploreModal(id: string, dictionary: Codex[]) {
    
    const keys = id.split('_');
    const area = keys[0]
    const codexId = keys[1];
    const codex = getCodex(codexId, dictionary)
    
    // The resource and effect are split here for future developement.

    if(area == "resource") {
        //Header
        const modalHeader = document.getElementById("modal-header") as HTMLHeadingElement;
        modalHeader.textContent = codex.name

        //Description
        const modalDesc = document.getElementById("modal-desc") as HTMLParagraphElement;
        modalDesc.textContent = codex.description
    }

    if(area == "effect") {
        //Header
        const modalHeader = document.getElementById("modal-header") as HTMLHeadingElement;
        modalHeader.textContent = codex.name

        //Description
        const modalDesc = document.getElementById("modal-desc") as HTMLParagraphElement;
        modalDesc.textContent = codex.description 
    }
}