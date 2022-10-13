module.exports = {
  apps: [
    {
      name: "one-each",
      script: "./src/server.js",
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: "development",
        NODE_PATH: "./",
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: "production",
        NODE_PATH: "./",
      },
    },
  ],
};
