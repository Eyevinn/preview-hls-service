import { spawn } from "child_process";
import crypto from "crypto";
import { readFileSync } from "fs";
import Debug from "debug";
const debug = Debug("preview-hls-ffmpeg");

export const renderMp4FromTS = async (url: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const outputFilePath = "/media/output/" + hash + ".mp4";
    const process = spawn("ffmpeg", [ "-y", "-i", url, "-c:v", "copy", "-c:a", "copy", outputFilePath ]);
    process.stdout.on("data", (data) => { debug(`${data}`) });
    process.stderr.on("data", (data) => { debug(`${data}`) });
    process.on("exit", (code) => {
      if (code > 0) {
        reject("failed to process video");
      } else {
        const data = readFileSync(outputFilePath);
        resolve(data);
      }
    });
  });
}

export const renderPngFromTS = async (url: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const outputFilePath = "/media/output/" + hash + ".png";
    const process = spawn("ffmpeg", [ "-y", "-i", url, "-ss", "1", "-t", "1", "-f", "mjpeg", outputFilePath ]);
    process.stdout.on("data", (data) => { debug(`${data}`) });
    process.stderr.on("data", (data) => { debug(`${data}`) });
    process.on("exit", (code) => {
      if (code > 0) {
        reject("failed to process video");
      } else {
        const data = readFileSync(outputFilePath);
        resolve(data);
      }
    });
  });
}