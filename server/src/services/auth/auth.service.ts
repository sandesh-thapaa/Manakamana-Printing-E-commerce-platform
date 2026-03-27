import prisma from "../../connect";
import { AppError } from "../../utils/apperror";
import jwt from "jsonwebtoken";

// CLIENT AUTH LOGIC
// loginClientService: Handles client authentication using phone number and plain-text password, returning a JWT
export const loginClientService = async ({
  phone_number,
  password,
}: {
  phone_number: string;
  password: string;
}) => {
  if (!phone_number || !password) {
    throw new AppError("Phone number and password required", 400);
  }

  const client = await prisma.client.findUnique({
    where: { phone_number: phone_number },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  // PLAIN TEXT PASSWORD COMPARISON AS REQUESTED
  if (password !== client.password) {
    throw new AppError("Invalid credentials", 401);
  }

  if (client.status !== "active") {
    throw new AppError("Account is inactive", 403);
  }

  const token = jwt.sign(
    { id: client.id, role: "CLIENT", business_name: client.business_name },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    message: "Login successful",
    token,
    client: {
      id: client.id,
      client_code: client.client_code,
      phone: client.phone_number,
      business_name: client.business_name,
      role: "CLIENT",
    },
  };
};

// ADMIN AUTH LOGIC
// loginAdminService: Authenticates administrators via email and password, returning a role-based JWT
export const loginAdminService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  // PLAIN TEXT PASSWORD COMPARISON AS REQUESTED
  if (password !== admin.password) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role, name: admin.name },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return {
    message: "Admin login successful",
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

// logoutService: Standard logout response; actual token invalidation is handled client-side
export const logoutService = async () => {
  return {
    message: "Logout successful",
  };
};