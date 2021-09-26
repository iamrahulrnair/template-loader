import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';
import { initGit } from './gitInit';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  try {
    return copy(options.templateDirectory, options.targetDirectory, {
      clobber: false,
    });
  } catch (err) {
    console.log(err);
  }
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };
  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates',
    options.template.toLowerCase()
  );

  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (error) {
    console.error(
      `${chalk.red.bold('ERROR!!')},template name ${chalk.redBright(
        options.template.toUpperCase()
      )} is invalid,Please check with documents for further details.`
    );
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
    {
      title: 'Initialize Git',
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: 'install dependencies',
      task: () =>
        projectInstall({
          cwd: options.targetDirectory,
        }),
      skip: () =>
        !options.runinstall
          ? 'Pass --install to automatically install dependencies'
          : undefined,
    },
  ]);

  await tasks.run();
  console.log(`${chalk.green.bold('DONE')},Project Ready!!`);

  return true;
}
