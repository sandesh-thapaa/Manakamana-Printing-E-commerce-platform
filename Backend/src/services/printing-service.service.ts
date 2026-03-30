import prisma from "../connect";

export const getPrintingServicesService = async () => {
  return await prisma.printingService.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const createPrintingServiceService = async (data: {
  name: string;
  description?: string;
  basePrice: number;
}) => {
  return await prisma.printingService.create({
    data,
  });
};

export const getPrintingServiceByIdService = async (id: string) => {
  return await prisma.printingService.findUnique({
    where: { id },
  });
};
