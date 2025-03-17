import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function videoStream(req: Request, res: Response) {
  console.log("reached in videoStream funtion");

  const videoPath = req.file?.path;

  if (!videoPath) {
    alert("file not exist");
    return;
  }
  const videoId = uuid();
  const outputPath = path.join(
    __dirname,
    `../public/hsl_converted_video/${videoId}`
  );
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  const hlsPath = `${outputPath}/index.m3u8`;

  // ffmpeg commond
  const ffmpegPath = ffmpegInstaller.path; // Get the correct FFmpeg path

  const ffmpegCommand = `"${ffmpegPath}" -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  //little advance commond , convert in different resolution , 360p , 720p
  /*
  const ffmpegCommand = `"${ffmpegPath}" -i "${videoPath}" \
  -vf scale=-2:360 -c:v libx264 -crf 23 -preset fast -b:v 800k -hls_segment_filename "${outputPath}/360p_%03d.ts" -hls_time 10 -hls_playlist_type vod "${outputPath}/360p.m3u8" \
  -vf scale=-2:720 -c:v libx264 -crf 23 -preset fast -b:v 2500k -hls_segment_filename "${outputPath}/720p_%03d.ts" -hls_time 10 -hls_playlist_type vod "${outputPath}/720p.m3u8"
  */

  // now we just need to define a header and pipe that header with the response, else handle by video lib.
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`exec error: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    const videoUrl = `http://localhost:3001/public/hsl_converted_video/${videoId}/index.m3u8`;

    res.json({
      message: "Video converted to HLS format",
      videoUrl: videoUrl,
      videoId: videoId,
    });
  });
}

export { videoStream };
