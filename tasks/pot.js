import gulp from 'gulp';
import { deleteAsync } from 'del';
import through from 'through2';
import wpPot from 'gulp-wp-pot';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import replace from 'gulp-replace';

const { src, dest } = gulp;

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
  simple:
    /(__|_e|translate|esc_attr__|esc_attr_e|esc_html__|esc_html_e)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/gs,

  // _n( "single", "plural", number, "domain" )
  plural:
    /_n\(\s*?['"].*?['"]\s*?,\s*?['"].*?['"]\s*?,\s*?.+?\s*?,\s*?['"].+?['"]\s*?\)/gs,

  // _x( "text", "context", "domain" )
  // _ex( "text", "context", "domain" )
  // esc_attr_x( "text", "context", "domain" )
  // esc_html_x( "text", "context", "domain" )
  // _nx( "single", "plural", "number", "context", "domain" )
  disambiguation:
    /(_x|_ex|_nx|esc_attr_x|esc_html_x)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/gs,

  // _n_noop( "singular", "plural", "domain" )
  // _nx_noop( "singular", "plural", "context", "domain" )
  noop: /(_n_noop|_nx_noop)\((\s*?['"].+?['"]\s*?),(\s*?['"]\w+?['"]\s*?,){0,1}\s*?['"].+?['"]\s*?\)/gs,
};

export default (config, mainConfig) => {
  const filterTwig = filter(['**/*.html.twig'], { restore: true });
  return (
    src(config.src)
      .pipe(filterTwig)
      // Search for Gettext function calls and wrap them around PHP tags.
      .pipe(replace(gettextRegex.simple, (match) => `<?php ${match}; ?>`))
      .pipe(replace(gettextRegex.plural, (match) => `<?php ${match}; ?>`))
      .pipe(
        replace(gettextRegex.disambiguation, (match) => `<?php ${match}; ?>`)
      )
      .pipe(replace(gettextRegex.noop, (match) => `<?php ${match}; ?>`))
      // Rename file with .php extension
      .pipe(
        rename({
          extname: '.php',
        })
      )
      .pipe(dest(config.cachePath))
      .pipe(filterTwig.restore)
      .pipe(wpPot(config.options))
      .pipe(
        replace(config.cachePath, (match) => {
          return mainConfig.basePath;
        })
      )
      .pipe(replace('.html.php', '.html.twig'))
      .pipe(dest(`${config.dest}/${config.options.domain}.pot`))
      .pipe(
        through.obj((chunk, enc, cb) => {
          deleteAsync(config.cachePath);
          cb();
        })
      )
  );
};
