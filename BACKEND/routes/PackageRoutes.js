const express = require("express");
const router = express.Router();

const PackageController = require("../Controllers/PackageControllers");

router.get("/", PackageController.getAllPackages);
router.post("/", PackageController.addPackage);
router.get("/:id", PackageController.getById);
router.put("/:id", PackageController.updatePackage);
router.delete("/:id", PackageController.deletePackage);

module.exports = router;