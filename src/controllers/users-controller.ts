import { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class UsersController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2),
            email: z.string().email(),
            password: z.string().min(6),
        })

        const { name, email, password } = bodySchema.parse(request.body)

        const userWithSameEmail = await prisma.user.findFirst({ where: { email }})

        // Se o usuário com o mesmo email já existir, retorna um erro
        if (userWithSameEmail) {
            throw new AppError("User already exists", 400)
        }

        const hashedPassword = await hash(password, 8)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        const { password: _, ...userWithoutPassword } = user

        return response.status(201).json( userWithoutPassword )
    }
}

export { UsersController }
