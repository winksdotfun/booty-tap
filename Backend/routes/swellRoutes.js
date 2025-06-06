import express from "express";
import { updateSwellPoints, fetchSwellPoints} from "../controller/SwellPoints";

const router = express.Router();

router.post("/updateSwellPoints", updateSwellPoints);
router.get("/fetchSwellPoints", fetchSwellPoints);

export default router;
