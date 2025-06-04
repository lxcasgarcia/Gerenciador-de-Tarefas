import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

class TeamController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string(),
            description: z.string(),
        })

        const { name, description } = bodySchema.parse(request.body);

        await prisma.team.create({
            data: {
                name,
                description
            }
        })
        
        return response.status(201).json({ message: "Team created" });
    }

    async index(request: Request, response: Response) {
        const teams = await prisma.team.findMany()

        return response.json(teams);
    }

    async update(request: Request, response: Response) {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const bodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional()
        }).refine(data => data.name !== undefined || data.description !== undefined, {
            message: "Pelo menos um dos campos (name ou description) deve ser fornecido para atualização."
        })

        const { id } = paramsSchema.parse(request.params)
        const { name, description } = bodySchema.parse(request.body)

        await prisma.team.update({
            data: {
                name,
                description
            },
            where: {
                id
            }
        })

        return response.json()
    }
}

export { TeamController };
