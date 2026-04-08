export default function MusicScreen({
  track,
  progressMs,
  activeLyricIndex,
  lyrics,
  lyricsTranslateY,
  logout,
  formatTime
}) {
  return (
    <main className="layout">
      <section className="left-column">
        <div className="cover-shell">
          <div className="cover-art-frame">
            {track?.image ? (
              <img className="cover-art" src={track.image} alt={track.name} />
            ) : (
              <div className="cover-art cover-placeholder">No track playing</div>
            )}
          </div>
        </div>

        <div className="track-card glass">
          <div className="track-text">
            <h1>{track?.name || "Nothing playing"}</h1>
            <p>{track?.artist || "Open Spotify on one of your devices"}</p>
          </div>

          <div className="progress-block">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: track?.durationMs
                    ? `${(progressMs / track.durationMs) * 100}%`
                    : "0%"
                }}
              />
            </div>

            <div className="time-row">
              <span>{formatTime(progressMs)}</span>
              <span>{formatTime(track?.durationMs || 0)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lyrics-card">
        <div className="lyrics-viewport">
          {lyrics.length ? (
            <div
              className="lyrics-track"
              style={{ transform: lyricsTranslateY }}
            >
              {lyrics.map((line, index) => {
                const offset = index - activeLyricIndex;

                let className = "lyric-line";
                if (offset === 0) className += " active";
                else if (offset === 1) className += " next";
                else if (offset === 2) className += " near";
                else if (offset < 0) className += " past";
                else className += " far";

                return (
                  <p key={`${line.timeMs}-${index}`} className={className}>
                    <span className="lyric-line-inner">{line.text || "♪"}</span>
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="empty-lyrics">
              <p>No synced lyrics found for this track.</p>
            </div>
          )}
        </div>
      </section>

      <div className="logout-zone">
        <button className="logout-btn" onClick={logout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6h9v9M18 6L6 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </main>
  );
}