import * as XLSX from "xlsx";
import type { Game } from "../types/game";

type SpreadsheetCell = string | number | boolean | null | undefined;

function createGameId(title: string, platform: string, index: number): string {
  const normalizedTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const normalizedPlatform = platform
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${normalizedTitle}-${normalizedPlatform}-${index}`;
}

export async function parseGameSpreadsheet(file: File): Promise<Game[]> {
  const fileBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(fileBuffer, {
    type: "array",
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The spreadsheet does not contain any worksheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json<SpreadsheetCell[]>(worksheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });

  if (rows.length < 3) {
    throw new Error(
      "The spreadsheet must contain a platform row and at least one game.",
    );
  }

  // Ryan's spreadsheet uses:
  // Row 1: spreadsheet title
  // Row 2: platform headings
  // Row 3 onward: games
  const platformRow = rows[1];
  const gameRows = rows.slice(2);

  const games: Game[] = [];

  platformRow.forEach((platformCell, columnIndex) => {
    if (typeof platformCell !== "string") {
      return;
    }

    const platform = platformCell.trim();

    if (!platform) {
      return;
    }

    gameRows.forEach((row) => {
      const gameCell = row[columnIndex];

      if (typeof gameCell !== "string" && typeof gameCell !== "number") {
        return;
      }

      const title = String(gameCell).trim();

      if (!title) {
        return;
      }

      const gameIndex = games.length;

      games.push({
        id: createGameId(title, platform, gameIndex),
        title,
        platform,
      });
    });
  });

  if (games.length === 0) {
    throw new Error("No games were found in the spreadsheet.");
  }

  return games;
}
