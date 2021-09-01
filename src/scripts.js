module.exports = (gulp, config, mainConfig) => {
    const bundler = config.hasOwnProperty('bundler') ? config.bundler : 'rollup';
    const scriptTask = require(`./scripts-${bundler}`)(gulp, config, mainConfig);

    gulp.task(config.task, scriptTask);
}
