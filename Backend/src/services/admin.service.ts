import prisma from "../connect";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/apperror";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export const getRegistrationRequestsService = async () => {
  const data = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    message: "Registration requests fetched successfully",
    data,
  };
};

export const createRegistrationRequestService = async (data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
}) => {
  const newRequest = await prisma.registrationRequest.create({
    data,
  });

  return {
    message: "Registration request submitted successfully",
    data: newRequest,
  };
};

export const getRegistrationRequestByIdService = async (
  request_id: string
) => {
  const data = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!data) throw new AppError("Request not found", 404);

  return {
    message: "Registration request fetched",
    data,
  };
};

export const approveRegistrationRequestService = async (
  request_id: string
) => {
  const request = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!request) {
    throw new AppError("Registration request not found", 404);
  }

  if (request.status !== "PENDING") {
    throw new AppError("Request has already been reviewed", 400);
  }

  const clientId = "CL-" + uuidv4().slice(0, 8);
  const rawPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Create the user and link the registration request in a transaction
  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newUser = await tx.user.create({
      data: {
        clientId,
        password: hashedPassword,
        role: "CLIENT",
      },
    });

    await tx.registrationRequest.update({
      where: { id: request_id },
      data: {
        status: "APPROVED",
        userId: newUser.id,
        reviewedAt: new Date(),
      },
    });

    // Create the client profile
    await tx.client.create({
      data: {
        userId: newUser.id,
        companyName: request.companyName,
        email: request.email,
        phone: request.phone ?? undefined,
        address: request.address ?? undefined,
      },
    });

    return newUser;
  });

  return {
    message: "Client approved successfully",
    credentials: {
      client_id: clientId,
      password: rawPassword,
    },
  };
};

export const rejectRegistrationRequestService = async (
  request_id: string
) => {
  const request = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!request) throw new AppError("Request not found", 404);

  if (request.status !== "PENDING") {
    throw new AppError("Request has already been reviewed", 400);
  }

  await prisma.registrationRequest.update({
    where: { id: request_id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
    },
  });

  return {
    message: "Registration request rejected",
  };
};