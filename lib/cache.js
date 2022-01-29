const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 40 });

export async function setCache(key, value, time) {
    return cache.set(key, value, time);
}

export async function getCache(key) {
    const res = await cache.get(key);
    if (!res) {
        return false;
    }
    return res;
}

export async function delCache(key) {
    return cache.ttl(key, 1);
}