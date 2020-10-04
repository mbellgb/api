const Koa = require("koa");

const { getPosts } = require("./blog");
const { getPlaylist } = require("./spotify");
const { getCheckins } = require("./untappd");
const app = new Koa();

app.use(require("koa-static")("public"));

const router = require("koa-router")();

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  await next(ctx);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.body = { message: "Internal server error occured." };
  }
});

router.get("/music/", async ctx => {
  const playlistItems = await getPlaylist(process.env["SPOTIFY_PLAYLIST"]);
  ctx.body = {
    tracks: playlistItems.map(item => ({
      album: item.track.album.name,
      images: item.track.album.images,
      artists: item.track.artists,
      url: item.track.external_urls.spotify,
      name: item.track.name
    }))
  };
});

router.get("/beers/", async ctx => {
  ctx.body = await getCheckins();
});

router.get("/posts/", async ctx => {
  ctx.body = await getPosts();
});

app.use(router.routes());
app.use(router.allowedMethods());

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
