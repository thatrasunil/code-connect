const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": false, // crypto-browserify can be added if needed 
        "stream": false, // stream-browserify can be added if needed 
        "assert": false,
        "http": false,
        "https": false,
        "os": false,
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser.js"),
        "path": require.resolve("path-browserify")
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.NormalModuleReplacementPlugin(
            /vfile\/lib\/minpath\.js$/,
            require.resolve('./vfile-shims/minpath.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
            /vfile\/lib\/minproc\.js$/,
            require.resolve('./vfile-shims/minproc.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
            /vfile\/lib\/minurl\.js$/,
            require.resolve('./vfile-shims/minurl.js')
        )
    ]);
    return config;
};
