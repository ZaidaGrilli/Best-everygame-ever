import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Game } from "../../types/game";
import { parseGameSpreadsheet } from "../../utils/parserGames";

type GameSpreadsheetImportProps = {
  onGamesImported: (games: Game[]) => void;
};

function GameSpreadsheetImport({
  onGamesImported,
}: GameSpreadsheetImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const games = await parseGameSpreadsheet(file);
      onGamesImported(games);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "The spreadsheet could not be read.";

      setError(message);
    } finally {
      setIsLoading(false);

      // Allows the same file to be selected again later.
      event.target.value = "";
    }
  }

  return (
    <section className="spreadsheet-import">
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />

      <button
        className="primary-button"
        type="button"
        disabled={isLoading}
        onClick={openFilePicker}
      >
        {isLoading ? "Reading game list..." : "Import game list"}
      </button>

      <p className="supported-files">
        Supports Ryan's current Excel layout, standard Excel files, and CSV.
      </p>

      {error && <p className="import-error">{error}</p>}
    </section>
  );
}

export default GameSpreadsheetImport;
