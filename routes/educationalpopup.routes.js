import express from 'express';
const router = express();

import {addEducationalPopup,getAllEducationalPopupDetails,updateEducationalPopup} from '../controllers/educationalpopup.controller.js'
import { addUserToReq } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/authorization.middleware.js';

router.post('/addEducationalPopup', addUserToReq ,authorizeRoles("Admin", "Operator"),  addEducationalPopup);
router.get('/getAllEducationalPopupDetails',getAllEducationalPopupDetails);
router.put('/updateEducationalPopup', addUserToReq ,authorizeRoles("Admin", "Operator"), updateEducationalPopup);


export default router ;

