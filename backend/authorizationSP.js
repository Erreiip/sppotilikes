const crypto = require('crypto');

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}

const clientId = '9a899508a4f04358acb05217d5dfca3b';
const redirectUri = 'http://localhost:8080/callback';

const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-read user-top-read';
const authUrl = new URL("https://accounts.spotify.com/authorize")
  
const generateParams = async () => {
	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier)
	const codeChallenge = base64encode(hashed);

	const params = {
		response_type: 'code',
		client_id: clientId,
		scope,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		redirect_uri: redirectUri,
	}

	return { "params": params, "code": codeVerifier };
}

const getToken = async (code, codeVerifier) => {

	const url = 'https://accounts.spotify.com/api/token';

	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
			body: new URLSearchParams({
			client_id: clientId,
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
			code_verifier: codeVerifier,
		}),
	}

	const body = await fetch(url, payload);
	const response = await body.json();

	return response.access_token;
}

const getUserId = async (token) => {
	
}

module.exports = {
	generateParams,
	getToken,
	authUrl,
};
