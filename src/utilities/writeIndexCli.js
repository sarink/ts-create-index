import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import createIndexCode from './createIndexCode';
import validateTargetDirectory from './validateTargetDirectory';
import readDirectory from './readDirectory';
import readIndexConfig from './readIndexConfig';
import sortByDepth from './sortByDepth';
import log from './log';
import findIndexFiles from './findIndexFiles';

export default (directoryPaths, options = {}) => {
  let sortedDirectoryPaths;

  sortedDirectoryPaths = sortByDepth(directoryPaths);

  log('Target directories', sortedDirectoryPaths);
  log('Output file', options.outputFile);
  if (options.updateIndex) {
    log('Update index:', options.updateIndex ? chalk.green('true') : chalk.red('false'));
  } else {
    log('Recursive:', options.recursive ? chalk.green('true') : chalk.red('false'));
    log('Ignore unsafe:', options.ignoreUnsafe ? chalk.green('true') : chalk.red('false'));
    log('Extensions:', chalk.green(options.extensions));
  }

  if (options.updateIndex || options.recursive) {
    sortedDirectoryPaths = _.map(sortedDirectoryPaths, (directory) => {
      return findIndexFiles(directory, {
        fileName: options.updateIndex ? options.outputFile || 'index.ts' : '*',
        silent: options.updateIndex || options.ignoreUnsafe,
      });
    });
    sortedDirectoryPaths = _.flatten(sortedDirectoryPaths);
    sortedDirectoryPaths = _.uniq(sortedDirectoryPaths);
    sortedDirectoryPaths = sortByDepth(sortedDirectoryPaths);

    log('Updating index files in:', sortedDirectoryPaths.reverse().join(', '));
  }

  sortedDirectoryPaths = sortedDirectoryPaths.filter((directoryPath) => {
    return validateTargetDirectory(directoryPath, {
      outputFile: options.outputFile,
      silent: options.ignoreUnsafe,
    });
  });

  _.forEach(sortedDirectoryPaths, (directoryPath) => {
    let existingIndexCode;

    const config = readIndexConfig(directoryPath, options);

    const siblings = readDirectory(directoryPath, {
      config,
      extensions: options.extensions,
      ignoreDirectories: options.ignoreDirectories,
      silent: options.ignoreUnsafe,
    });

    const indexCode = createIndexCode(siblings, {
      banner: options.banner,
      config,
    });

    const indexFilePath = path.resolve(directoryPath, options.outputFile || 'index.ts');

    try {
      existingIndexCode = fs.readFileSync(indexFilePath, 'utf8');

      /* eslint-disable no-empty */
    } catch {}

    /* eslint-enable no-empty */

    fs.writeFileSync(indexFilePath, indexCode);

    if (existingIndexCode && existingIndexCode === indexCode) {
      log(indexFilePath, chalk.yellow('[index has not changed]'));
    } else if (existingIndexCode && existingIndexCode !== indexCode) {
      log(indexFilePath, chalk.green('[updated index]'));
    } else {
      log(indexFilePath, chalk.green('[created index]'));
    }
  });

  log('Done');
};
