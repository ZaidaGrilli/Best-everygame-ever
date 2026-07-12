export type ComparisonResult = {
  leftGameId: string;
  rightGameId: string;
  winnerId: string;
  createdAt: string;
};

export type RankingSessionStatus = "setup" | "comparing" | "completed";

export type RankingSession = {
  id: string;
  name: string;
  games: string[];
  comparisons: ComparisonResult[];
  status: RankingSessionStatus;
  finalRanking?: string[];
};
