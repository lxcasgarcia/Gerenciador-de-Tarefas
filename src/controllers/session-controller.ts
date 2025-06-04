import { Request, Response } from "express"
import { prisma } from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"
import { compare } from "bcrypt"
import { authConfig } from "@/configs/auth"
import { sign } from "jsonwebtoken"

class SessionController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
        })

        const { email, password } = bodySchema.parse(request.body)

        // Verifica o email
        const user = await prisma.user.findFirst({ where: { email } })

        if (!user) {
            throw new AppError("Email or password incorrect", 401)
        }

        // Verifica a senha
        const passwordMatched = await compare(password, user.password)

        if (!passwordMatched) {
            throw new AppError("Email or password incorrect", 401)
        }

        const { secret, expiresIn } = authConfig.jwt

        const token = sign({ role: user.role ?? "member" }, secret, {
            subject: user.id,
            expiresIn,
        })

        const { password: hashedPassword, ...userWithoutPassword } = user

        return response.json({ token, user: userWithoutPassword })
    }
}

export { SessionController }