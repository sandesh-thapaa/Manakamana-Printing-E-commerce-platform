import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getCategoriesService = async () => {
  const categories = await prisma.templateCategory.findMany({
    orderBy: { name: "asc" }
  });
  return categories;
};

export const getTemplatesService = async (options: {
  category?: string;
  page: number;
  limit: number;
  search?: string;
}) => {
  const { category, page, limit, search } = options;

  const where: any = { isActive: true };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [items, totalItems] = await Promise.all([
    prisma.template.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.count({ where })
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return { items, pagination: { page, limit, totalItems, totalPages } };
};

export const getTemplateByIdService = async (id: string) => {
  const template = await prisma.template.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } }
  });
  return template;
};
