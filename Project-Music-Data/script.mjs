// script.mjs
import { getUserIDs, getListenEvents, getSong } from "./data.mjs";
import { getDay, isFridayNight } from "./src/utils/time.mjs";
import { countBy, sumBy, topN } from "./src/utils/aggregate.mjs";
import { intersection } from "./src/utils/set.mjs";

// Helper to create QA row HTML
function qaRow(question, answer) {
  return answer
    ? `<tr><td><strong>${question}</strong></td><td>${answer}</td></tr>`
    : "";
}

window.onload = function () {
  const userSelect = document.getElementById("userSelect");
  const resultsDiv = document.getElementById("results");

  // Populate user dropdown
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select User";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  userSelect.appendChild(defaultOption);

  getUserIDs().forEach((userID) => {
    const option = document.createElement("option");
    option.value = userID;
    option.textContent = `User ${userID}`;
    userSelect.appendChild(option);
  });

  // Handle user selection
  userSelect.addEventListener("change", (event) => {
    const selectedUser = event.target.value;
    resultsDiv.innerHTML = "";

    if (!selectedUser) return;

    const listens = getListenEvents(Number(selectedUser)) || [];
    if (listens.length === 0) {
      resultsDiv.textContent = "This user didn't listen to any songs.";
      return;
    }

    listens.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Most listened songs/artists (count)
    const songCounts = countBy(listens, (l) => l.song_id);
    const [topSongID, topSongCount] = topN(songCounts, 1)[0] || [];
    const topSong = topSongID ? getSong(topSongID) : null;

    const artistCounts = countBy(listens, (l) => getSong(l.song_id)?.artist);
    const [topArtist, topArtistCount] = topN(artistCounts, 1)[0] || [];

    // Friday night listens
    const fridayListens = listens.filter((l) => isFridayNight(l.timestamp));
    const fridaySongCounts = countBy(fridayListens, (l) => l.song_id);
    const [topFridaySongID] = topN(fridaySongCounts, 1)[0] || [];
    const topFridaySong = topFridaySongID ? getSong(topFridaySongID) : null;

    // Most listened songs/artists by time
    const songDurations = sumBy(
      listens,
      (l) => l.song_id,
      (l) => getSong(l.song_id)?.duration_seconds || 0,
    );
    const [topSongByTimeID] = topN(songDurations, 1)[0] || [];
    const topSongByTime = topSongByTimeID ? getSong(topSongByTimeID) : null;

    const artistDurations = sumBy(
      listens,
      (l) => getSong(l.song_id)?.artist,
      (l) => getSong(l.song_id)?.duration_seconds || 0,
    );
    const [topArtistByTime] = topN(artistDurations, 1)[0] || [];

    // Longest streak song
    let maxStreak = 0,
      curStreak = 0,
      prevSongID = null;
    const streaks = {};
    for (const l of listens) {
      if (l.song_id === prevSongID) {
        curStreak++;
      } else {
        curStreak = 1;
        prevSongID = l.song_id;
      }
      streaks[l.song_id] = Math.max(streaks[l.song_id] || 0, curStreak);
      maxStreak = Math.max(maxStreak, curStreak);
    }
    const topStreakSongs = Object.entries(streaks)
      .filter(([_, count]) => count === maxStreak)
      .map(([id]) => getSong(id))
      .filter(Boolean);

    // --- Songs listened to every day (local timezone safe) ---
    const daysMap = new Map();

    for (const listen of listens) {
      const day = getDay(listen.timestamp); // local YYYY-MM-DD
      if (!daysMap.has(day)) {
        daysMap.set(day, new Set());
      }
      daysMap.get(day).add(listen.song_id);
    }

    // Convert Map values (Sets) into arrays
    const dayArrays = Array.from(daysMap.values(), (set) => [...set]);

    // intersection() returns a Set
    const everyDaySongIDs = intersection(dayArrays);

    // ✅ Convert Set → Array before mapping
    const everyDaySongTitles = [...everyDaySongIDs]
      .map((id) => {
        const song = getSong(id);
        return song ? `${song.artist} - ${song.title}` : null;
      })
      .filter(Boolean);

    // Top genres
    const genreCounts = countBy(listens, (l) => getSong(l.song_id)?.genre);
    const genreEntries = topN(genreCounts, 3);
    const genreLabel =
      genreEntries.length === 1
        ? "Top genre"
        : `Top ${genreEntries.length} genres`;

    // Friday night by time
    const fridaySongDurations = sumBy(
      fridayListens,
      (l) => l.song_id,
      (l) => getSong(l.song_id)?.duration_seconds || 0,
    );
    const [topFridaySongByTimeID] = topN(fridaySongDurations, 1)[0] || [];
    const topFridaySongByTime = topFridaySongByTimeID
      ? getSong(topFridaySongByTimeID)
      : null;

    const topArtistByTimeDuration = artistDurations[topArtistByTime] || 0;

    // Build QA table
    const table = document.createElement("table");
    table.border = "1";
    table.cellPadding = "6";
    table.cellSpacing = "0";

    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Question</th><th>Answer</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    const addRow = (q, a) => {
      if (!a) return;
      const tr = document.createElement("tr");
      const tdQ = document.createElement("td");
      tdQ.appendChild(document.createElement("strong")).textContent = q;
      const tdA = document.createElement("td");
      tdA.textContent = a;
      tr.appendChild(tdQ);
      tr.appendChild(tdA);
      tbody.appendChild(tr);
    };

    addRow(
      "Most listened song (count):",
      topSong
        ? `${topSong.artist} - ${topSong.title} (${topSongCount} times)`
        : null,
    );
    addRow(
      "Most listened song (time):",
      topSongByTime ? `${topSongByTime.artist} - ${topSongByTime.title}` : null,
    );
    addRow(
      "Most listened artist (count):",
      topArtist ? `${topArtist} (${topArtistCount} times)` : null,
    );
    addRow(
      "Most listened artist (time):",
      topArtistByTime
        ? `${topArtistByTime} (${Math.round(topArtistByTimeDuration / 60)} min)`
        : null,
    );
    addRow(
      "Friday night song (count):",
      topFridaySong ? `${topFridaySong.artist} - ${topFridaySong.title}` : null,
    );
    addRow(
      "Friday night song (time):",
      topFridaySongByTime
        ? `${topFridaySongByTime.artist} - ${topFridaySongByTime.title}`
        : null,
    );
    addRow(
      "Longest streak song:",
      topStreakSongs.length && maxStreak > 1
        ? topStreakSongs
            .map((s) => `${s.artist} - ${s.title} (${maxStreak} times)`)
            .join(", ")
        : null,
    );
    addRow(
      "Every day songs:",
      everyDaySongTitles.length ? everyDaySongTitles.join(", ") : null,
    );
    if (genreEntries.length) {
      addRow(genreLabel + ":", genreEntries.map(([g]) => g).join(", "));
    }

    resultsDiv.appendChild(table);
  });
};
