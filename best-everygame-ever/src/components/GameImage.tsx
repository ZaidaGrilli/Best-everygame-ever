import { useEffect, useState } from "react";
import type { Game } from "../types/game";
import { findGameImage } from "../utils/gameImages";

type GameImageProps = {
  game: Game;
};

type ImageStatus = "loading" | "loaded" | "missing" | "error";

function GameImage({ game }: GameImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    game.imageUrl ?? null,
  );

  const [status, setStatus] = useState<ImageStatus>(
    game.imageUrl ? "loaded" : "loading",
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadImage() {
      if (game.imageUrl) {
        setImageUrl(game.imageUrl);
        setStatus("loaded");
        return;
      }

      setImageUrl(null);
      setStatus("loading");

      try {
        const result = await findGameImage(game.title);

        if (isCancelled) {
          return;
        }

        if (!result) {
          setStatus("missing");
          return;
        }

        setImageUrl(result.imageUrl);
        setStatus("loaded");
      } catch (error) {
        console.error(`Could not load image for ${game.title}:`, error);

        if (!isCancelled) {
          setStatus("error");
        }
      }
    }

    void loadImage();

    return () => {
      isCancelled = true;
    };
  }, [game.id, game.imageUrl, game.title]);

  if (status === "loading") {
    return (
      <div className="game-image-container">
        <span className="image-status-text">Loading image…</span>
      </div>
    );
  }

  if (!imageUrl || status === "missing" || status === "error") {
    return (
      <div className="game-image-container">
        <span className="game-initial">
          {game.title.charAt(0).toUpperCase()}
        </span>

        <small>
          {status === "error" ? "Image unavailable" : "No image found"}
        </small>
      </div>
    );
  }

  return (
    <div className="game-image-container">
      <img
        src={imageUrl}
        alt={`Artwork for ${game.title}`}
        loading="lazy"
        onError={() => {
          setImageUrl(null);
          setStatus("error");
        }}
      />
    </div>
  );
}

export default GameImage;
