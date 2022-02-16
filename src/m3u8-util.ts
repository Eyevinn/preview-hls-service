import fetch from "node-fetch";
import m3u8 from "@eyevinn/m3u8";

import Debug from "debug";
const debug = Debug("preview-hls");

const fetchAndParseMediaManifest = (url: string): Promise<any> => {
  debug("Fetch and parse media manifest: " + url);
  return new Promise((resolve, reject) => {
    const parser = m3u8.createStream();
    parser.on("m3u", mediaManifest => {
      let basePath;
      const m = url.match("^(.*)/.*?$");
      if (m) {
        basePath = m[1] + "/";
      }
      mediaManifest.items.PlaylistItem.map(item => item.set("uri", item.get("uri").match(/^http/) ? item.get("uri") : basePath + item.get("uri")));
      resolve(mediaManifest);
    });
    parser.on("error", err => {
      reject({ message: "Failed to parse media manifest: " + err, code: 500 });
    });
    fetch(url).then(response => {
      if (response.ok) {
        response.body.pipe(parser);
      } else {
        reject({ 
          message: `Failed to fetch multi variant manifest: ${response.statusText}`,
          code: response.status,
        });
      }
    }).catch(err => {
      reject({ message: "Fetch error: " + err, code: 500 });
    });
  });
}

export const fetchAndParseHLS = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const parser = m3u8.createStream();
    parser.on("m3u", async (multiVariant) => {
      let basePath;
      const m = url.match("^(.*)/.*?$");
      if (m) {
        basePath = m[1] + "/";
      }
      const streams = multiVariant.items.StreamItem.filter(stream => stream.get("codecs").match(/avc1\./));
      const sortedStreams = streams.sort((a, b) => a.get("bandwidth") > b.get("bandwidth"));
      const mediaManifest = await fetchAndParseMediaManifest(basePath + sortedStreams[0].get("uri"));
      resolve(mediaManifest);
    });
    parser.on("error", err => {
      reject({ message: "Failed to parse multi variant manifest: " + err, code: 500 });
    });
    fetch(url).then(response => {
      if (response.ok) {
        response.body.pipe(parser);
      } else {
        reject({ 
          message: `Failed to fetch multi variant manifest: ${response.statusText}`,
          code: response.status,
        });
      }
    }).catch(err => {
      reject({ message: "Fetch error: " + err, code: 500 });
    });
  });
}

export const findSegmentAtPosition = (m3u, desiredPositionSec) => {
  let idxPos = 0;
  let i = 0;
  while (idxPos < desiredPositionSec) {
    idxPos += m3u.items.PlaylistItem[i].get("duration");
    i++;
  }
  return m3u.items.PlaylistItem[i];
}