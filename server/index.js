// import express from 'express';
// import cors from 'cors';
// import { exec } from 'child_process';
// import util from 'util';

// const app = express();
// const port = 3000;
// const execPromise = util.promisify(exec);

// app.use(cors());

// app.get('/api/get-links', async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

//   try {
//     const cmd = `python -m yt_dlp -J "${videoUrl}"`; // JSON output
//     const { stdout } = await execPromise(cmd);
//     const info = JSON.parse(stdout);

//     const links = info.formats
//       .filter(f => f.url && f.format_note)
//       .map(f => ({
//         url: f.url,
//         quality: f.format_note || f.height || 'unknown',
//         type: f.vcodec === 'none' ? 'audio' : (f.acodec === 'none' ? 'video' : 'video+audio'),
//         filename: `${info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${f.format_id}.${f.ext}`
//       }));

//     res.json({ links });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch video info' });
//   }
// });

// app.listen(port, () => {
//   console.log(`✅ Video downloader API running at http://localhost:${port}`);
// });
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import util from 'util';

const app = express();
const port = 3000;
const execPromise = util.promisify(exec);

app.use(cors());
app.use(express.json());

app.get('/api/get-links', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

  try {
    const cmd = `yt-dlp --cookies cookies.txt -J "${videoUrl}"`;
    const { stdout } = await execPromise(cmd);
    const info = JSON.parse(stdout);

    const links = info.formats
      .filter(f => f.url && (f.vcodec !== 'none' || f.acodec !== 'none'))
      .map(f => ({
        url: f.url,
        quality: f.format_note || f.height || 'unknown',
        type: f.vcodec === 'none' ? 'audio' : (f.acodec === 'none' ? 'video' : 'video+audio'),
        ext: f.ext,
        filename: `${info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${f.format_id}.${f.ext}`
      }));

    res.json({ links });
  } catch (err) {
    console.error("yt-dlp error:", err);
    res.status(500).json({ error: 'yt-dlp failed. The site may not be supported or requires login.' });
  }
});

app.listen(port, () => {
  console.log(`✅ API running at http://localhost:${port}`);
});