import prisma from "../connect";
import { AppError } from "../utils/apperror";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const loginUserService = async ({
  client_id,
  password,
}: {
  client_id: string;
  password: string;
}) => {
  if (!client_id || !password) {
    throw new AppError("Client ID and password required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { clientId: client_id },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      client_id: user.clientId,
      role: user.role,
    },
  };
};

export const logoutUserService = async () => {
  return {
    message: "Logout successful",
  };
};

export const getCurrentUserService = async (req: any) => {
  const user = req.user;

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  return {
    message: "User fetched",
    user,
  };
};