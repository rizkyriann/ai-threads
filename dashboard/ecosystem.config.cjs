module.exports = {
  apps: [
    {
      name: "threads-studio",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "500M",
      time: true,
    },
  ],
};
