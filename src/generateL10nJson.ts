import * as fs from 'fs';
import * as path from 'path';

/**
 * Merge JSON files with same names in two directories into one file with that name in .setting directory.
 * @param dir1 The first directory to search JSON files.
 * @param dir2 The second directory to search JSON files. Optional.
 */
function mergeJsonFiles(dir1: string, dir2?: string) {
    // Create .setting directory if it does not exist.
    const settingDir = path.join(process.cwd(), '.setting');
    if (!fs.existsSync(settingDir)) {
        fs.mkdirSync(settingDir);
    }

    // Traverse all JSON files in the two directories and merge files with the same name.
    const files: Record<string, any> = {};
    function traverseDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                traverseDir(fullPath);
            } else if (entry.isFile() && path.extname(entry.name) === '.json') {
                const name = path.basename(entry.name, '.json');
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                if (files[name]) {
                    files[name] = { ...files[name], ...content };
                } else {
                    files[name] = content;
                }
            }
        }
    }
    traverseDir(dir1);
    if (dir2) {
        traverseDir(dir2);
    }

    // Write the merged JSON content to a file with the same name in .setting directory.
    for (const [name, content] of Object.entries(files)) {
        const fileName = path.join(settingDir, `${name}.json`);
        const sortedContent = sortObjectKeys(content);
        fs.writeFileSync(fileName, JSON.stringify(sortedContent, null, 2));
    }
}

/**
 * Recursively sort object keys in alphabetical order.
 * @param obj The object to sort keys.
 * @returns A new object with sorted keys.
 */
function sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    const keys = Object.keys(obj).sort();
    const result: Record<string, any> = {};
    for (const key of keys) {
        if (typeof obj[key] === 'object') {
            result[key] = sortObjectKeys(obj[key]);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

// Get the directory paths from command line arguments.
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Please provide at least one directory path.');
    process.exit(1);
}
const dir1 = args[0];
const dir2 = args[1];

// Merge JSON files with same names in the two directories and write to .setting directory.
mergeJsonFiles(dir1, dir2);
