import mongoose from "mongoose";
import Appointment from '../models/appointment.model.js'
import User from '../models/user.model.js'
import {generateTicketNumber} from "../utils/shortUIDgenerator.js" ;
import {sendEmail} from "../utils/mailSender.js";
import {AppointmentMailTemplate} from '../MailTemplates/appointment.template.js';


export const addAppointment = async(req,res) => {
    try {

        const {centerId,centerAddress,centerName,userId,wasteId,date,time} = req.body ;


        // some validations 
        if(!userId || !centerId || !centerAddress || !centerName || !wasteId || !date || !time )
        {
            return res.status(500).json({
                success:false,
                message:"Some details not found in addAppointment",
            })
        }


        // Parse the time string to extract hours and minutes
        const [hours, minutes] = time.split(':').map(Number);

        // Parse the date string to extract year, month, and day
        const [year, month, day] = date.split('-').map(Number);

        // Create a new Date object with the combined date and time components
        const dateObject = new Date(year, month - 1, day, hours, minutes);



        const origUserId = new mongoose.Types.ObjectId(userId);
        const origWasteId =  new mongoose.Types.ObjectId(wasteId);

        // generate ticket 
        const uniqueTicket = generateTicketNumber() ;

        const appointmentData = {
            centerId:centerId,
            centerName:centerName,
            centerAddress:centerAddress,
            date:dateObject,
            user:origUserId,
            waste:origWasteId,
            ticket: uniqueTicket,
        }

        const appointment = await Appointment.create(appointmentData);


        const updatedUser = await User.findByIdAndUpdate(
                                            origUserId,
                                            {
                                                $push:{Appointments:appointment._id}
                                            },
                                            {new:true});

        
        // send email 
        const mailHTML = AppointmentMailTemplate(updatedUser.Name,date,time,centerAddress,centerName,uniqueTicket);
        sendEmail(updatedUser.Email,"EcoGeeks","Appointment Confirmation Mail",mailHTML);

        return res.status(200).json({
            success:true,
            message:"Appointment added successfully",
            appointment:appointment, 
            user : updatedUser,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong in addAppointment backend",
            error:error.message,
        })
    }
}

export const getAppointmentDetails = async(req,res) => {
    try {

        // data fetch karo req se
        const {userId} = req ; 

        const userid = new mongoose.Types.ObjectId(userId);
        
        // some validations 
        if(!userid)
        {
            return res.status(500).json({
                success:false,
                message:"UserId not found in getAppointmentDetails",
            })
        }

        const user = await User.findById(userid).populate({
                                                    path: 'Appointments',
                                                    populate: {
                                                        path: 'waste'
                                                    }
                                                });

        if(!user)
        {
            return res.status(500).json({
                success:false,
                message:"User not found in getAppointmentDetails",
            })
        }


        // appointment ki details le lo 
        const appointmentDetails = user.Appointments ;

        if(!appointmentDetails)
        {
            return res.status(500).json({
                success:false,
                message:"Appointment Data not found",
                appointmentDetails:null,
            })
        }


        // return successful response
        return res.status(200).json({
            success:true,
            message:"Appointment data found",
            appointmentDetails:appointmentDetails,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong in getAppointmentDetails backend",
            error:error.message,
        })
    }
}

export const getAppointmentDetailsByTicketOrEmail = async(req,res) => {
    try {

        const {ticket,email} = req.body ;

        // if(!ticket || !email)
        // {
        //     return res.status(500).json({
        //         success:false,
        //         message:"Ticket or Email in getAppointmentDetailsByTicketOrEmail backend",
        //     })
        // }

        let appointments = null ;
        let byTicket = false ;
        let byEmail = false ;

        if(ticket)
        {
            appointments = await Appointment.find({ticket:ticket})
                                            .populate({
                                                path: 'user'
                                            })
                                            .populate({
                                                path: 'waste',
                                                populate: {
                                                    path: 'preciousMetals'
                                                }
                                            })
                                            .exec();
            byTicket=true
        }
        else{

            let UserAppointments = await User.findOne({Email:email}).populate({
                path: 'Appointments',
                populate: [
                  { path: 'user' },
                  { path: 'waste', populate: 'preciousMetals' }
                ]
            });

            appointments = UserAppointments.Appointments ;

            byEmail=true
        }

        if(!appointments)
        {
            return res.status(500).json({
                success:false,
                message:"Appointments in getAppointmentDetailsByTicketOrEmail backend",
            })
        }

        return res.status(200).json({
            success:true,
            byEmail:byEmail,
            byTicket:byTicket,
            appointments:appointments,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong in getAppointmentDetailsByTicketOrEmail backend",
            error:error.message,
        })
    }
}

export const processAppointment = async(req,res) => {
    try {

        const {userId,appointmentId,greenPoints} = req.body ;
        
        if(!userId || !appointmentId || !greenPoints)
        {
            return res.status(500).json({
                success:false,
                message:"Fill full info in processAppointment backend",
            })
        }

        const user_id = new mongoose.Types.ObjectId(userId);
        const appointmentIdToRemove = new mongoose.Types.ObjectId(appointmentId);

        
        const user = await User.findById(user_id) ;
        const prevGreenPoints = user.GreenPoints ;

        const updatedUser = await User.findByIdAndUpdate(
            {_id:user_id},
            { 
                $set: { GreenPoints: prevGreenPoints+greenPoints }, // Update greenpoint value 
            },
            {new:true}
        );

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            {_id:appointmentIdToRemove},
            {
                $set : {processed:true}
            },
            {new:true}
        )

        const operatorId = req.userId ;
        

        return res.status(200).json({
            success:true,
            message:"success",
            updatedUser:updatedUser,
        })

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong in processAppointment backend",
            error:error.message,
        })
    }
}