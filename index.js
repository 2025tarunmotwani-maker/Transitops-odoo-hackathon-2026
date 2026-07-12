const http = require("node:http");
const dotenv = require("dotenv");
const { createServerApplication } = require('./Backend/server.js')

dotenv.config();


async function main() {
    try {
        const server = http.createServer(createServerApplication())
        const PORT = process.env.PORT

        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main()