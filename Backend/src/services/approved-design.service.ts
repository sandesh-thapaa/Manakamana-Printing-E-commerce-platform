import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Client: Get my design
export const getMyDesignByIdService = async (designCode: string, clientId: string) => {
  return await prisma.approvedDesign.findFirst({
    where: { designCode, clientId },
  });
};

// Client: Verify Design ID
export const verifyDesignIdService = async (designCode: string, clientId: string) => {
  const design = await prisma.approvedDesign.findUnique({
    where: { designCode },
  });

  if (!design || design.status !== "ACTIVE") {
    return {
      valid: false,
      designId: designCode,
      status: design?.status || null,
      belongsToCurrentClient: false,
    };
  }

  return {
    valid: true,
    designId: design.designCode,
    status: design.status,
    belongsToCurrentClient: design.clientId === clientId,
  };
};

// Admin: Get all designs
export const getAdminDesignsService = async (options: {
  status?: "ACTIVE" | "ARCHIVED";
  clientId?: string;
  search?: string;
  page: number;
  limit: number;
}) => {
  const { status, clientId, search, page, limit } = options;

  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) where.designCode = { contains: search, mode: "insensitive" };

  const [items, totalItems] = await Promise.all([
    prisma.approvedDesign.findMany({
      where,
      include: {
        client: { select: { id: true, business_name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { approvedAt: "desc" },
    }),
    prisma.approvedDesign.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { items, pagination: { page, limit, totalItems, totalPages } };
};

// Admin: Get design detail
export const getAdminDesignByIdService = async (designCode: string) => {
  return await prisma.approvedDesign.findUnique({
    where: { designCode },
    include: {
      client: { select: { id: true, business_name: true, phone_number: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });
};

// Admin: Archive design
export const archiveDesignService = async (designCode: string, adminId: string, reason?: string) => {
  return await prisma.$transaction(async (tx) => {
    const design = await tx.approvedDesign.findUnique({ where: { designCode } });
    if (!design) throw new Error("Design not found");
    if (design.status === "ARCHIVED") return design; // idempotent

    const archivedDesign = await tx.approvedDesign.update({
      where: { designCode },
      data: {
        status: "ARCHIVED",
        archivedBy_id: adminId,
        archivedAt: new Date(),
        archiveReason: reason,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ARCHIVE_DESIGN",
        entityId: archivedDesign.id,
        entityType: "ApprovedDesign",
        adminId,
        details: { reason },
      },
    });

    return archivedDesign;
  });
};
