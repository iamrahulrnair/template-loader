import execa from 'execa';
import chalk from 'chalk';

export async function initGit(options) {
  const result = execa('git', ['init']);
  if (options.init_git) {
    try {
      await execa('git', ['add', '.']);
      await execa('git', ['commit', '-m', '"first-commit"']);
      await execa('git', ['branch', '-M', 'main']);
    } catch (err) {
      console.error(
        `${chalk.bgRed(
          chalk.black('Error !!!')
        )},Check if the template directory exists ${chalk.green(
          'or'
        )} git is pre-initialized. `
      );
      process.exit(1);
    }
  }
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize Git'));
  }
}
