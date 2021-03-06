const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');

module.exports = (gulp, config) => {
  const task = () => {
    return src(config.src)
      .pipe(plugins.mjml())
      .pipe(
        plugins.rename((path) => {
          path.basename = path.basename.replace('mjml', 'html');
          path.extname = '.twig';
        })
      )
      .pipe(dest(config.dest));
  };
  gulp.task(config.task, task);
};
