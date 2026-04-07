export async function fetchLyrics({ trackName, artistName, albumName, duration }) {
  const params = new URLSearchParams({
    track_name: trackName || "",
    artist_name: artistName || "",
    album_name: albumName || "",
    duration: duration ? String(Math.round(duration / 1000)) : ""
  });

  const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}
