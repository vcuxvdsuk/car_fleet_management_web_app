import { PrismaClient } from "@prisma/client";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app";

const prisma = new PrismaClient();
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongoServer.getUri();
});

afterAll(async () => {
    await prisma.$disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clean DB before each test
    await prisma.vehicle.deleteMany({});
});

describe("Vehicle API", () => {
    it("should create a new vehicle", async () => {
        const res = await request(app).post("/vehicles").send({
            licensePlate: "TEST-123",
            status: "Available",
        });

        expect(res.status).toBe(200);
        expect(res.body.licensePlate).toBe("TEST-123");
    });

    it("should prevent duplicate license plates", async () => {
        await request(app).post("/vehicles").send({
            licensePlate: "DUP-001",
            status: "Available",
        });

        const res = await request(app).post("/vehicles").send({
            licensePlate: "DUP-001",
            status: "InUse",
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already exists/i);
    });

    it("should enforce maintenance cap", async () => {
        // Suppose total 10 vehicles, 5% = 0 (rounded down), so no maintenance allowed initially
        const res = await request(app).post("/vehicles").send({
            licensePlate: "MAINT-001",
            status: "Maintenance",
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/too many vehicles in maintenance/i);
    });

    it("should update a vehicle", async () => {
        const vehicle = await request(app).post("/vehicles").send({
            licensePlate: "UPD-001",
            status: "Available",
        });

        const res = await request(app)
            .put(`/vehicles/${vehicle.body.id}`)
            .send({ licensePlate: "UPD-002", status: "Available" });

        expect(res.status).toBe(200);
        expect(res.body.licensePlate).toBe("UPD-002");
    });

    it("should prevent updating to duplicate license plate", async () => {
        const v1 = await request(app).post("/vehicles").send({
            licensePlate: "V1",
            status: "Available",
        });
        const v2 = await request(app).post("/vehicles").send({
            licensePlate: "V2",
            status: "Available",
        });

        const res = await request(app)
            .put(`/vehicles/${v2.body.id}`)
            .send({ licensePlate: "V1", status: "Available" });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already exists/i);
    });

    it("should delete a vehicle", async () => {
        const vehicle = await request(app).post("/vehicles").send({
            licensePlate: "DEL-001",
            status: "Available",
        });

        const res = await request(app).delete(`/vehicles/${vehicle.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should not delete vehicles in use or maintenance", async () => {
        const v1 = await request(app).post("/vehicles").send({
            licensePlate: "INUSE-001",
            status: "InUse",
        });
        const v2 = await request(app).post("/vehicles").send({
            licensePlate: "MAINT-002",
            status: "Maintenance",
        });

        const res1 = await request(app).delete(`/vehicles/${v1.body.id}`);
        const res2 = await request(app).delete(`/vehicles/${v2.body.id}`);

        expect(res1.status).toBe(400);
        expect(res2.status).toBe(400);
        expect(res1.body.error).toMatch(/cannot delete/i);
        expect(res2.body.error).toMatch(/cannot delete/i);
    });

    it("should fetch all vehicles", async () => {
        await request(app).post("/vehicles").send({ licensePlate: "F1" });
        await request(app).post("/vehicles").send({ licensePlate: "F2" });

        const res = await request(app).get("/vehicles");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    });
});
