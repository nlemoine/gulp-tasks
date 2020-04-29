const del = require('del');

module.exports = (gulp, config) => {
  const clean = async () => {
    return del(`${config.buildPath}/**`, {
      dot: true,
      force: true,
    });
  };
  gulp.task('clean', clean);
};
