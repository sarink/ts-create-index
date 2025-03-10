import path from 'path';
import {expect} from 'chai';
import readDirectory from '../src/utilities/readDirectory';

const fixturesPath = path.resolve(__dirname, 'fixtures/read-directory');

describe('readDirectory()', () => {
  context('target directory contains child directories', () => {
    it('gets names of the children directories', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-directories'));

      expect(names).to.deep.equal(['bar', 'foo']);
    });
  });
  context('target directory contains child directories that do not contain index', () => {
    it('gets names of the children directories', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-directories-without-index'));

      expect(names).to.deep.equal(['present.js']);
    });
  });
  context('target directory contains child directories (short safe name)', () => {
    it('gets names of the children directories', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-directories-short-name'));

      expect(names).to.deep.equal(['F', 'T', '__', 'o']);
    });
  });
  context('target directory contains child directories (unsafe name)', () => {
    it('gets names of the children directories', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-directories-unsafe-name'));

      expect(names).to.deep.equal(['present']);
    });
  });
  context('target directory contains ./index.ts', () => {
    it('does not include ./index.ts', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-index'));

      expect(names).to.deep.equal(['bar', 'foo']);
    });

    it('excludes directories if ignoreDirectories = true', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-index'), {
        ignoreDirectories: true,
      });

      expect(names).to.deep.equal([]);
    });
  });
  context('target directory contains files', () => {
    it('refers to the files (with extension)', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-files'));

      expect(names).to.deep.equal(['bar.js', 'foo.js']);
    });
  });
  context('target directory contains dot files', () => {
    it('ignores files', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-dot-files'));

      expect(names).to.deep.equal(['present.js']);
    });
  });
  context('target directory contains non js files, and not configured to allow that', () => {
    it('prefers file', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-files-alt-extension'));

      expect(names).to.deep.equal(['present.js']);
    });
  });
  context('target directory contains non js files, and allowing only jsx', () => {
    it('prefers file', () => {
      const options = {extensions: ['jsx']};
      const names = readDirectory(
        path.resolve(fixturesPath, 'children-files-alt-extension'),
        options,
      );

      expect(names).to.deep.equal(['bar.jsx']);
    });
  });
  context('target directory contains non js files, and allowing both js and jsx', () => {
    it('prefers file', () => {
      const options = {extensions: ['js', 'jsx']};
      const names = readDirectory(
        path.resolve(fixturesPath, 'children-files-alt-extension'),
        options,
      );

      expect(names).to.deep.equal(['bar.jsx', 'present.js']);
    });
  });
  context(
    'target directory contains homonyms files, and allowing both js and jsx, will prefer JS as it is first extension listed',
    () => {
      it('prefers file', () => {
        const options = {extensions: ['js', 'jsx']};
        const names = readDirectory(
          path.resolve(fixturesPath, 'children-files-alt-extension-with-homonyms'),
          options,
        );

        expect(names).to.deep.equal(['bar.js', 'present.js']);
      });
    },
  );
  context(
    'target directory contains homonyms files, and allowing both js and jsx, will prefer JSX as it is first extension listed',
    () => {
      it('prefers file', () => {
        const options = {extensions: ['jsx', 'js']};
        const names = readDirectory(
          path.resolve(fixturesPath, 'children-files-alt-extension-with-homonyms'),
          options,
        );

        expect(names).to.deep.equal(['bar.jsx', 'present.js']);
      });
    },
  );
  context('target directory contains files with no extension', () => {
    it('ignores files', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-files-no-extension'));

      expect(names).to.deep.equal(['present.js']);
    });
  });
  context('target directory contains files with multiple extensions', () => {
    it('ignores files', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-files-multiple-extensions'));

      expect(names).to.deep.equal(['present.js']);
    });
  });
  context('target directory contains directories and files with the same name', () => {
    it('prefers file', () => {
      const names = readDirectory(path.resolve(fixturesPath, 'children-directories-and-files'));

      expect(names).to.deep.equal(['foo.js', 'present.js']);
    });
  });
});
