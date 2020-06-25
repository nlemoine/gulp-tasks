const { src, dest } = require('gulp');
const plugins = require('../utils/plugins');
const del = require('del');
const through = require('through2');

/**
 * __
 * _e
 * _x
 * _xn
 * _ex
 * _n_noop
 * _nx_noop
 * translate  -> Match __,  _e, _x and so on
 * \(         -> Match (
 * \s*?       -> Match empty space 0 or infinite times, as few times as possible (ungreedy)
 * ['"]     -> Match ' or "
 * .+?        -> Match any character, 1 to infinite times, as few times as possible (ungreedy)
 * ,          -> Match ,
 * .+?        -> Match any character, 1 to infinite times, as few times as possible (ungreedy)
 * \)         -> Match )
 */
const gettextRegex = {
  // _e( "text", "domain" )
  // __( "text", "domain" )
  // translate( "text", "domain" )
  // esc_attr__( "text", "domain" )
  // esc_attr_e( "text", "domain" )
  // esc_html__( "text", "domain" )
  // esc_html_e( "text", "domain" )
  simple: /(__|_e|translate|esc_attr__|esc_attr_e|esc_html__|esc_html_e)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _n( "single", "plural", number, "domain" )
  plural: /_n\(\s*?['"].*?['"]\s*?,\s*?['"].*?['"]\s*?,\s*?.+?\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _x( "text", "context", "domain" )
  // _ex( "text", "context", "domain" )
  // esc_attr_x( "text", "context", "domain" )
  // esc_html_x( "text", "context", "domain" )
  // _nx( "single", "plural", "number", "context", "domain" )
  disambiguation: /(_x|_ex|_nx|esc_attr_x|esc_html_x)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _n_noop( "singular", "plural", "domain" )
  // _nx_noop( "singular", "plural", "context", "domain" )
  noop: /(_n_noop|_nx_noop)\((\s*?['"].+?['"]\s*?),(\s*?['"]\w+?['"]\s*?,){0,1}\s*?['"].+?['"]\s*?\)/g,
};

module.exports = (gulp, config) => {
  const filterTwig = plugins.filter(['**/*.html.twig'], { restore: true });

  const task = () => {
    return (
      src(config.src)
        .pipe(filterTwig)
        // Search for Gettext function calls and wrap them around PHP tags.
        .pipe(
          plugins.replace(gettextRegex.simple, (match) => `<?php ${match}; ?>`)
        )
        .pipe(
          plugins.replace(gettextRegex.plural, (match) => `<?php ${match}; ?>`)
        )
        .pipe(
          plugins.replace(
            gettextRegex.disambiguation,
            (match) => `<?php ${match}; ?>`
          )
        )
        .pipe(
          plugins.replace(gettextRegex.noop, (match) => `<?php ${match}; ?>`)
        )
        // Rename file with .php extension
        .pipe(
          plugins.rename({
            extname: '.php',
          })
        )
        .pipe(dest(config.cachePath))
        .pipe(filterTwig.restore)
        .pipe(plugins.wpPot(config.options))
        .pipe(gulp.dest(`${config.dest}/${config.options.domain}.pot`))
        .pipe(
          through.obj((chunk, enc, cb) => {
            del(config.cachePath);
            cb();
          })
        )
    );
  };

  gulp.task(config.task, task);
};
