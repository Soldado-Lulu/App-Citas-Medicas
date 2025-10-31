// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      ['module-resolver', {
        root: ['./'],
        alias: { '@': './', '@/src': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
