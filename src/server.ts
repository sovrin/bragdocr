import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadAllBrags, loadBragByFilename } from './brags.js';
import { env } from './config';
import { BRAG_FILENAME_REGEX } from './const';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/config', (_req: Request, res: Response) => {
    res.json({ name: env.AUTHOR_NAME });
});

app.get('/api/doc', (_req: Request, res: Response) => {
    const docs = loadAllBrags(path.join(__dirname, '../brags'));
    if (docs.length === 0) {
        return res.status(404).json({ error: 'No brag docs found' });
    }
    const latest = docs[0];
    const doc = loadBragByFilename(
        path.join(__dirname, '../brags'),
        latest.filename,
    );
    res.json(doc);
});

app.get('/api/docs/full', (_req: Request, res: Response) => {
    const docs = loadAllBrags(env.BRAGS_FOLDER);
    const fullDocs = docs
        .map((doc) => loadBragByFilename(env.BRAGS_FOLDER, doc.filename))
        .filter(Boolean);
    res.json(fullDocs);
});

app.get('/api/docs', (_req: Request, res: Response) => {
    const docs = loadAllBrags(path.join(__dirname, '../brags'));
    res.json(docs);
});

app.get('/api/docs/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    if (Array.isArray(filename)) {
        return res.status(400).json({
            error: 'Invalid request',
        });
    }

    if (!BRAG_FILENAME_REGEX.test(filename)) {
        return res.status(400).json({ error: 'Invalid brag doc filename' });
    }

    const doc = loadBragByFilename(path.join(__dirname, '../brags'), filename);
    if (!doc) {
        return res.status(404).json({ error: 'Brag doc not found' });
    }
    res.json(doc);
});

app.listen(env.PORT, () => {
    console.log(`Bragdoc running at http://localhost:${env.PORT}`);
    console.log(`Add markdown files to: ${path.join(__dirname, '../brags')}`);
});
