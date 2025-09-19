const { generateParams, getToken, authUrl } = require('./backend/authorizationSP.js');
const { getUserPlaylists, getPopularity, getUserLikes, getUserTopTracks, getUserId, makeLikesPublic } = require('./backend/spotifyMethods.js');

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 8080;

const defined_path = [
    "/",
    "/login",
    "/callback",
    "/reception",
    "/recommandations",
]

const reApi = /api\/.*/

// middleware 
const requireAuth = (req, res, next) => {
    if (req.session && req.session.accessToken) {
      next();
    } else {
      res.redirect('/login');
    }
};

// Set EJS as templating engine 
app.use('/src', express.static(path.join(__dirname, 'src')));

app.set('views', path.join(__dirname, 'src/templates'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'oQil0XaEBZYgA8WDMJTpWa8l6GXAmq6SFCXrfkRxVWV3WeVi2R93pe7e5uOHEtQjUf5f9M9ohGFSkEKOekOmAGdfJZL1DWtf',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // permettre l'accès depuis n'importe quelle origine
    res.header('Access-Control-Allow-Methods', 'GET'); // méthodes HTTP autorisées
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // en-têtes autorisés
    next();
});

app.use((req, res, next) => {

    if (defined_path.includes(req.path) || reApi.test(req.path)) {
        next();
    } else {
        res.render('error/error');
    }
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', async (req, res) => {
    
    dic = await generateParams();

    req.session.codeVerifier = dic["code"];

    authUrl.search = new URLSearchParams(dic["params"]).toString();
    res.redirect(authUrl.toString());
});

app.get('/reception', requireAuth, (req, res) => {
    res.render('reception');
});

app.get('/recommandations', requireAuth, (req, res) => {
    res.render('recommandations');
});

app.get('/callback', async (req, res) => {
    let code = req.query.code;

    let codeVerifier = req.session.codeVerifier;

    req.session.accessToken = await getToken(code, codeVerifier);
    req.session.userId = await getUserId(req.session.accessToken);

    res.redirect('/reception');
});

app.get('/api/playlist', requireAuth, async (req, res) => {
    let limit = req.query.limit || 50;

    let playlist = await getUserPlaylists(req.session.accessToken, limit);

    res.send(playlist);
});

app.get('/api/likes', requireAuth, async (req, res) => {
    let offset = req.query.offset;
    let limit = req.query.limit || 50 ;

    let likes = await getUserLikes(req.session.accessToken, limit, offset);

    res.send(likes);
});

app.get('/api/top/tracks', requireAuth, async (req, res) => {
    let offset = req.query.offset;
    let limit = req.query.limit || 50;

    let top = await getUserTopTracks(req.session.accessToken, limit, offset);

    res.send(top);
});

app.get('/api/create/likes_playlist', requireAuth, async (req, res) => {
    
    let response = await makeLikesPublic(req.session.accessToken, req.session.userId);

    res.send(response);
});

app.get('/api/popularity', requireAuth, async (req, res) => {

    let response = await getPopularity(req.session.accessToken);

    res.send({ "popularity_score": response });
});