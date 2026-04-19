import path from 'path';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    BRAGS_FOLDER: z.string().default(path.resolve(process.cwd(), 'brags')),
});

export const env = envSchema.parse(process.env);
