
function isMobileDevice() {
    return window.innerWidth <= 767; // Adjust the threshold as needed
}

const displayPlaylists = (playlists) => {
    let html = `<h2>Playlists</h2>`;

    html += `<div id='playlists'>`;

    playlists.forEach((playlist) => {
        html += displayPlaylist(playlist);
    });

    html += `</div>`;
    return html;
}

const displayPlaylist = (playlist) => {

    if (playlist.public == false) return "";

    let html = "";
    html += `<div class="playlist contents">`;
    html += `<iframe src="https://open.spotify.com/embed/playlist/${playlist.id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    html += `</div>`;
    return html;
}

const displayTracks = (tracks) => {
    let html = `<h2>My likes</h2>`;

    html += `<div id='tracks'>`;

    tracks.forEach((track) => {
        html += displayTrack(track);
    });

    html += `</div>`;

    return html;
}

const displayTrack = (track) => {
    let addedAt = undefined; 

    if (track.added_at != undefined) {
        addedAt = new Date(track.added_at);
        track = track.track;
    }

    let html = "<div class='track contents'>";
    if (addedAt) html += `<p> Added : ${addedAt.toLocaleDateString()}</p>`;
    html += `<iframe src="https://open.spotify.com/embed/track/${track.id}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    html += "</div>"
    return html;
}

$(document).ready(function () {

    const url = "http://localhost:8080"

    let likesLimit = 20;
    let playlistsLimit = 10;
    if (isMobileDevice()) {
        likesLimit = 5;
        playlistsLimit = 3;
    }

    $.ajax({
        url: url + `/api/playlist?limit=${playlistsLimit}`,
        type: "GET",
        success: function (response) {
            $("div#my-pills-playlists").html(displayPlaylists(response));
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

    $.ajax({
        url: url + `/api/likes?limit=${likesLimit}`,
        type: "GET",
        success: function (response) {
            $("div#my-pills-likes").html(displayTracks(response));
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

    $("button#topTracks").click(function () {
        $.ajax({
            url: url + "/api/top/tracks",
            type: "GET",
            success: function (response) {
                $("div#items").html(displayTracks(response));
                $("div.track").each(function () { $(this).css('visibility', 'hidden') });
                checkScroll();
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    });

});
