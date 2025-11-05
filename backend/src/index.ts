import { app, seedVehicles } from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
    console.log(`server running on http://localhost:${PORT}`);
    await seedVehicles();
});
