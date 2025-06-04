import e, { Router } from "express";
import { TeamController } from "@/controllers/team-controller";
import { TeamMembersController } from "@/controllers/team-members-controller";

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const teamRoutes = Router();
const teamController = new TeamController();
const teamMembersController = new TeamMembersController()


teamRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]));
teamRoutes.post("/", teamController.create);
teamRoutes.get("/", teamController.index);
teamRoutes.patch("/:id/team", teamController.update)
teamRoutes.post("/team-members", teamMembersController.create);
teamRoutes.get("/:team_id/members", teamMembersController.index);
teamRoutes.delete("/team-members/:team_id/:user_id", teamMembersController.remove);


export { teamRoutes };
