import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting ultimate comprehensive database seeding...");

  // 1. Admin setup
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@gmail.com",
      password: "admin", 
      role: "ADMIN"
    }
  });

  // 2. Company Payment Details
  const companyPayment = await prisma.companyPaymentDetail.create({
    data: {
      companyName: "Manakamana Printing Base",
      bankName: "Global IME Bank",
      accountName: "Manakamana Prints",
      accountNumber: "0010000000001",
      branch: "Kathmandu Branch",
      note: "Primary Bank Account",
      isActive: true,
      createdById: admin.id
    }
  });

  // 3. Client Registration Request (Pending)
  await prisma.registrationRequest.create({
    data: {
      business_name: "Future Print Shop",
      owner_name: "Alice Smith",
      email: "alice@futureprint.com",
      phone_number: "9812345678",
      business_address: "Pokhara, Nepal",
      notes: "Looking to become a partner",
      status: "PENDING"
    }
  });

  // 4. Client & Wallet setup
  const client = await prisma.client.upsert({
    where: { phone_number: "9800000000" },
    update: {},
    create: {
      phone_number: "9800000000",
      password: "password123",
      business_name: "Demo Print Shop",
      owner_name: "Demo User",
      email: "demo@example.com",
      address: "Kathmandu",
      status: "active"
    }
  });

  const walletAccount = await prisma.walletAccount.upsert({
    where: { clientId: client.id },
    update: {},
    create: {
      clientId: client.id,
      currency: "NPR",
      availableBalance: 15000.00
    }
  });

  const walletTransaction = await prisma.walletTransaction.create({
    data: {
      walletId: walletAccount.id,
      clientId: client.id,
      type: "CREDIT",
      source: "ADJUSTMENT",
      sourceId: "SEED-INIT",
      amount: 15000.00,
      balanceBefore: 0.00,
      balanceAfter: 15000.00,
      description: "Initial seed balance"
    }
  });

  // 5. Wallet Topup Request
  const topupRequest = await prisma.walletTopupRequest.create({
    data: {
      walletId: walletAccount.id,
      clientId: client.id,
      submittedAmount: 5000.00,
      paymentMethod: "BANK_TRANSFER",
      transferReference: "REF-987654321",
      note: "Topup for upcoming orders",
      proofFilePath: "wallet-proofs/sample.jpg",
      proofFileName: "sample.jpg",
      proofMimeType: "image/jpeg",
      proofFileSize: 102400,
      status: "PENDING_REVIEW"
    }
  });

  // 6. Template Category & Template
  const templateCat = await prisma.templateCategory.upsert({
    where: { slug: "business-cards-templates" },
    update: {},
    create: {
      name: "Business Card Templates",
      slug: "business-cards-templates"
    }
  });

  const template = await prisma.template.create({
    data: {
      title: "Corporate Blue Minimal",
      description: "A clean blue corporate template",
      categoryId: templateCat.id,
      fileUrl: "https://images.unsplash.com/photo-1589047913349-2e6fb543b593",
      isActive: true
    }
  });

  // 7. Product Category, Product & Variant
  const productCat = await prisma.productCategory.upsert({
    where: { slug: "business-cards" },
    update: {},
    create: {
      name: "Business Cards",
      slug: "business-cards",
      description: "Premium quality custom business cards",
      image_url: "https://images.unsplash.com/photo-1589047913349-2e6fb543b593"
    }
  });

  const product = await prisma.product.upsert({
    where: { product_code: "PRD-BC-001" },
    update: {},
    create: {
      product_code: "PRD-BC-001",
      category_id: productCat.id,
      name: "Standard Business Card",
      description: "300gsm Standard paper Business card",
      production_days: 3,
      image_url: "https://images.unsplash.com/photo-1589047913349-2e6fb543b593"
    }
  });

  const variant = await prisma.productVariant.upsert({
    where: { variant_code: "VAR-BC-STD" },
    update: {},
    create: {
      product_id: product.id,
      variant_code: "VAR-BC-STD",
      variant_name: "Standard Size (3.5 x 2)",
      min_quantity: 100
    }
  });

  // 8. Option Groups & Values
  const groupPaperQuality = await prisma.optionGroup.create({
    data: {
      variant_id: variant.id,
      name: "paper_quality",
      label: "Paper Quality",
      display_order: 1,
      is_required: true
    }
  });

  await prisma.optionValue.create({
    data: { group_id: groupPaperQuality.id, code: "300GSM", label: "300 GSM Standard", display_order: 1 }
  });
  await prisma.optionValue.create({
    data: { group_id: groupPaperQuality.id, code: "350GSM", label: "350 GSM Premium", display_order: 2 }
  });

  // 9. Variant Pricing
  await prisma.variantPricing.create({
    data: {
      variant_id: variant.id,
      paper_quality: "300GSM",
      holder_type: null,
      page_color: null,
      binding: null,
      price: 15.00,
      is_active: true,
      discount_type: null,
      discount_value: 0
    }
  });

  await prisma.variantPricing.create({
    data: {
      variant_id: variant.id,
      paper_quality: "350GSM",
      holder_type: null,
      page_color: null,
      binding: null,
      price: 20.00,
      is_active: true,
      discount_type: "fixed",
      discount_value: 200 
    }
  });

  // 10. Design Submission & Approved Design
  const submission = await prisma.designSubmission.create({
    data: {
      clientId: client.id,
      templateId: template.id,
      title: "My Custom Business Card",
      notes: "Please make sure colors pop",
      fileUrl: "https://images.unsplash.com/photo-1589047913349-2e6fb543b593",
      fileType: "image/jpeg",
      fileSize: 500000,
      status: "APPROVED",
      reviewedBy_id: admin.id,
      reviewedAt: new Date()
    }
  });

  const approvedDesign = await prisma.approvedDesign.create({
    data: {
      designCode: "DSN-2026-000001",
      clientId: client.id,
      submissionId: submission.id,
      approvedFileUrl: submission.fileUrl,
      status: "ACTIVE",
      approvedBy_id: admin.id
    }
  });

  // Update submission with approvedDesignId
  await prisma.designSubmission.update({
    where: { id: submission.id },
    data: { approvedDesignId: approvedDesign.id }
  });

  // 11. Order & Order Configuration
  const order = await prisma.order.create({
    data: {
      user_id: client.id,
      variant_id: variant.id,
      quantity: 500,
      unit_price: 15.00, // Matching the 300GSM price
      total_amount: 7500.00,
      discount_type: null,
      discount_value: 0,
      discount_amount: 0,
      final_amount: 7500.00,
      status: "ORDER_PLACED",
      payment_status: "PAID",
      notes: "Deliver by Monday",
      designId: approvedDesign.id,
      pricing_snapshot: { paper_quality: "300GSM" },
      configurations: {
        create: [
          {
            group_name: "paper_quality",
            group_label: "Paper Quality",
            selected_code: "300GSM",
            selected_label: "300 GSM Standard"
          }
        ]
      }
    }
  });

  // Link Wallet Transaction for the Order
  const orderWalletTxn = await prisma.walletTransaction.create({
    data: {
      walletId: walletAccount.id,
      clientId: client.id,
      type: "DEBIT",
      source: "ORDER",
      sourceId: order.id,
      amount: 7500.00,
      balanceBefore: 15000.00,
      balanceAfter: 7500.00,
      description: "Payment for Order " + order.id
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { walletTransactionId: orderWalletTxn.id }
  });

  // Update client wallet balance
  await prisma.walletAccount.update({
    where: { id: walletAccount.id },
    data: { availableBalance: 7500.00 }
  });

  // 12. Notification
  await prisma.notification.create({
    data: {
      recipientRole: "CLIENT",
      recipientId: client.id,
      clientId: client.id,
      type: "ORDER_PLACED",
      title: "Order Placed Successfully",
      message: "Your order for Standard Business Card has been placed.",
      referenceId: order.id,
      isRead: false
    }
  });

  // 13. Printing Services
  await prisma.printingService.create({
    data: {
      name: "A4 Normal Print",
      description: "Standard copy paper print",
      basePrice: 5.00,
      isActive: true
    }
  });

  console.log("Database seeded successfully with ALL models populated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
