import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
    const vehicles = JSON.parse(
        fs.readFileSync("./prisma/vehicles.json", "utf-8")
    );
    console.log(`Seeding ${vehicles.length} vehicles...`);

    for (const v of vehicles) {
        await prisma.vehicle.create({ data: v });
    }

    console.log("✅ Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
