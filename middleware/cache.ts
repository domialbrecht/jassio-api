import flatCache from "flat-cache";
import path from "path";
const cache = flatCache.load(path.join(`${__dirname}/../cache/dbCache`));
const duration = 1000 * 60 * 30; //Keep cache alive for 15min, this allows twice check for new materials

const getKey = (key) => {
  var now = new Date().getTime();
  var value = cache.getKey(key);
  if (value === undefined || value.expire < now) {
    return undefined;
  } else {
    return value.data;
  }
};

const setKey = (key, value) => {
  var now = new Date().getTime();
  cache.setKey(key, {
    expire: now + duration,
    data: value,
  });
};

const flatCacheMiddleware = (req, res, next) => {
  let key = "__express__" + req.originalUrl || req.url;
  let cacheContent = getKey(key);
  if (cacheContent) {
    //Enable for cache testing
    //console.log(`GET ${req.originalUrl} ${req.url} FROM CACHE`);
    res.send(cacheContent);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      setKey(key, body);
      cache.save();
      res.sendResponse(body);
    };
    next();
  }
};

export default flatCacheMiddleware;
