import express from 'express';
const router = express();

import {getDeviceDetails,getDeviceDetailsById,getEwastesCategory,getSelectedCategoryWasteInfo,getAllDevices,updateDeviceInfo} from '../controllers/waste.controller.js'
import { addUserToReq } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/authorization.middleware.js';

router.get('/getEwastesCategory',getEwastesCategory);
router.post('/getSelectedCategoryWasteInfo',getSelectedCategoryWasteInfo);
router.post('/getDeviceDetails',getDeviceDetails);
router.post('/getDeviceDetailsById',getDeviceDetailsById);
router.get('/getAllDevices',getAllDevices);
router.put('/updateDeviceInfo', addUserToReq,authorizeRoles("Admin", "Operator"), updateDeviceInfo);


export default router ;

