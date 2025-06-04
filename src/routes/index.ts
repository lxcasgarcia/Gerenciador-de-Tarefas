import { Router } from "express";

import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { teamRoutes } from "./team-routes";
import { taskRoutes } from "./task-routes";

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/teams", teamRoutes)
routes.use("/tasks", taskRoutes);

export { routes }
