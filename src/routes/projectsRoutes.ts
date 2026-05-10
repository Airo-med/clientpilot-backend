import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectsController";

const router = Router();
router.use(authenticate);
router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
