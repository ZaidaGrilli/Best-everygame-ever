type DeveloperPanelProps = {
  debugInfo: {
    status: string;
    comparisonsCompleted: number;
    totalGames: number;
    currentRunsCount: number;
    nextRunsCount: number;
    pairIndex: number;
    leftIndex: number | null;
    rightIndex: number | null;
    currentLeftTitle: string | null;
    currentRightTitle: string | null;
    currentLeftRunSize: number;
    currentRightRunSize: number;
    mergedItemsCount: number;
    finalRankingCount: number;
  };
};

function DeveloperPanel({ debugInfo }: DeveloperPanelProps) {
  // ==========================================================
  // DEV-ONLY PANEL
  // This component is rendered only when import.meta.env.DEV
  // is true. It will not appear in the deployed production app.
  // ==========================================================

  return (
    <aside className="developer-panel">
      <h2>Developer Debug Panel</h2>

      <dl className="developer-grid">
        <div>
          <dt>Status</dt>
          <dd>{debugInfo.status}</dd>
        </div>

        <div>
          <dt>Comparisons completed</dt>
          <dd>{debugInfo.comparisonsCompleted}</dd>
        </div>

        <div>
          <dt>Total games</dt>
          <dd>{debugInfo.totalGames}</dd>
        </div>

        <div>
          <dt>Current runs</dt>
          <dd>{debugInfo.currentRunsCount}</dd>
        </div>

        <div>
          <dt>Next runs</dt>
          <dd>{debugInfo.nextRunsCount}</dd>
        </div>

        <div>
          <dt>Pair index</dt>
          <dd>{debugInfo.pairIndex}</dd>
        </div>

        <div>
          <dt>Left index</dt>
          <dd>{debugInfo.leftIndex ?? "None"}</dd>
        </div>

        <div>
          <dt>Right index</dt>
          <dd>{debugInfo.rightIndex ?? "None"}</dd>
        </div>

        <div>
          <dt>Left run size</dt>
          <dd>{debugInfo.currentLeftRunSize}</dd>
        </div>

        <div>
          <dt>Right run size</dt>
          <dd>{debugInfo.currentRightRunSize}</dd>
        </div>

        <div>
          <dt>Merged items</dt>
          <dd>{debugInfo.mergedItemsCount}</dd>
        </div>

        <div>
          <dt>Final ranking size</dt>
          <dd>{debugInfo.finalRankingCount}</dd>
        </div>
      </dl>

      <div className="developer-current-pair">
        <p>
          <strong>Current left:</strong> {debugInfo.currentLeftTitle ?? "None"}
        </p>

        <p>
          <strong>Current right:</strong>{" "}
          {debugInfo.currentRightTitle ?? "None"}
        </p>
      </div>
    </aside>
  );
}

export default DeveloperPanel;
