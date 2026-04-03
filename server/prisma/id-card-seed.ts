import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ID Card Products...");

  // PVC ID Card Product
  await prisma.idCardProduct.upsert({
    where: { product_code: "ID-PVC-STD" },
    update: {
      name: "Standard PVC ID Card",
      description: "Standard credit card sized PVC ID card for employees.",
      base_price: 150.0,
      discount_type: "percentage",
      discount_value: 10,
      image_url: "https://images.unsplash.com/photo-1611095973362-88e8e2557e58",
      is_active: true,
    },
    create: {
      product_code: "ID-PVC-STD",
      name: "Standard PVC ID Card",
      description: "Standard credit card sized PVC ID card for employees.",
      base_price: 150.0,
      discount_type: "percentage",
      discount_value: 10,
      image_url: "https://images.unsplash.com/photo-1611095973362-88e8e2557e58",
      is_active: true,
    },
  });

  // Premium Laminated ID Card
  await prisma.idCardProduct.upsert({
    where: { product_code: "ID-PRM-LAM" },
    update: {
      name: "Premium Laminated ID Card",
      description: "High-quality laminated ID card with edge-to-edge printing.",
      base_price: 200.0,
      discount_type: "fixed",
      discount_value: 20,
      image_url: "https://images.unsplash.com/photo-1598550476439-6847785fce66",
      is_active: true,
    },
    create: {
      product_code: "ID-PRM-LAM",
      name: "Premium Laminated ID Card",
      description: "High-quality laminated ID card with edge-to-edge printing.",
      base_price: 200.0,
      discount_type: "fixed",
      discount_value: 20,
      image_url: "https://images.unsplash.com/photo-1598550476439-6847785fce66",
      is_active: true,
    },
  });

  // Access Card / RFID
  await prisma.idCardProduct.upsert({
    where: { product_code: "ID-RFID-ACC" },
    update: {
      name: "RFID Access Card",
      description: "Electronic proximity card for office access control.",
      base_price: 350.0,
      discount_type: null,
      discount_value: 0,
      image_url: "https://images.unsplash.com/photo-1563013544-824ae1b90d62",
      is_active: true,
    },
    create: {
      product_code: "ID-RFID-ACC",
      name: "RFID Access Card",
      description: "Electronic proximity card for office access control.",
      base_price: 350.0,
      discount_type: null,
      discount_value: 0,
      image_url: "https://images.unsplash.com/photo-1563013544-824ae1b90d62",
      is_active: true,
    },
  });

  console.log("ID Card Products seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
