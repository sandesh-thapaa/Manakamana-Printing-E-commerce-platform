import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createDesignSubmissionService = async (data: {
  clientId: string;
  templateId?: string;
  title?: string;
  notes?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}) => {
  return await prisma.$transaction(async (tx) => {
    const submission = await tx.designSubmission.create({
      data: {
        clientId: data.clientId,
        templateId: data.templateId,
        title: data.title,
        notes: data.notes,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        status: "PENDING_REVIEW",
      },
    });

    // Create an admin notification internally
    // Currently, notification table is for clients as per schema but we can just skip or add a log.
    
    return submission;
  });
};

export const getMySubmissionsService = async (options: {
  clientId: string;
  status?: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  page: number;
  limit: number;
}) => {
  const { clientId, status, page, limit } = options;

  const where: any = { clientId };
  if (status) {
    where.status = status;
  }

  const [items, totalItems] = await Promise.all([
    prisma.designSubmission.findMany({
      where,
      include: {
        template: { select: { id: true, title: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.designSubmission.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { items, pagination: { page, limit, totalItems, totalPages } };
};

export const getMySubmissionByIdService = async (submissionId: string, clientId: string) => {
  return await prisma.designSubmission.findFirst({
    where: { id: submissionId, clientId },
    include: {
      template: { select: { id: true, title: true } },
    },
  });
};

export const getAdminSubmissionsService = async (options: {
  status?: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  clientId?: string;
  page: number;
  limit: number;
  sort: "submittedAt.desc" | "submittedAt.asc";
}) => {
  const { status, clientId, page, limit, sort } = options;

  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const [items, totalItems] = await Promise.all([
    prisma.designSubmission.findMany({
      where,
      include: {
        client: { select: { id: true, business_name: true, phone_number: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { submittedAt: sort === "submittedAt.desc" ? "desc" : "asc" },
    }),
    prisma.designSubmission.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { items, pagination: { page, limit, totalItems, totalPages } };
};

export const getAdminSubmissionByIdService = async (submissionId: string) => {
  return await prisma.designSubmission.findUnique({
    where: { id: submissionId },
    include: {
      client: { select: { id: true, business_name: true, phone_number: true } },
      template: { select: { id: true, title: true } },
    },
  });
};

export const approveSubmissionService = async (
  submissionId: string,
  adminId: string,
  note?: string
) => {
  return await prisma.$transaction(async (tx) => {
    const submission = await tx.designSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "PENDING_REVIEW") throw new Error("Submission is not pending review");

    // Generate unique public Design ID
    const nanoId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const designCode = `DSN-${new Date().getFullYear()}-${nanoId}`;

    // Create approved design
    const approvedDesign = await tx.approvedDesign.create({
      data: {
        designCode,
        clientId: submission.clientId,
        submissionId: submission.id,
        approvedFileUrl: submission.fileUrl, // mapping submitted file to approved
        approvedBy_id: adminId,
        status: "ACTIVE",
      },
    });

    // Update submission status
    const updatedSubmission = await tx.designSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        approvedDesignId: approvedDesign.id,
        reviewedBy_id: adminId,
        reviewedAt: new Date(),
        feedbackMessage: note,
      },
    });

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        action: "APPROVE_DESIGN_SUBMISSION",
        entityId: submissionId,
        entityType: "DesignSubmission",
        adminId,
        details: { note },
      },
    });

    return { submission: updatedSubmission, approvedDesign };
  });
};

export const rejectSubmissionService = async (
  submissionId: string,
  adminId: string,
  feedbackMessage: string
) => {
  return await prisma.$transaction(async (tx) => {
    const submission = await tx.designSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "PENDING_REVIEW") throw new Error("Submission is not pending review");

    const updatedSubmission = await tx.designSubmission.update({
      where: { id: submissionId },
      data: {
        status: "REJECTED",
        reviewedBy_id: adminId,
        reviewedAt: new Date(),
        feedbackMessage,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "REJECT_DESIGN_SUBMISSION",
        entityId: submissionId,
        entityType: "DesignSubmission",
        adminId,
        details: { feedbackMessage },
      },
    });

    return updatedSubmission;
  });
};
