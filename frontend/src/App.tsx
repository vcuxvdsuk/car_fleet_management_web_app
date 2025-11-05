import React, { useEffect, useState } from "react";
import axios from "./api";
import { Vehicle, VehicleStatus } from "./Vehicle";

const statusOptions: VehicleStatus[] = ["Available", "InUse", "Maintenance"];

const statusColors: Record<VehicleStatus, string> = {
    Available: "bg-green-500",
    InUse: "bg-yellow-400",
    Maintenance: "bg-red-500",
};

function App() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [form, setForm] = useState<Partial<Vehicle>>({ status: "Available" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = async () => {
        const res = await axios.get("/vehicles");
        setVehicles(res.data);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await axios.put(`/vehicles/${editingId}`, form);
            } else {
                await axios.post("/vehicles", form);
            }
            setForm({ status: "Available" });
            setEditingId(null);
            fetchVehicles();
        } catch (err: any) {
            console.error("error:", err);
            setError(err.response?.data?.error || "Error");
        }
    };

    const handleEdit = (v: Vehicle) => {
        setForm(v);
        setEditingId(v.id);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this vehicle?")) return;
        try {
            await axios.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (err: any) {
            setError(err.response?.data?.error || "Error");
        }
    };

    const handleStatusChange = async (v: Vehicle, newStatus: VehicleStatus) => {
        if (v.status === newStatus) return;
        try {
            await axios.put(`/vehicles/${v.id}`, { ...v, status: newStatus });
            fetchVehicles();
        } catch (err: any) {
            console.error("status update error:", err);
            setError(err.response?.data?.error || "Error updating status");
        }
    };

    // ✅ Helper to format ISO date into readable format
    const formatDate = (isoDate?: string) => {
        if (!isoDate) return "-";
        const date = new Date(isoDate);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Vehicle List</h1>
            {error && <div className="text-red-500 mb-2">{error}</div>}

            <table className="w-full border mb-4 border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">License Plate</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Created At</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((v) => (
                        <tr key={v.id} className="text-center border">
                            <td className="border p-2">{v.id}</td>
                            <td className="border p-2">{v.licensePlate}</td>

                            <td className="border p-2">
                                <div className="flex justify-center gap-2">
                                    {statusOptions.map((s) => {
                                        const isActive = v.status === s;
                                        return (
                                            <button
                                                key={s}
                                                className={`px-3 py-1 rounded-full text-white transition-transform duration-200 ${
                                                    isActive
                                                        ? `${statusColors[s]} scale-110 shadow-md`
                                                        : `${statusColors[s]} opacity-50 hover:opacity-100 hover:shadow-[0_0_8px]`
                                                }`}
                                                onClick={() =>
                                                    handleStatusChange(v, s)
                                                }
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </td>

                            <td className="border p-2">
                                {formatDate(v.createdAt)}
                            </td>

                            <td className="border p-2">
                                <button
                                    className="mr-2 text-blue-600"
                                    onClick={() => handleEdit(v)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600"
                                    onClick={() => handleDelete(v.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <form onSubmit={handleSubmit} className="border p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">
                    {editingId ? "Edit Vehicle" : "Add Vehicle"}
                </h2>

                <div className="mb-2">
                    <label>License Plate: </label>
                    <input
                        className="border px-2"
                        value={form.licensePlate || ""}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                licensePlate: e.target.value,
                            }))
                        }
                        required
                    />
                </div>

                <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    type="submit"
                >
                    {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                    <button
                        className="ml-2"
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setForm({ status: "Available" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>
        </div>
    );
}

export default App;
