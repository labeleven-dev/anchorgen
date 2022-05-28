import {expect} from 'chai';
import {readFile} from 'fs/promises';
import {generate} from '../src';

const dropFirstLine = (text: string) => {
  const lines = text.split('\n');
  lines.splice(0, 1);
  return lines.join('\n');
};

describe('index', () => {
  describe('generate', () => {
    it('generates expected Rust code', async () => {
      const input = (await readFile(`${__dirname}/files/idl.json`)).toString();
      const expected = (await readFile(`${__dirname}/files/lib.rs`)).toString();

      const output = await generate(input, {
        programId: 'xxxxxx',
        templatePath: `${__dirname}/../templates/lib.rs.handlebars`,
      });

      expect(dropFirstLine(output)).to.be.eq(dropFirstLine(expected));
    });
  });
});
