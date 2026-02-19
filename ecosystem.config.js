module.exports = {
    apps: [
        {
            name: "fleet-management-web",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "teltonika-server",
            interpreter: "node_modules/.bin/tsx",
            script: "./scripts/teltonika-server.ts",
        }
    ],
};
