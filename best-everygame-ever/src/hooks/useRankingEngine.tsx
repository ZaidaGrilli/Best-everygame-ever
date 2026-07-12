import { useMemo, useState } from "react";
import type { Game } from "../types/game";

type RankingStatus = "idle" | "comparing" | "completed";

type MergeState = {
  left: Game[];
  right: Game[];
  leftIndex: number;
  rightIndex: number;
  merged: Game[];
};

type RankingEngineState = {
  status: RankingStatus;
  currentRuns: Game[][];
  nextRuns: Game[][];
  pairIndex: number;
  merge: MergeState | null;
  comparisonsCompleted: number;
  finalRanking: Game[];
};

const initialState: RankingEngineState = {
  status: "idle",
  currentRuns: [],
  nextRuns: [],
  pairIndex: 0,
  merge: null,
  comparisonsCompleted: 0,
  finalRanking: [],
};

function createInitialState(games: Game[]): RankingEngineState {
  const shuffledGames = [...games];

  for (let index = shuffledGames.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledGames[index], shuffledGames[randomIndex]] = [
      shuffledGames[randomIndex],
      shuffledGames[index],
    ];
  }

  const runs = shuffledGames.map((game) => [game]);

  return prepareNextComparison({
    status: "comparing",
    currentRuns: runs,
    nextRuns: [],
    pairIndex: 0,
    merge: null,
    comparisonsCompleted: 0,
    finalRanking: [],
  });
}

function prepareNextComparison(state: RankingEngineState): RankingEngineState {
  let workingState = state;

  while (true) {
    if (workingState.currentRuns.length === 1) {
      return {
        ...workingState,
        status: "completed",
        finalRanking: workingState.currentRuns[0],
        merge: null,
      };
    }

    if (workingState.pairIndex >= workingState.currentRuns.length) {
      workingState = {
        ...workingState,
        currentRuns: workingState.nextRuns,
        nextRuns: [],
        pairIndex: 0,
        merge: null,
      };

      continue;
    }

    const left = workingState.currentRuns[workingState.pairIndex];
    const right = workingState.currentRuns[workingState.pairIndex + 1];

    if (!right) {
      workingState = {
        ...workingState,
        nextRuns: [...workingState.nextRuns, left],
        pairIndex: workingState.pairIndex + 1,
      };

      continue;
    }

    return {
      ...workingState,
      merge: {
        left,
        right,
        leftIndex: 0,
        rightIndex: 0,
        merged: [],
      },
    };
  }
}

function selectWinner(
  state: RankingEngineState,
  selectedSide: "left" | "right",
): RankingEngineState {
  const merge = state.merge;

  if (!merge) {
    return state;
  }

  let nextLeftIndex = merge.leftIndex;
  let nextRightIndex = merge.rightIndex;

  const selectedGame =
    selectedSide === "left"
      ? merge.left[merge.leftIndex]
      : merge.right[merge.rightIndex];

  if (selectedSide === "left") {
    nextLeftIndex += 1;
  } else {
    nextRightIndex += 1;
  }

  const nextMerged = [...merge.merged, selectedGame];

  const leftFinished = nextLeftIndex >= merge.left.length;
  const rightFinished = nextRightIndex >= merge.right.length;

  if (!leftFinished && !rightFinished) {
    return {
      ...state,
      comparisonsCompleted: state.comparisonsCompleted + 1,
      merge: {
        ...merge,
        leftIndex: nextLeftIndex,
        rightIndex: nextRightIndex,
        merged: nextMerged,
      },
    };
  }

  const remainingLeft = merge.left.slice(nextLeftIndex);
  const remainingRight = merge.right.slice(nextRightIndex);

  const completedMerge = [...nextMerged, ...remainingLeft, ...remainingRight];

  return prepareNextComparison({
    ...state,
    comparisonsCompleted: state.comparisonsCompleted + 1,
    nextRuns: [...state.nextRuns, completedMerge],
    pairIndex: state.pairIndex + 2,
    merge: null,
  });
}

export function useRankingEngine() {
  const [state, setState] = useState<RankingEngineState>(initialState);

  const currentComparison = useMemo(() => {
    if (!state.merge) {
      return null;
    }

    return {
      left: state.merge.left[state.merge.leftIndex],
      right: state.merge.right[state.merge.rightIndex],
    };
  }, [state.merge]);

  function startRanking(games: Game[]) {
    if (games.length < 2) {
      return;
    }

    setState(createInitialState(games));
  }

  function chooseLeft() {
    setState((currentState) => selectWinner(currentState, "left"));
  }

  function chooseRight() {
    setState((currentState) => selectWinner(currentState, "right"));
  }

  function resetRanking() {
    setState(initialState);
  }

  return {
    status: state.status,
    currentComparison,
    comparisonsCompleted: state.comparisonsCompleted,
    finalRanking: state.finalRanking,
    startRanking,
    chooseLeft,
    chooseRight,
    resetRanking,
  };
}
