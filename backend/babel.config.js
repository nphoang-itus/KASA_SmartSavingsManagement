// babel.config.js
export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Hướng đến phiên bản Node.js bạn đang chạy
        },
      },
    ],
  ],
};