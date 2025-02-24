import { Codex } from "./types";

export function getCodex(key: string, dictionary: Codex[]): Codex{
     return dictionary.find(codex => codex.id == key) ?? {id: " not-found", name: "not-found", description: "not-found"}
}