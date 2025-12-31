module.exports = {
    apps: [
        {
            name: "POSTMAN API",
            script: "index.js",
            env: {
                NODE_APP: "production",
                PORT: 3000
            }
        }
    ]
};
