import execa from 'execa';

export async function deleteTemplateFiles(options) {
  if (options.delete && options.deleteConfirm) {
    const _currentDirName = process.cwd().split('/').pop();
    const _parentDir = process
      .cwd()
      .split('/')
      .map((el) => {
        if (el !== _currentDirName) {
          return el;
        }
      })
      .join('/');
    try {
      await execa('rm', ['-rf', `${_currentDirName}/`], {
        cwd: _parentDir,
      });
    } catch (err) {
      console.log(err);
    }
    process.exit(1);
  } else if (options.delete && !options.deleteConfirm) {
    process.exit(1);
  } else {
    return { ...options };
  }
}
