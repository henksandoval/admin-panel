import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ignoredDirectories = new Set([
    '.git',
    '.angular',
    '.idea',
    '.vscode',
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
]);

const root = process.cwd();
const isFlatMode = process.argv.includes('--flat');
const useAsciiBranches = process.argv.includes('--ascii') || !process.stdout.isTTY;

const byName = (left, right) =>
  left.name.localeCompare(right.name, undefined, {
    sensitivity: 'base',
    numeric: true,
  });

const listEntries = async (directoryPath) => {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => !(entry.isDirectory() && ignoredDirectories.has(entry.name)))
    .sort(byName);
};

const printTree = async (directoryPath, prefix = '') => {
  const entries = await listEntries(directoryPath);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const isLastEntry = index === entries.length - 1;
    const branch = useAsciiBranches
      ? isLastEntry
        ? '`-- '
        : '|-- '
      : isLastEntry
        ? '└── '
        : '├── ';

    console.log(`${prefix}${branch}${entry.name}`);

    if (entry.isDirectory()) {
      const childPrefix = useAsciiBranches
        ? `${prefix}${isLastEntry ? '    ' : '|   '}`
        : `${prefix}${isLastEntry ? '    ' : '│   '}`;
      await printTree(join(directoryPath, entry.name), childPrefix);
    }
  }
};

const printFlat = async (directoryPath, prefix = '') => {
  const entries = await listEntries(directoryPath);

  for (const entry of entries) {
    const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    console.log(nextPath);

    if (entry.isDirectory()) {
      await printFlat(join(directoryPath, entry.name), nextPath);
    }
  }
};

if (isFlatMode) {
  await printFlat(root);
} else {
  console.log('.');
  await printTree(root);
}