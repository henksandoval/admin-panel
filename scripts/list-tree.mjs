import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIRECTORIES_TO_IGNORE = new Set([
  '.git',
  '.angular',
  '.idea',
  '.vscode',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const projectRootPath = process.cwd();
const shouldPrintFlatList = process.argv.includes('--flat');
const shouldUseAsciiCharacters = process.argv.includes('--ascii') || !process.stdout.isTTY;

const ignoreExtensionArgument = process.argv.find(arg => arg.startsWith('--ignore-ext='));
const onlyExtensionArgument = process.argv.find(arg => arg.startsWith('--only-ext='));

const extensionsToIgnore = ignoreExtensionArgument ? ignoreExtensionArgument.split('=')[1].split(',') : [];
const extensionsToKeep = onlyExtensionArgument ? onlyExtensionArgument.split('=')[1].split(',') : [];

const compareEntriesByName = (firstEntry, secondEntry) =>
  firstEntry.name.localeCompare(secondEntry.name, undefined, {
    sensitivity: 'base',
    numeric: true,
  });

const getFilteredAndSortedEntries = async (currentDirectoryPath) => {
  const allEntries = await readdir(currentDirectoryPath, { withFileTypes: true });

  return allEntries
    .filter((entry) => {
      if (entry.isDirectory()) {
        const isIgnoredDirectory = DIRECTORIES_TO_IGNORE.has(entry.name);
        return !isIgnoredDirectory;
      }

      if (entry.isFile()) {
        const hasIgnoredExtension = extensionsToIgnore.some(ext => entry.name.endsWith(ext));
        if (hasIgnoredExtension) return false;

        if (extensionsToKeep.length > 0) {
          const hasKeptExtension = extensionsToKeep.some(ext => entry.name.endsWith(ext));
          if (!hasKeptExtension) return false;
        }
      }

      return true;
    })
    .sort(compareEntriesByName);
};

const printDirectoryTree = async (currentDirectoryPath, currentIndentation = '') => {
  const directoryEntries = await getFilteredAndSortedEntries(currentDirectoryPath);

  for (let index = 0; index < directoryEntries.length; index += 1) {
    const entry = directoryEntries[index];
    const isLastEntryInDirectory = index === directoryEntries.length - 1;

    let branchSymbol = '';
    if (shouldUseAsciiCharacters) {
      branchSymbol = isLastEntryInDirectory ? '`-- ' : '|-- ';
    } else {
      branchSymbol = isLastEntryInDirectory ? '└── ' : '├── ';
    }

    console.log(`${currentIndentation}${branchSymbol}${entry.name}`);

    if (entry.isDirectory()) {
      let childIndentationSymbol = '';
      if (shouldUseAsciiCharacters) {
        childIndentationSymbol = isLastEntryInDirectory ? '    ' : '|   ';
      } else {
        childIndentationSymbol = isLastEntryInDirectory ? '    ' : '│   ';
      }

      const nextIndentation = `${currentIndentation}${childIndentationSymbol}`;
      const childDirectoryPath = join(currentDirectoryPath, entry.name);

      await printDirectoryTree(childDirectoryPath, nextIndentation);
    }
  }
};

const printFlatDirectoryList = async (currentDirectoryPath, relativePathPrefix = '') => {
  const directoryEntries = await getFilteredAndSortedEntries(currentDirectoryPath);

  for (const entry of directoryEntries) {
    const fullRelativePath = relativePathPrefix
      ? `${relativePathPrefix}/${entry.name}`
      : entry.name;

    console.log(fullRelativePath);

    if (entry.isDirectory()) {
      const childDirectoryPath = join(currentDirectoryPath, entry.name);
      await printFlatDirectoryList(childDirectoryPath, fullRelativePath);
    }
  }
};

if (shouldPrintFlatList) {
  await printFlatDirectoryList(projectRootPath);
} else {
  console.log('.');
  await printDirectoryTree(projectRootPath);
}