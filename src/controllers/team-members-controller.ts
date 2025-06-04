import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class TeamMembersController {
    async create(request: Request, response: Response){
        const bodySchema = z.object({
            user_id: z.string().uuid(),
            team_id: z.string().uuid(),
        })

        const { user_id, team_id } = bodySchema.parse(request.body)

        const userExists = await prisma.user.findUnique({ where: { id: user_id } })
        if (!userExists) {
            throw new AppError("User not found.", 404)
        }

        const teamExists = await prisma.team.findUnique({ where: { id: team_id } })
        if (!teamExists) {
            throw new AppError("Team not found.", 404)
        }

        const alreadyMember = await prisma.teamMembers.findFirst({ where: { userId: user_id, teamId: team_id } })
        if (alreadyMember) {
            throw new AppError("User is already a member of this team", 409)
        }

        const teamMember = await prisma.teamMembers.create({
            data: {
                userId: user_id,
                teamId: team_id
            }
        })

        return response.status(201).json(teamMember)

    }

    async index(request: Request, response: Response){
        const { team_id } = request.params

        const teamExists = await prisma.team.findUnique({ where: { id: team_id } })

        if (!teamExists) {
            throw new AppError("Team not found", 404)
        }

        const teamMembers = await prisma.teamMembers.findMany({
            where: {
                teamId: team_id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                team: {
                    select: {
                        name: true,
                    }
                }
            }
        })

        const formattedTeamMembers = teamMembers.map(member => ({
            teamName: member.team.name,
            teamId: member.teamId,
            userName: member.user.name,
            userId: member.userId,
            userEmail: member.user.email,
        }));

        return response.json(formattedTeamMembers)
    }

    async remove(request: Request, response: Response) {
        const { team_id, user_id } = request.params

        const teamMemberExists = await prisma.teamMembers.findFirst({
            where: {
                teamId: team_id,
                userId: user_id
            }
        })

        if (!teamMemberExists) {
            throw new AppError("Team member not found", 404)
        }

        await prisma.teamMembers.delete({
            where: {
                userId_teamId: {
                    userId: user_id,
                    teamId: team_id
                }
            }
        })

        return response.status(204).send()
    }
}

export { TeamMembersController}