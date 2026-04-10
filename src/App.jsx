import { useEffect, useMemo, useState } from "react";
import {
  clearCodeFromUrl,
  exchangeCodeForToken,
  getAccessToken,
  getCodeFromUrl,
  loginWithSpotify,
  logout
} from "./lib/auth";
import { getCurrentlyPlaying } from "./lib/spotify";
import { fetchLyrics } from "./lib/lrclib";
import { extractGradientColors } from "./lib/colors";
import { getActiveLyricIndex, parseSyncedLyrics } from "./lib/lyrics";
import { fetchWeather } from "./lib/weather";
import HomeScreen from "./components/HomeScreen";
import MusicScreen from "./components/MusicScreen";
import { startAuraSpeechRecognition } from "./lib/auraVoice";
import { askAura } from "./lib/auraAssistant";
import {
  loadTodos,
  saveTodos,
  addTodo,
  clearTodos,
  toggleTodoComplete,
  removeTodoById,
  removeTodoByText,
  completeTodoByText,
  parseTodoCommand
} from "./lib/todoManager";

function formatTime(ms) {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function App() {
  const [auraText, setAuraText] = useState("");
  const [auraStatus, setAuraStatus] = useState("idle");
  
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [track, setTrack] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [progressMs, setProgressMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [weather, setWeather] = useState(null);
  const [todos, setTodos] = useState([]);
  const [colors, setColors] = useState([
    "rgb(34, 20, 64)",
    "rgb(11, 12, 24)",
    "rgb(88, 40, 140)",
    "rgb(18, 28, 54)"
  ]);
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
  if (!auraText) return;

    const wordCount = auraText.split(" ").length;
    // base time + reading time
  const duration = Math.min(
    10000, // max 10s
    2500 + wordCount * 180 // ~180ms per word
  );
  const timer = setTimeout(() => {
    setAuraText("");
  }, duration);

    return () => clearTimeout(timer);
  }, [auraText]);

  useEffect(() => {
  function handleKeyDown(event) {
    const showMusicScreen = Boolean(track && isPlaying);

    if (showMusicScreen) return;

    if (event.shiftKey && event.key.toLowerCase() === "a") {
      event.preventDefault();

      if (auraStatus === "listening" || auraStatus === "thinking") {
        return;
      }

      setAuraStatus("listening");

      startAuraSpeechRecognition({
        onStateChange: (state) => {
          setAuraStatus(state);
        },

        onTranscript: async (transcript) => {
  try {
    const command = parseTodoCommand(transcript);

    const lower = transcript.trim().toLowerCase();

const wantsDismiss =
  lower === "dismiss" ||
  lower === "dismissed" ||
  lower === "close" ||
  lower === "clear" ||
  lower === "hide that" ||
  lower === "hide response";

if (auraText && wantsDismiss) {
  setAuraText("");
  setAuraStatus("idle");
  return;
}

    if (command.type === "add" && command.value) {
      setTodos((prev) => {
        const next = addTodo(prev, command.value);
        return next;
      });
      setAuraText(`Added "${command.value}".`);
      setAuraStatus("idle");
      return;
    }

    if (command.type === "remove" && command.value) {
      let removed = false;

      setTodos((prev) => {
        const next = removeTodoByText(prev, command.value);
        removed = next.length !== prev.length;
        return next;
      });

      setAuraText(
        removed
          ? `Removed "${command.value}".`
          : `Couldn't find "${command.value}".`
      );
      setAuraStatus("idle");
      return;
    }

    if (command.type === "complete" && command.value) {
      let completed = false;

      setTodos((prev) => {
        const next = completeTodoByText(prev, command.value);
        completed = next.some(
          (todo, index) =>
            todo.completed && !prev[index]?.completed && todo.text === prev[index]?.text
        );
        return next;
      });

      setAuraText(
        completed
          ? `Crossed off "${command.value}".`
          : `Couldn't find "${command.value}".`
      );
      setAuraStatus("idle");
      return;
    }

    if (command.type === "clear") {
      setTodos(clearTodos());
      setAuraText("Cleared your to-do list.");
      setAuraStatus("idle");
      return;
    }

    setAuraStatus("thinking");
    const text = await askAura(transcript);
    setAuraText(text);
  } catch (error) {
    console.error(error);
    setAuraText("Something went wrong.");
  } finally {
    setAuraStatus("idle");
  }
},
        onError: (error) => {
          console.error(error);
          setAuraStatus("idle");
          setAuraText("Mic unavailable.");
        }
      });
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [track, isPlaying, auraStatus]);

  useEffect(() => {
    async function handleAuth() {
      try {
        const code = getCodeFromUrl();

        if (code && !getAccessToken()) {
          await exchangeCodeForToken(code);
          clearCodeFromUrl();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAuth(false);
      }
    }

    handleAuth();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const data = await fetchWeather();
        if (!cancelled) {
          setWeather(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadWeather();
    const interval = setInterval(loadWeather, 1000 * 60 * 20);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!getAccessToken()) return;

    let cancelled = false;

    async function loadCurrentTrack() {
      try {
        const data = await getCurrentlyPlaying();

        if (!data || !data.item || cancelled) {
          setTrack(null);
          setIsPlaying(false);
          return;
        }

        const nextTrack = {
          id: data.item.id,
          name: data.item.name,
          artist: data.item.artists?.map((artist) => artist.name).join(", "),
          album: data.item.album?.name,
          image: data.item.album?.images?.[0]?.url || "",
          durationMs: data.item.duration_ms
        };

        setTrack(nextTrack);
        setProgressMs(data.progress_ms || 0);
        setIsPlaying(Boolean(data.is_playing));
      } catch (error) {
        console.error(error);
        setTrack(null);
        setIsPlaying(false);
      }
    }

    loadCurrentTrack();
    const interval = setInterval(loadCurrentTrack, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loadingAuth]);

  useEffect(() => {
    if (!track?.image) {
      setColors([
        "rgb(34, 20, 64)",
        "rgb(11, 12, 24)",
        "rgb(88, 40, 140)",
        "rgb(18, 28, 54)"
      ]);
      return;
    }

    extractGradientColors(track.image).then((nextColors) => {
      setColors(nextColors);
    });
  }, [track?.image]);

  useEffect(() => {
    if (!track) {
      setLyrics([]);
      return;
    }

    async function loadLyrics() {
      try {
        const data = await fetchLyrics({
          trackName: track.name,
          artistName: track.artist,
          albumName: track.album,
          duration: track.durationMs
        });

        const synced = data?.syncedLyrics || data?.synced_lyrics || "";
        setLyrics(parseSyncedLyrics(synced));
      } catch (error) {
        console.error(error);
        setLyrics([]);
      }
    }

    loadLyrics();
  }, [track?.id]);

  useEffect(() => {
    if (!isPlaying || !track?.durationMs) return;

    const timer = setInterval(() => {
      setProgressMs((prev) => Math.min(prev + 1000, track.durationMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, track?.durationMs]);

  const activeLyricIndex = useMemo(() => {
    return getActiveLyricIndex(lyrics, progressMs);
  }, [lyrics, progressMs]);

  const lyricLineHeight = 150;
  const activeLineTop = 290;

  const lyricsTranslateY =
    activeLyricIndex >= 0
      ? `translateY(${activeLineTop - activeLyricIndex * lyricLineHeight}px)`
      : `translateY(${activeLineTop}px)`;

  const styleVars = {
    "--g1": colors[0],
    "--g2": colors[1],
    "--g3": colors[2],
    "--g4": colors[3]
  };

  if (loadingAuth) {
    return (
      <div className="app shell-center" style={styleVars}>
        <div className="mesh-bg" />
        <div className="grain" />
        <div className="panel-card">Loading Spotify session...</div>
      </div>
    );
  }

  if (!getAccessToken()) {
    return (
      <div className="app shell-center" style={styleVars}>
        <div className="mesh-bg" />
        <div className="grain" />
        <div className="panel-card login-card">
          <p className="eyebrow">Aura</p>
          <h1>Connect Spotify</h1>
          <p className="subtext">
            Turn your music into atmosphere.
          </p>
          <button className="primary-btn" onClick={loginWithSpotify}>
            Continue with Spotify
          </button>
        </div>
      </div>
    );
  }

  const showMusicScreen = Boolean(track && isPlaying);

  return (
    <div className="app" style={styleVars}>
      <div className="mesh-bg" />
      <div className="grain" />

      <div className={`screen-layer ${showMusicScreen ? "hidden" : "visible"}`}>
        <HomeScreen
          weather={weather}
          auraText={auraText}
          auraStatus={auraStatus}
          todos={todos}
          onToggleTodo={(id) => {
            setTodos((prev) => toggleTodoComplete(prev, id));
          }}
          onRemoveTodo={(id) => {
            setTodos((prev) => removeTodoById(prev, id));
          }}
        />
        
      </div>

      <div className={`screen-layer ${showMusicScreen ? "visible" : "hidden"}`}>
        <MusicScreen
          track={track}
          progressMs={progressMs}
          activeLyricIndex={activeLyricIndex}
          lyrics={lyrics}
          lyricsTranslateY={lyricsTranslateY}
          logout={logout}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
}