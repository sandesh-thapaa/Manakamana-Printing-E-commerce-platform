import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/apperror";

export const loginClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.loginClientService(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.loginAdminService(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.logoutService();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getMe = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      message: "Current user fetched",
      user: req.user
    });
  } catch (error: any) {
    next(error);
  }
};