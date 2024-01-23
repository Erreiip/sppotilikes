const getHeader = (token) => {
    return {
        headers: {
            Authorization: "Bearer " + token
        }
    };
}

const getUrlWithParameter = (url, params) => {
    let getParams = "?";
    for (const [key, value] of Object.entries(params)) {
        getParams += `${key}=${value}&`;
    }
    return url + getParams;
}

const getLikesByUrl = async (url, token, asParameter=true, limit = 50, offset = 0) => {
    let header = getHeader(token);

    if (asParameter) {
        let params = {
            "limit": limit,
            "offset": offset
        };

        url = getUrlWithParameter(url, params);
    }

    let response = await fetch(url, header);
    response = await response.json();

    return response;
}

const createPlaylist = async (token, userId, name, public, collaborative, description) => {
    let url = `https://api.spotify.com/v1/users/${userId}/playlists`;

    data = {
        "name": name,
        "public": public,
        "collaborative": collaborative,
        "description": description
    };

    let params = getHeader(token);
    params["method"] = "POST";
    params["Content-Type"] = 'application/json';
    params["body"] = JSON.stringify(data);

    let response = await fetch(url, params);
    response = await response.json();

    return response;
}

const getUserInfo = async (token) => {
    let url = "https://api.spotify.com/v1/me";

    let header = getHeader(token);

    let response = await fetch(url, header);
    response = await response.json();

    return response;
}

const transformIntoUris = (tracks) => {
    
    let uris = [[]];
    actualIndex = 0;

    tracks.forEach(track => {
        if (uris[actualIndex].length + 1 >= 100) {
            uris.push([]);
            actualIndex++;
        }

        uris[actualIndex].push(track.track["uri"]);
    });

    return uris;
}

// -----------------
// Function exported
// ----------------

const getUserPlaylists = async (token, limit=50) => {
    let url = "https://api.spotify.com/v1/me/playlists";

    let header = getHeader(token);

    let params = {
        "limit": limit
    };

    url = getUrlWithParameter(url, params);

    let response = await fetch(url, header);
    response = await response.json();

    playlists = response["items"];

    return playlists;
}

const getUserLikes = async (token, limit=50, offset=0) => {
    let url = "https://api.spotify.com/v1/me/tracks";
    
    let response = await getLikesByUrl(url, token, true, limit, offset);

    tracks = response["items"];

    return tracks;
}

const getAllUserLikes = async (token) => {
    let url = "https://api.spotify.com/v1/me/tracks";

    let likes = [];

    let response = await getLikesByUrl(url, token);
    likes = likes.concat(response["items"])
    url = response["next"];

    while (url != null) {
        response = await getLikesByUrl(url, token, false);
        likes = likes.concat(response["items"])
        url = response["next"];
    }

    return likes;
}

const getUserTopTracks = async (token, time_range="short_range", limit=50, offset=0) => {
    let url = "https://api.spotify.com/v1/me/top/tracks";

    let header = getHeader(token);

    let params = {
        "limit": limit,
        "offset": offset,
        "time_range": time_range
    };

    url = getUrlWithParameter(url, params);

    let response = await fetch(url, header);
    response = await response.json();
    
    tracks = response["items"];

    return tracks;
}

const getUserId = async (token) => {
    let response = await getUserInfo(token);

    return response["id"];
}

const makeLikesPublic = async (token, userId) => {
    let playlistId = await createPlaylist(token, userId, "TEST2", false, false, "shesh");
    playlistId = playlistId["id"];

    let likes = await getAllUserLikes(token);

    let uris = transformIntoUris(likes);

    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    let header = getHeader(token);

    uris.forEach(async (uri) => {
        let data = {
            "uris": uri
        };

        let params = header;
        params["method"] = "POST";
        params["Content-Type"] = 'application/json';
        params["body"] = JSON.stringify(data);

        let response = await fetch(url, params);
        response = await response.json();
    });
}

const getPopularity = async (token) => {

    let likes = await getAllUserLikes(token);

    if ( likes.length == 0 ) {
        return 0;
    }

    let avg_popularity = 0;

    likes.forEach(track => {

        avg_popularity += track.track.popularity;
    });

    avg_popularity /= likes.length;

    return avg_popularity;
}

module.exports = {
    getUserPlaylists,
    getPopularity,
    getUserLikes,
    getUserTopTracks,
    getAllUserLikes,
    getUserId,
    makeLikesPublic,
}