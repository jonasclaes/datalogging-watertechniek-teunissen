import { EHealth } from "./EHealth";
import { Health } from "./Health";
import { Socket } from "net";

export const internetHealth = new Health();
export const databaseHealth = new Health();

internetHealth.setHealth(EHealth.DOWN);
databaseHealth.setHealth(EHealth.DOWN);

setInterval(() => {
    // Check internet connection with a 1.1.1.1 DNS server.
    checkConnection(internetHealth, 53, "1.1.1.1");

    // Check database connection with a DB_HOST and DB_PORT database server.
    checkConnection(databaseHealth, parseInt(process.env.DB_PORT || "5432"), process.env.DB_HOST || "127.0.0.1");
}, 500);

function checkConnection(healthObject: Health, port: number, address: string) {
    // Create a new socket.
    const socket = new Socket();

    // Register a connect event.
    socket.on("connect", () => {
        healthObject.setHealth(EHealth.ONLINE);
        socket.destroy();
    });

    // Register an error event.
    socket.on("error", () => {
        healthObject.setHealth(EHealth.DOWN);
        socket.destroy();
    });

    // Connect to port and address.
    socket.connect(port, address);
}

export { EHealth as HealthEnum } from "./EHealth";
