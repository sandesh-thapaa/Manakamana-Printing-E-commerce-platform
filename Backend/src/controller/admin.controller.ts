import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { AppError } from "../utils/apperror";

export const getRegistrationRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, search } = req.query;
    const result = await adminService.getRegistrationRequestsService({ 
      status: status as string, 
      search: search as string 
    });
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
    const result = await adminService.getRegistrationRequestByIdService(request_id as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const approveRegistrationRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { request_id } = req.params;
    const admin_id = req.user.id;

    const result = await adminService.approveRegistrationRequestService(request_id as string, admin_id);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const rejectRegistrationRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { request_id } = req.params;
    const admin_id = req.user.id;
    const { reason } = req.body;

    const result = await adminService.rejectRegistrationRequestService(request_id as string, admin_id, reason);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

// markCredentialsSent controller removed as fields are deleted from schema

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getClientsService();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminService.getClientByIdService(id as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};