import { useMemo } from "react";

const motivationalLines = [
  "Stay locked in.",
  "Build something great today.",
  "Small progress compounds fast.",
  "Make the room match the mindset.",
  "Discipline beats motivation.",
  "One focused hour changes everything.",
  "Keep going. You're closer than you think.",
  "Create the atmosphere you want to live in."
];

export default function HomeScreen({ weather }) {
  const now = new Date();

  const timeString = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  const dateString = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const line = useMemo(() => {
    const dayKey = now.toDateString();
    const hour = now.getHours();

    let total = 0;
    const seed = `${dayKey}-${hour}`;

    for (let i = 0; i < seed.length; i++) {
      total += seed.charCodeAt(i);
    }

    return motivationalLines[total % motivationalLines.length];
  }, [now]);

  return (
    <main className="home-screen">
      <section className="home-main">
        <p className="home-label">Aura</p>
        <h1 className="home-time">{timeString}</h1>
        <p className="home-date">{dateString}</p>
        <p className="home-line">{line}</p>
      </section>

      <section className="home-weather">
        {weather && (
          <>
            <p className="home-weather-temp">{Math.round(weather.tempF)}°</p>
            <p className="home-weather-meta">
              {weather.name} · {weather.condition}
            </p>
          </>
        )}
      </section>
    </main>
  );
}