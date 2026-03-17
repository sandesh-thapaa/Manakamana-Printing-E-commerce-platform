import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/apperror";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.loginUserService(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.logoutUserService();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.getCurrentUserService(req);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};