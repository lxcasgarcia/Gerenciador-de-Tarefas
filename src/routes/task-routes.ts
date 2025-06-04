import { Router } from "express";
import { TasksController } from "@/controllers/tasks-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const taskRoutes = Router();
const taskController = new TasksController();

taskRoutes.use(ensureAuthenticated);

taskRoutes.post("/", verifyUserAuthorization(["admin"]), taskController.create);
taskRoutes.get("/", taskController.index)
taskRoutes.patch("/:id", taskController.update)
taskRoutes.get("/history", verifyUserAuthorization(["admin"]), taskController.logs)

export { taskRoutes }; 