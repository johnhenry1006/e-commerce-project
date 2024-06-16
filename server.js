const app = require("./src/app");

const PORT = process.env.APP_PORT || 5050;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
    server.close(() => {
        console.log("Server closed");
        process.exit(1);
    });
});
