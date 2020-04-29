const { src, dest } = require('gulp');

const plugins = require('../utils/plugins');

module.exports = (gulp, config) => {
  const task = () => {
    return src(config.src, {
      base: '. / ',
    })
      .pipe(
        plugins.prettier({
          editorconfig: true,
        })
      )
      .pipe(dest('./'));
  };

  gulp.task(config.task, task);
};
