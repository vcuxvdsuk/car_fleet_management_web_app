import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";

const prisma = new PrismaClient();

export class VehicleService {
    async getAll() {
        return prisma.vehicle.findMany();
    }

    async maintenanceCount(): Promise<number> {
        return prisma.vehicle.count({ where: { status: "Maintenance" } });
    }

    async totalCount(): Promise<number> {
        return prisma.vehicle.count();
    }

    async getById(id: string) {
        return prisma.vehicle.findUnique({ where: { id } });
    }

    async create(data: { licensePlate: string; status?: string }) {
        if (data.licensePlate.length > 20)
            throw new Error("License plate cannot exceed 20 characters.");

        const existing = await prisma.vehicle.findUnique({
            where: { licensePlate: data.licensePlate },
        });
        if (existing) throw new Error("License plate already exists.");

        const count = await this.maintenanceCount();
        const total = await this.totalCount();

        if (
            data.status === "Maintenance" &&
            count + 1 > Math.floor(total * 0.05)
        ) {
            throw new Error("Too many vehicles in maintenance.");
        }

        return prisma.vehicle.create({
            data: {
                licensePlate: data.licensePlate,
                status: data.status || "Available",
            },
        });
    }

    async update(id: string, data: { licensePlate: string; status: string }) {
        if (data.licensePlate.length > 20)
            throw new Error("License plate cannot exceed 20 characters.");

        const vehicle = await this.getById(id);
        if (!vehicle) throw new Error("Not found");

        if (vehicle.licensePlate !== data.licensePlate) {
            const existing = await prisma.vehicle.findUnique({
                where: { licensePlate: data.licensePlate },
            });
            if (existing) throw new Error("License plate already exists.");
        }

        if (vehicle.status === "Maintenance" && data.status !== "Available") {
            throw new Error("Maintenance vehicles can only move to Available.");
        }

        if (data.status === "Maintenance") {
            const count = await this.maintenanceCount();
            const total = await this.totalCount();
            if (count + 1 > Math.floor(total * 0.05))
                throw new Error("Too many vehicles in maintenance.");
        }

        return prisma.vehicle.update({
            where: { id },
            data: { licensePlate: data.licensePlate, status: data.status },
        });
    }

    async delete(id: string): Promise<void> {
        const vehicle = await this.getById(id);
        if (!vehicle) throw new Error("Not found");
        if (vehicle.status === "InUse" || vehicle.status === "Maintenance")
            throw new Error("Cannot delete vehicle in use or maintenance.");
        await prisma.vehicle.delete({ where: { id } });
    }
}

export const service = new VehicleService();
export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/vehicles", async (req: Request, res: Response) => {
    const vehicles = await service.getAll();
    res.json(vehicles);
});

app.post("/vehicles", async (req: Request, res: Response) => {
    try {
        const vehicle = await service.create(req.body);
        res.json(vehicle);
    } catch (err: any) {
        console.error("Prisma create error:", err);
        res.status(400).json({ error: err.message });
    }
});

app.put("/vehicles/:id", async (req: Request, res: Response) => {
    try {
        const updated = await service.update(req.params.id, req.body);
        res.json(updated);
    } catch (err: any) {
        if (err.message === "Not found")
            return res.status(404).json({ error: err.message });
        res.status(400).json({ error: err.message });
    }
});

app.delete("/vehicles/:id", async (req: Request, res: Response) => {
    try {
        await service.delete(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        if (err.message === "Not found")
            return res.status(404).json({ error: err.message });
        res.status(400).json({ error: err.message });
    }
});

// Seed helper (exported for manual or test usage)
export async function seedVehicles() {
    const total = await prisma.vehicle.count();
    if (total > 0) {
        console.log(
            `Vehicles already exist in DB (${total} entries), skipping seed.`
        );
        return;
    }

    const vehicles = JSON.parse(
        fs.readFileSync("prisma/vehicles.json", "utf-8")
    );

    for (const vehicle of vehicles) {
        try {
            const exists = await prisma.vehicle.findUnique({
                where: { licensePlate: vehicle.licensePlate },
            });
            if (!exists) {
                await prisma.vehicle.create({ data: vehicle });
                console.log(`Inserted: ${vehicle.licensePlate}`);
            } else {
                console.log(`Already exists: ${vehicle.licensePlate}`);
            }
        } catch (err: any) {
            console.error(
                `Failed to insert ${vehicle.licensePlate}: ${err.message}`
            );
        }
    }
}
