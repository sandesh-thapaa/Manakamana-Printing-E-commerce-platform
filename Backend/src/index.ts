import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import publicRoutes from "./routes/public.routes";
import { globalErrorHandler } from "./middleware/error.middleware";

const app = express();
const port = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

app.use("/api/v1", publicRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;