import { useEffect } from "react";
import type { Game } from "../../types/game";

type GameComparisonProps = {
  leftGame: Game;
  rightGame: Game;
  comparisonsCompleted: number;
  onChooseLeft: () => void;
  onChooseRight: () => void;
};

function GameComparison({
  leftGame,
  rightGame,
  comparisonsCompleted,
  onChooseLeft,
  onChooseRight,
}: GameComparisonProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        onChooseLeft();
      }

      if (event.key === "ArrowRight") {
        onChooseRight();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onChooseLeft, onChooseRight]);

  return (
    <section className="comparison-page">
      <header className="comparison-header">
        <p className="eyebrow">Head-to-head comparison</p>
        <h1>Which game is better?</h1>

        <p>{comparisonsCompleted} comparisons completed</p>
      </header>

      <div className="comparison-grid">
        <button className="game-choice" type="button" onClick={onChooseLeft}>
          <div className="game-image-placeholder">
            {leftGame.imageUrl ? (
              <img src={leftGame.imageUrl} alt="" />
            ) : (
              <span>{leftGame.title.charAt(0)}</span>
            )}
          </div>

          <div className="game-choice-content">
            <h2>{leftGame.title}</h2>
            <p>{leftGame.platform ?? "Unknown platform"}</p>
            <span>Choose this game ←</span>
          </div>
        </button>

        <div className="versus">VS</div>

        <button className="game-choice" type="button" onClick={onChooseRight}>
          <div className="game-image-placeholder">
            {rightGame.imageUrl ? (
              <img src={rightGame.imageUrl} alt="" />
            ) : (
              <span>{rightGame.title.charAt(0)}</span>
            )}
          </div>

          <div className="game-choice-content">
            <h2>{rightGame.title}</h2>
            <p>{rightGame.platform ?? "Unknown platform"}</p>
            <span>Choose this game →</span>
          </div>
        </button>
      </div>

      <p className="keyboard-hint">
        Use the left and right arrow keys for faster comparisons.
      </p>
    </section>
  );
}

export default GameComparison;
