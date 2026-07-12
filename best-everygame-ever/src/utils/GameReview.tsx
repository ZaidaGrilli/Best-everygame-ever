import { useMemo, useState } from "react";
import type { Game } from "../types/game";
import { findDuplicateGames } from "./gameDuplicates";

type GameReviewProps = {
  games: Game[];
  onGamesChange: (games: Game[]) => void;
  onStartComparing: () => void;
};

function GameReview({
  games,
  onGamesChange,
  onStartComparing,
}: GameReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const duplicateGroups = useMemo(() => {
    return findDuplicateGames(games);
  }, [games]);

  const duplicateIds = useMemo(() => {
    return new Set(
      duplicateGroups.flatMap((group) => group.map((game) => game.id)),
    );
  }, [duplicateGroups]);

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    if (!normalizedSearch) {
      return games;
    }

    return games.filter((game) => {
      const searchableText =
        `${game.title} ${game.platform ?? ""}`.toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [games, searchTerm]);

  function removeGame(gameId: string) {
    onGamesChange(games.filter((game) => game.id !== gameId));
  }

  function updateGameTitle(gameId: string, title: string) {
    onGamesChange(
      games.map((game) =>
        game.id === gameId
          ? {
              ...game,
              title,
            }
          : game,
      ),
    );
  }

  return (
    <section className="game-review">
      <header className="review-header">
        <div>
          <p className="eyebrow">Imported successfully</p>
          <h2>Review your games</h2>

          <p>
            {games.length} games imported
            {duplicateGroups.length > 0 &&
              ` · ${duplicateGroups.length} duplicate groups found`}
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={games.length < 2}
          onClick={onStartComparing}
        >
          Start comparing
        </button>
      </header>

      {duplicateGroups.length > 0 && (
        <section className="duplicate-section">
          <h3>Possible duplicates</h3>

          <p>
            The same game may appear under multiple platforms. Keep both if Ryan
            considers them separate experiences, or remove one.
          </p>

          <div className="duplicate-groups">
            {duplicateGroups.map((group) => (
              <div
                className="duplicate-group"
                key={group.map((game) => game.id).join("-")}
              >
                {group.map((game) => (
                  <div className="duplicate-game" key={game.id}>
                    <div>
                      <strong>{game.title}</strong>
                      <span>{game.platform ?? "Unknown platform"}</span>
                    </div>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => removeGame(game.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <label className="search-field">
        <span>Search games</span>

        <input
          type="search"
          value={searchTerm}
          placeholder="Search by title or platform"
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </label>

      <div className="review-list">
        {filteredGames.map((game, index) => (
          <article
            className={`review-game ${
              duplicateIds.has(game.id) ? "review-game-duplicate" : ""
            }`}
            key={game.id}
          >
            <span className="game-number">{index + 1}</span>

            <div className="review-game-fields">
              <input
                aria-label={`Title for ${game.title}`}
                value={game.title}
                onChange={(event) =>
                  updateGameTitle(game.id, event.target.value)
                }
              />

              <span>{game.platform ?? "Unknown platform"}</span>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => removeGame(game.id)}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GameReview;
