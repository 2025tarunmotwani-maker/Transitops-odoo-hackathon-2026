const http = require("node:http");
const dotenv = require("dotenv");

const { createServerApplication } = require("./server");
const connectDB = require("./db/connection");

dotenv.config();

async function main() {
    try {
        await connectDB();

        const app = createServerApplication();

        const server = http.createServer(app);

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();