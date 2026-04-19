import fs from 'fs';
import path from 'path';

import type { BragDoc, DocMeta, Section } from './types';

import { BRAG_FILENAME_REGEX } from './const';

function parseListItems(content: string): string {
    const lines = content.split('\n');
    let inList = false;
    const result: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
            if (!inList) {
                result.push('<ul class="brag-list">');
                inList = true;
            }
            result.push(`<li>${trimmed.slice(2)}</li>`);
        } else {
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            if (trimmed) {
                result.push(`<p>${trimmed}</p>`);
            }
        }
    }

    if (inList) {
        result.push('</ul>');
    }

    return result.join('\n');
}

function parseLinks(content: string): string {
    return content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="brag-link" target="_blank" rel="noopener">$1</a>',
    );
}

function parseContent(content: string): string {
    return parseLinks(parseListItems(content));
}

export function parseBragDoc(filepath: string): BragDoc | null {
    if (!fs.existsSync(filepath)) {
        return null;
    }

    const raw = fs.readFileSync(filepath, 'utf-8');

    const name = 'Oleg Kamlowski';
    const roleMatch = raw.match(/\*\*Role:\*\*\s*(.+?)(?:\n|$)/);
    const periodMatch = raw.match(/\*\*Period:\*\*\s*(.+?)(?:\n|$)/);

    const sectionHeaderRegex = /^##\s+(\d+)\.\s+(.+)$/gm;
    const matches = [...raw.matchAll(sectionHeaderRegex)];

    const sections: Section[] = [];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];

        const sectionNumber = parseInt(match[1], 10);
        const sectionTitle = match[2].trim();

        const sectionStart = match.index! + match[0].length;
        const sectionEnd = nextMatch ? nextMatch.index! : raw.length;

        const sectionContentRaw = raw.slice(sectionStart, sectionEnd).trim();

        sections.push({
            number: sectionNumber,
            title: sectionTitle,
            content: parseContent(sectionContentRaw),
        });
    }

    return {
        filename: path.basename(filepath),
        title: `Brag Doc — ${name}`,
        name,
        role: roleMatch?.[1].trim() ?? '',
        period: periodMatch?.[1].trim() ?? '',
        sections,
    };
}

export function loadAllBrags(bragsDir: string): DocMeta[] {
    if (!fs.existsSync(bragsDir)) {
        fs.mkdirSync(bragsDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(bragsDir).filter((f) => f.endsWith('.md'));
    const docs: DocMeta[] = [];

    for (const file of files) {
        const doc = parseBragDoc(path.join(bragsDir, file));
        if (doc) {
            docs.push({
                filename: doc.filename,
                name: doc.name,
                role: doc.role,
                period: doc.period,
            });
        }
    }

    return docs.sort((a, b) => b.period.localeCompare(a.period));
}

export function loadBragByFilename(
    bragsDir: string,
    filename: string,
): BragDoc | null {
    if (!BRAG_FILENAME_REGEX.test(filename)) {
        return null;
    }

    const filepath = path.join(bragsDir, filename);
    if (!filepath.endsWith('.md') || !fs.existsSync(filepath)) {
        return null;
    }
    return parseBragDoc(filepath);
}
