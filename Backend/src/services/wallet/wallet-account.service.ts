import prisma from "../../connect";

export const getOrCreateWalletService = async (clientId: string) => {
  let wallet = await prisma.walletAccount.findUnique({
    where: { clientId },
  });

  if (!wallet) {
    wallet = await prisma.walletAccount.create({
      data: {
        clientId,
        currency: "NPR",
        availableBalance: 0,
      },
    });
  }

  return wallet;
};

export const getBalanceService = async (clientId: string) => {
  const wallet = await getOrCreateWalletService(clientId);
  return {
    clientId: wallet.clientId,
    currency: wallet.currency,
    availableBalance: Number(wallet.availableBalance),
  };
};
