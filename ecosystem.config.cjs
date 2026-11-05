// PM2 config. Uses .cjs because package.json is "type": "module" and PM2 loads this file with require().
// Usage on the server (from /opt/postman-api): pm2 startOrReload ecosystem.config.cjs --update-env
module.exports = {
    apps: [
        {
            name: "postman-api",
            cwd: __dirname,
            script: "dist/index.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            max_restarts: 10,
            min_uptime: "10s",
            time: true,
            env: {
                NODE_APP: "production",
                TZ: "UTC"
            }
        }
    ]
};
