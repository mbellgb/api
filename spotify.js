const fetch = require("node-fetch");
const { URLSearchParams } = require("url")
const { addSeconds, compareAsc } = require("date-fns");

const config = {
  token: "",
  expiry: undefined,
};

const getCredentials = async (clientId, clientSecret) => {
    const basicAuthCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const reqBody = new URLSearchParams();
    reqBody.append("grant_type", "client_credentials");
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: reqBody,
        headers: {
            "Authorization": `Basic ${basicAuthCredentials}`,
        }
    });
    if (!res.ok) {
        const data = await res.text();
        console.error("Error getting credentials from Spotify")
        throw new Error(`Bad response from server: ${data}`)
    }
    const body = await res.json();
    const expiryDate = addSeconds(new Date(), body.expires_in)
    return { token: body.access_token, expiry: expiryDate };
}

const checkAuth = async () => {
    if (config.token == "" || compareAsc(new Date(), config.expiry)) {
        const {token, expiry} = await getCredentials(
            process.env["SPOTIFY_CLIENT_ID"],
            process.env["SPOTIFY_CLIENT_SECRET"]
        );
        console.log(`Spotify token renewed until ${expiry}`);
        config.token = token;
        config.expiry = expiry;
    }
}

const getPlaylist = async (playlistID) => {
    await checkAuth();
    try {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
            {
                headers: {
                    "Authorization": `Bearer ${config.token}`
                }
            });
        if (!res.ok) {
            console.log(await res.text())
            throw new Error("Bad response");
        }
        const { items } = await res.json();
        return items;
    } catch (err) {
        console.log(err)
        return [];
    }
}

module.exports = {
    getPlaylist,
}
