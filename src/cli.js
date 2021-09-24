import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function passArgumentsIntoOption(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runinstall: args['--install'] || false,
  };
}

async function promptForMissingOption(options) {
  const defaultTemplate = 'Javascript';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }
  const questions = [];

  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose a project template to use',
      choices: ['Javascript', 'TypeScript'],
      default: defaultTemplate,
    });
  }
  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'initialize a git repository?',
      default: false,
    });
  }

  const answers = inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
  };
}

export async function cli(args) {
  let options = passArgumentsIntoOption(args);
  options = await promptForMissingOption(options);
  await createProject(options);
  // console.log(options);
}
