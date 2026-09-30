const API_KEY = '9b1b7730e8972c47c639e7f6ffb21452'; // 동일한 API Key 사용

const urlParams = new URLSearchParams(window.location.search);
const trackName = urlParams.get('track')?.trim();
const artistName = urlParams.get('artist')?.trim();

async function getTrackDetail(track, artist) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&autocorrect=1&format=json`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.error || !data.track) {
    throw new Error(data.message || 'Track not found');
  }

  return data.track;
}

async function renderDetail() {
  const detailCard = document.getElementById('detail-card');

  if (!trackName || !artistName) {
    detailCard.innerHTML = '<p>잘못된 접근입니다. 곡 정보가 존재하지 않습니다.</p>';
    return;
  }

  try {
    const track = await getTrackDetail(trackName, artistName);

    // 이미지 추출 (앨범 커버 우선, 없으면 트랙 기본 이미지)
    const albumImages = track.album?.image || track.image;
    const coverImgUrl = albumImages?.[3]?.['#text'] || albumImages?.[2]?.['#text'] || '';

    // 태그 배열화 예외 처리
    const rawTags = track.toptags?.tag;
    const tagList = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
    
    const tagsHtml = tagList.length
      ? tagList.map(t => `<span class="tag">#${t.name}</span>`).join('')
      : '<span class="tag">태그 없음</span>';

    const summaryHtml = track.wiki?.summary 
      ? `<div class="wiki-summary">${track.wiki.summary}</div>` 
      : '';

    detailCard.innerHTML = `
      ${coverImgUrl ? `<img src="${coverImgUrl}" alt="${track.name}" class="detail-img" />` : ''}
      <h2>${track.name}</h2>
      <p style="color: #b3b3b3; margin-top: 5px; font-size: 18px;">${track.artist?.name || artistName}</p>

      <div class="detail-info">
        <p><strong>앨범:</strong> ${track.album?.title || '정보 없음'}</p>
        <p><strong>총 재생 횟수:</strong> ${Number(track.playcount || 0).toLocaleString()}회</p>
        <p><strong>청취자 수:</strong> ${Number(track.listeners || 0).toLocaleString()}명</p>
        
        <p style="margin-top: 15px;"><strong>장르/태그:</strong></p>
        <div class="tags">${tagsHtml}</div>

        ${summaryHtml}
      </div>

      <a href="${track.url}" target="_blank" rel="noopener noreferrer" class="lastfm-link">
        Last.fm에서 상세히 보기
      </a>
    `;
  } catch (error) {
    console.error('상세 정보 로드 실패:', error);
    detailCard.innerHTML = `
      <p style="color:#ff5555;">곡 정보를 찾을 수 없습니다 (${error.message}).</p>
      <p style="color:#888; font-size:14px; margin-top:10px;">요청한 곡: <strong>${artistName} - ${trackName}</strong></p>
    `;
  }
}

renderDetail();