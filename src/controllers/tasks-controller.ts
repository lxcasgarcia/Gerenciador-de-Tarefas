import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class TasksController{
    async create(request: Request, response:Response) {
        const bodySchema = z.object({
            title: z.string(),
            description: z.string(),
            team_id: z.string().uuid(),
            assigned_to_id: z.string().uuid()
        })

        const { title, description, team_id, assigned_to_id } = bodySchema.parse(request.body)

        const teamExist = await prisma.team.findUnique({ where: {id: team_id} })
        if(!teamExist){
            throw new AppError("Team not found", 404)
        }

        const userExist = await prisma.user.findUnique({ where: {id: assigned_to_id} })
        if(!userExist){
            throw new AppError("User not found", 404)
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                teamId: team_id,
                assignedTo: assigned_to_id,
            }
        })

        
    return response.status(201).json(task);
    }

    async index(request: Request, response: Response) {

        if (!request.user) {
            throw new AppError("Unauthorized", 401);
        }        

        const { id: userId, role } = request.user

        let tasks

        if (role === "admin") {
            tasks = await prisma.task.findMany({

            })
        } else {
            const teams = await prisma.teamMembers.findMany({
                where: { userId },
                select: { teamId: true }
            })

            const teamIds = teams.map(t => t.teamId)

            tasks = await prisma.task.findMany({
                where: {
                    teamId: {
                        in: teamIds
                    }
                },
                include: {
                    assignee: true,
                    team: true
                }
            })
        }

        return response.json(tasks)

    }

    async update(request: Request, response: Response) {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const bodySchema = z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["pending", "in_progress", "completed"]).optional(),
            priority: z.enum(["low", "medium", "high"]).optional(),
            assigned_to_id: z.string().uuid().optional(),
            changed_by: z.string().uuid()
        })

        const { id } = paramsSchema.parse(request.params)
        const { title, description, status, priority, assigned_to_id, changed_by } = bodySchema.parse(request.body)


        if (!request.user) {
            throw new AppError("Unauthorized", 401);
        }     

        const { id: userId, role } = request.user!

        const taskExists = await prisma.task.findUnique({ where: { id } })
        if (!taskExists){
            throw new AppError("Task not found", 404)
        }

        if (role !== "admin" && taskExists.assignedTo !== userId ) {
            throw new AppError("You are not authorized to update this task", 403)
        }

        if (assigned_to_id) {
            const userExists = await prisma.user.findUnique({ where: { id: assigned_to_id } });
            if (!userExists) {
              throw new AppError("Assigned user not found", 404);
            }
          }

        const statusChanged = status && status !== taskExists.status  

        const updatedTask = await prisma.task.update({
            where: {
                id
            },
            data: {
                title,
                description,
                status,
                priority,
                assignedTo: assigned_to_id
            }
        })

        if(statusChanged) {
            await prisma.taskHistory.create({
                data: {
                    taskId: id,
                    changedBy: changed_by,
                    oldStatus: taskExists.status,
                    newStatus: status
                }
            })
        }

        return response.json(updatedTask)
    }

    async logs(request: Request, response: Response){
        const { id } = request.params

        const history = await prisma.taskHistory.findMany({
            orderBy: { changedAt: "desc"},
            include: {
                task: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return response.json(history)
    }
}

export { TasksController }