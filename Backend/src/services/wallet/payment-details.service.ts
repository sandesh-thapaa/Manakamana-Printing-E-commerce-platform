import prisma from "../../connect";

export const createPaymentDetailsService = async (data: {
  companyName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  upiId?: string;
  qrImageUrl?: string;
  note?: string;
  isActive?: boolean;
  adminId: string;
}) => {
  // If isActive, deactivate all existing active records
  if (data.isActive !== false) {
    await prisma.companyPaymentDetail.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return prisma.companyPaymentDetail.create({
    data: {
      companyName: data.companyName,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      branch: data.branch,
      upiId: data.upiId,
      qrImageUrl: data.qrImageUrl,
      note: data.note,
      isActive: data.isActive !== false,
      createdById: data.adminId,
    },
  });
};

export const getActivePaymentDetailsService = async () => {
  return prisma.companyPaymentDetail.findFirst({
    where: { isActive: true },
  });
};
