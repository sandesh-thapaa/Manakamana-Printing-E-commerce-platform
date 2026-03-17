import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { AppError } from "../utils/apperror";

export const getRegistrationRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminService.getRegistrationRequestsService();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminService.createRegistrationRequestService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getRegistrationRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { request_id } = req.params;

    const result =
      await adminService.getRegistrationRequestByIdService(request_id as string);

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const approveRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { request_id } = req.params;

    const result =
      await adminService.approveRegistrationRequestService(request_id as string);

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const rejectRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { request_id } = req.params;

    const result =
      await adminService.rejectRegistrationRequestService(request_id as string);

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};