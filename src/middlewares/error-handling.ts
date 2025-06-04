import { AppError } from "@/utils/AppError";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandling(error: any, request: Request, response: Response, next: NextFunction) {
    // Erro de aplicação
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message})
    }

    // Erro de validação
    if (error instanceof ZodError) {
        return response.status(400).json({ message: "validation error", issues: error.format()})
    }

    return response.status(500).json({ message: error.message})
}
