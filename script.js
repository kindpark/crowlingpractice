const API_KEY = "9b1b7730e8972c47c639e7f6ffb21452";

//top 30 받아옴
async function getTopTracks() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&limit=30&api_key=${API_KEY}&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.tracks.track;
}
//화면에 노래 목록 띄우기
function displayTracks(tracks) {
  const rankBadges = ["🏆 1st", "🥈 2nd", "🥉 3rd"];
  const songListContainer = document.getElementById("song-list");
  songListContainer.innerHTML = "";
  if (!tracks || tracks.length === 0) {
    songListContainer.innerHTML =
      "<p>불러올 데이터가 없거나 토큰이 만료되었습니다.</p>";
    return;
  }
  tracks.sort((a, b) => Number(b.listeners) - Number(a.listeners));
  tracks.forEach((track, index) => {
    const card = document.createElement("div");
    const isTopRank = index < 3;
    card.className = `card ${isTopRank ? "top-rank" : ""}`;
    const imgUrl =
      track.image?.[2]?.["#text"] || track.image?.[1]?.["#text"] || "";
    //구조분기 1~3등, 이외
    if (isTopRank) {
      card.innerHTML = `
        ${isTopRank ? `<div class="rank-badge rank-${index + 1}">${rankBadges[index]}</div>` : ""}
        ${imgUrl ? `<img src="${imgUrl}" alt="${track.name}" class="card-img" />` : ""}
      <div class="card-body">
        <div class="title">${track.name}</div>
        <div class="artist">${track.artist.name}</div>
        <div class="listeners">청취자: ${Number(track.listeners).toLocaleString()}명</div>
      </div>`;
    } else {
      card.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" alt="${track.name}" class="top-card-img" />` : '<div class="no-img">No Image</div>'}
      <div class="top-card-body">
        <div class="top-title">${index + 1}. ${track.name}</div>
        <div class="top-artist">${track.artist.name}</div>
        <div class="top-listeners">청취자: ${Number(track.listeners).toLocaleString()}명</div>
      </div>`;
    }

    card.addEventListener("click", () => {
      const trackName = encodeURIComponent(track.name);
      const artistName = encodeURIComponent(track.artist.name);
      window.location.href = `detail.html?track=${trackName}&artist=${artistName}`;
    });
    songListContainer.appendChild(card);
  });
}
async function displayTrackLoad() {
  try {
    const tracks = await getTopTracks();
    displayTracks(tracks);
  } catch (error) {
    console.error("데이터를 가져 오는 중 오류 발생:", error);
    const songListContainer = document.getElementById("song-list");
    if (songListContainer) {
      songListContainer.innerHTML =
        "<p>데이터 가져오는 중 오류가 발생했습니다. API KEY를 확인하세요.</p>";
    }
  }
}
window.addEventListener("DOMContentLoaded", displayTrackLoad);
