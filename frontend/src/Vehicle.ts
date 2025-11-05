export type VehicleStatus = "Available" | "InUse" | "Maintenance";

export interface Vehicle {
    id: number;
    licensePlate: string;
    status: VehicleStatus;
    createdAt?: Date;
}
