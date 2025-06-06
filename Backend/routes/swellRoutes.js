import express from "express";
import { updateSwellPoints, fetchSwellPoints} from "../controller/SwellPoints.js";

const router = express.Router();

router.post("/updateSwellPoints", updateSwellPoints);
router.get("/fetchSwellPoints", fetchSwellPoints);

export default router;
