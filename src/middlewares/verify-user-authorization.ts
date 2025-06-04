import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

function verifyUserAuthorization(role: string[]) {
    return (request: Request, response: Response, next: NextFunction) => {
        // Verifica se o usuário está autenticado
        if (!request.user) {
            throw new AppError("Unauthorized", 401);
        }

        // Verifica se o usuário tem a função necessária para acessar a rota
        if (!role.includes(request.user.role)) {
            throw new AppError("Unauthorized", 401);
        }

        return next();
    }
}

export { verifyUserAuthorization };
