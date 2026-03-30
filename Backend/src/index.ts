import "dotenv/config";
import express, { Request,Response } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import publicRoutes from "./routes/public.routes";
import userRoutes from "./routes/user.routes";
import templateRoutes from "./routes/template.routes";
import designSubmissionRoutes from "./routes/design-submission.routes";
import designRoutes from "./routes/design.routes";
import orderRoutes from "./routes/order.routes";
import clientWalletRoutes from "./routes/wallet/client-wallet.routes";
import adminWalletRoutes from "./routes/wallet/admin-wallet.routes";
import { globalErrorHandler } from "./middleware/error.middleware";

const app = express();
const port = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

app.use("/api/v1", publicRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/design-submissions", designSubmissionRoutes);
app.use("/api/v1", designRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/wallet", clientWalletRoutes);
app.use("/api/v1/admin/wallet", adminWalletRoutes);

//health check
app.get("/",(req:Request,res:Response)=>{
  res.json({message:"API is running"})
}
)

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;