const UntappdClient = require("node-untappd");
const { addMinutes, compareAsc } = require("date-fns");

const untappd = new UntappdClient(false);
untappd.setClientId(process.env["UNTAPPD_CLIENT_ID"]);
untappd.setClientSecret(process.env["UNTAPPD_CLIENT_SECRET"]);

const cache = {
  expiry: null,
  checkins: []
};

const getCheckins = async () => {
  if (
    cache.expiry != null &&
    compareAsc(cache.expiry, new Date()) &&
    cache.checkins.length > 0
  ) {
    return cache.checkins;
  } else {
    const checkins = await new Promise((res, rej) => {
      untappd.userActivityFeed(
        (err, obj) => {
          if (err != null) {
            rej(err);
          }
          res(obj.response.checkins.items);
        },
        { USERNAME: "mbellgb" }
      );
    });
    cache.expiry = addMinutes(new Date(), 15);
    cache.checkins = checkins;
    return checkins;
  }
};

module.exports = { getCheckins };
