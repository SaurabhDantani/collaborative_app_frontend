require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'collab-frontend',
      script: 'npx next start',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
