import type { Game } from "../types/game";

export function normalizeGameTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function findDuplicateGames(games: Game[]): Game[][] {
  const groupedGames = new Map<string, Game[]>();

  games.forEach((game) => {
    const normalizedTitle = normalizeGameTitle(game.title);
    const existingGroup = groupedGames.get(normalizedTitle) ?? [];

    groupedGames.set(normalizedTitle, [...existingGroup, game]);
  });

  return Array.from(groupedGames.values()).filter((group) => group.length > 1);
}
