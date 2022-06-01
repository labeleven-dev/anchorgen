#!/usr/bin/env node
import path from 'node:path';
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
import {readFile} from 'node:fs/promises';
import Handlebars from 'handlebars';
import map from './mappers';

const DEFAULT_TEMPLATE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'templates',
  'lib.rs.handlebars'
);

/**
 * @returns the content of the stream as a string
 */
async function readStream(stream: NodeJS.ReadStream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

/**
 * @param input Anchor IDL
 * @param param1.programId the Anchor program ID
 * @param param1.templatePath path to a Handlebars template to overwrite the built-in one
 * @returns generates Rust code from the provided IDL
 */
export async function generate(
  input: string,
  {programId, templatePath}: {programId: string; templatePath?: string}
): Promise<string> {
  const templateFile = await readFile(
    templatePath || DEFAULT_TEMPLATE_PATH,
    'utf8'
  );

  // compile and execute template
  Handlebars.registerHelper('eq', (a: string, b: string): boolean => a === b);
  const template = Handlebars.compile(templateFile, {noEscape: true});

  const context = map(programId, JSON.parse(input));
  return template(context);
}

/// starts here ///

(async () => {
  // setup cli
  const argv = await yargs(hideBin(process.argv))
    .usage(
      '$0 <Program ID>',
      'Reads an Anchor IDL from stdin and prints the equivalent Rust interface to stdout'
    )
    .demandCommand(1)
    .positional('Program ID', {
      describe: 'ID of the generated Anchor program',
      type: 'string',
    })
    .string(['t'])
    .alias('t', 'template')
    .describe('t', 'Path to Handlebars template file to override with')
    .parseAsync();

  // generate code
  const output = await generate(await readStream(process.stdin), {
    programId: argv._[0] as string,
    templatePath: argv.template,
  });

  process.stdout.write(output);
})();
