module.exports = (gulp, config, mainConfig) => {
    const bundler = config.hasOwnProperty('bundler') ? config.bundler : 'rollup';
    return require(`./scripts-${bundler}`)(gulp, config, mainConfig);
}
