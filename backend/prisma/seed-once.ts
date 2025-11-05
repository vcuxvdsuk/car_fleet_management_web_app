import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Running seed-once.js...");
    const count = await prisma.vehicle.count();
    if (count === 0) {
        console.log("Seeding initial data");
        await prisma.vehicle.createMany({
            data: [
                { licensePlate: "ABC123", status: "Available" },
                { licensePlate: "XYZ789", status: "InUse" },
                { licensePlate: "LMN456", status: "Maintenance" },
            ],
        });
        console.log("Seed completed.");
    } else {
        console.log("Seed skipped (already populated).");
    }
}

main()
    .catch((e) => {
        console.error("Seed Failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
