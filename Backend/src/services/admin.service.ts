import prisma from "../connect";
import { AppError } from "../utils/apperror";
import { v4 as uuidv4 } from "uuid";

export const getRegistrationRequestsService = async (filters: { status?: string; search?: string } = {}) => {
  const { status, search } = filters;
  
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { business_name: { contains: search, mode: "insensitive" } },
      { phone_number: { contains: search } },
    ];
  }

  const data = await prisma.registrationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      approved_by: { select: { name: true } },
      rejected_by: { select: { name: true } },
      credentials_sent_by: { select: { name: true } }
    }
  });

  return {
    message: "Registration requests fetched successfully",
    data,
  };
};

export const createRegistrationRequestService = async (data: {
  business_name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  business_address?: string;
  notes?: string;
}) => {
  // Check for existing pending request with same number
  const existingRequest = await prisma.registrationRequest.findFirst({
    where: { phone_number: data.phone_number, status: "PENDING" }
  });

  if (existingRequest) {
    throw new AppError("A pending registration request already exists for this number", 400);
  }

  // Check if already a registered client
  const existingClient = await prisma.client.findUnique({
    where: { phone_number: data.phone_number }
  });

  if (existingClient) {
    throw new AppError("This phone number is already registered as a client", 400);
  }

  const newRequest = await prisma.registrationRequest.create({
    data: {
      ...data,
      status: "PENDING"
    },
  });

  return {
    message: "Registration request submitted successfully",
    data: {
      id:newRequest.id,
      status:newRequest.status,
    },
  };
};

export const getRegistrationRequestByIdService = async (request_id: string) => {
  const data = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
    include: {
      approved_by: { select: { id: true, name: true } },
      rejected_by: { select: { id: true, name: true } },
      credentials_sent_by: { select: { id: true, name: true } }
    }
  });

  if (!data) throw new AppError("Request not found", 404);

  return {
    message: "Registration request fetched",
    data,
  };
};

export const approveRegistrationRequestService = async (request_id: string, admin_id: string) => {
  const request = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!request) throw new AppError("Registration request not found", 404);
  if (request.status !== "PENDING") throw new AppError("Request is not in pending status", 400);

  const phone_number = request.phone_number;

  // Final check for existing client
  const existingClient = await prisma.client.findUnique({ where: { phone_number } });
  if (existingClient) throw new AppError("Client already exists for this phone number", 400);

  const clientCode = "MP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const rawPassword = Math.random().toString(36).substring(7); // SIMPLE STRING PASSWORD

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create client with PLAIN TEXT password
    const newClient = await tx.client.create({
      data: {
        client_code: clientCode,
        phone_number: phone_number,
        password: rawPassword, // PLAIN TEXT AS REQUESTED
        business_name: request.business_name,
        owner_name: request.owner_name,
        email: request.email,
        address: request.business_address,
        status: "active"
      }
    });

    // 2. Update request
    const updatedRequest = await tx.registrationRequest.update({
      where: { id: request_id },
      data: {
        status: "APPROVED",
        approved_by_id: admin_id,
        approved_at: new Date()
      }
    });

    return { newClient, updatedRequest };
  });

  return {
    message: "Client approved and created successfully",
    credentials: {
      phone_number: phone_number,
      password: rawPassword, // REVEAL ONCE TO ADMIN
    },
    client: result.newClient
  };
};

export const rejectRegistrationRequestService = async (request_id: string, admin_id: string, reason: string) => {
  const request = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!request) throw new AppError("Request not found", 404);
  if (request.status !== "PENDING") throw new AppError("Request is not in pending status", 400);

  await prisma.registrationRequest.update({
    where: { id: request_id },
    data: {
      status: "REJECTED",
      rejection_reason: reason,
      rejected_by_id: admin_id,
      rejected_at: new Date(),
    },
  });

  return { message: "Registration request rejected" };
};

export const markCredentialsSentService = async (request_id: string, admin_id: string) => {
  const request = await prisma.registrationRequest.findUnique({
    where: { id: request_id },
  });

  if (!request) throw new AppError("Request not found", 404);
  if (request.status !== "APPROVED") throw new AppError("Only approved requests can have credentials sent", 400);

  await prisma.registrationRequest.update({
    where: { id: request_id },
    data: {
      credentials_sent_at: new Date(),
      credentials_sent_by_id: admin_id
    }
  });

  return { message: "Credentials marked as sent" };
};

export const getClientsService = async () => {
  const data = await prisma.client.findMany({
    orderBy: { createdAt: "desc" }
  });
  return { message: "Clients fetched", data };
};

export const getClientByIdService = async (id: string) => {
  const data = await prisma.client.findUnique({
    where: { id }
  });
  if (!data) throw new AppError("Client not found", 404);
  return { message: "Client fetched", data };
};
