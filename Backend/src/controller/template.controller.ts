import { Request, Response } from "express";
import { getCategoriesService, getTemplatesService, getTemplateByIdService } from "../services/template.service";
import { getTemplatesQuerySchema } from "../validators/template.validator";

export const getTemplateCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesService();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const validatedQuery = getTemplatesQuerySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validatedQuery.error.issues,
      });
    }

    const { category, page, limit, search } = validatedQuery.data;

    const data = await getTemplatesService({
      category,
      page: page || 1,
      limit: limit || 10,
      search,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.templateId as string;
    const template = await getTemplateByIdService(templateId);

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found or inactive" });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
