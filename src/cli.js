import arg from 'arg';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createProject } from './main';
import { deleteTemplateFiles } from './deleteTemplate';

function passArgumentsIntoOption(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '--delete': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
      '-d': '--delete',
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
    delete: args['--delete'] || false,
  };
}

async function promptForMissingOption(options) {
  const defaultTemplate = 'Javascript';
  // ################################

  if (options.delete) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'deleteConfirm',
        message: `${chalk.redBright(
          'Warning!!!'
        )}, this action may delete the current working directory,do you wish to continue?`,
        default: true,
      },
    ]);
    return { ...options, deleteConfirm: answer.deleteConfirm || false };
  }
  // ################################
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }
  // ################################

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

  let answers = await inquirer.prompt(questions);
  let new_answers;
  if (answers.git) {
    new_answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'init_git',
        message: 'initialize git with basic setup ?',
        default: false,
      },
    ]);
  }
  // ################################

  answers = Object.assign(answers, new_answers);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
    init_git: answers.init_git || false,
  };
}

export async function cli(args) {
  try {
    let options = passArgumentsIntoOption(args);
    options = await promptForMissingOption(options);
    options = await deleteTemplateFiles(options);
    await createProject(options);
  } catch (err) {
    if (err[1].code === 'EACCES') {
      console.error(
        `${chalk.red(
          err[1].message.split(',')[0]
        )} , make sure the directory exists${chalk.red(
          '/'
        )}you have execute permission`
      );
    }
  }
  // console.log(options);
}
