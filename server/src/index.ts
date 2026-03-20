import "dotenv/config";
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes";
import clientRoutes from "./routes/client.routes";
import { globalErrorHandler } from "./middleware/error.middleware";

const app = express();
const port = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

app.use("/api/v1/client", clientRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;