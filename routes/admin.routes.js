import express from 'express'
const router = express.Router() ;


import {addEwasteDetails,addCategory,bulkEwasteAdd,getUnapprovedOperators,approveOperator,contactUs,getAllMessages} from '../controllers/user.controller.js'
import { authorizeRoles } from '../middleware/authorization.middleware.js';

router.post('/add_ewaste',authorizeRoles("Admin", "Operator"),addEwasteDetails);
router.post('/addCategory',authorizeRoles("Admin"),addCategory);
router.post('/bulkEwasteAdd',authorizeRoles("Admin"),bulkEwasteAdd);
router.put('/approveOperator',authorizeRoles("Admin"),approveOperator);
router.get('/getUnapprovedOperators',authorizeRoles("Admin"),getUnapprovedOperators);
router.post('/contactUs',authorizeRoles("Admin"),contactUs);
router.get('/getAllMessages',authorizeRoles("Admin"),getAllMessages);


export default router;