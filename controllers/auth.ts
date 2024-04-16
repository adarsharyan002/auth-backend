import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors';
const nodemailer = require('nodemailer');
import jwt, { JwtPayload } from 'jsonwebtoken';




const transporter = nodemailer.createTransport({
    service:"gmail",
    host:'smtp.gmail.com',
      port:587,
      secure:false,
   
      auth: {
            
            user:"adarsharyanmuz@gmail.com", 
            pass:"xgpibvvtnbtrmfts"
      }
});

const register = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
  
      const existingUser = await User.findOne({ email }).exec();
      if (existingUser) {
        return res.status(409).send({ 
          message: "Email is already in use."
        });
      }
  
      const user = await User.create({ ...req.body });
  
      const token = user.createJWT();
      const url = `https://delite-asg.vercel.app/verify-email/${token}`;
  
      transporter.sendMail({
        from: {
          name: "Adarsh",
          address: "adarsharyanmuz@gmail.com"
        },
        to: email,
        subject: 'Verify Account',
        html: `Click <a href='${url}'>here</a> to confirm your email.`
      }, (err: any) => {
        if (err) {
          console.error("Error sending verification email:", err);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: "Failed to send verification email."
          });
        } else {
          console.log("Verification email sent successfully to:", email);
          res.status(StatusCodes.CREATED).send({
            message: `User registered successfully. Verification email sent to ${email}.`
          });
        }
      });
  
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  };
  

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError('Email is not registered');
    }

    if(!user.verified){
         res.status(403).send({ 
              message: "Verify your Account." 
        });
   }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials');
    }

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: user.firstName }, token });
  } catch (error) {
    // Handle error and send appropriate response
    console.error(error);
    if (error instanceof BadRequestError || error instanceof UnauthenticatedError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }
};

const verify = async (req: Request, res: Response) => {
    const { token } = req.params;
  
    // Check if token is missing
    if (!token) {
      return res.status(422).send({ 
        message: "Missing Token" 
      });
    }
  
    try {
      // Verify the token
      const payload:any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
  
      // Find user with matching ID from token payload
      const user = await User.findOne({ _id: payload.userId }).exec();
      if (!user) {
        return res.status(404).send({ 
          message: "User does not exist" 
        });
      }
  
      // Update user verification status to true if not already verified
      if (!user.verified) {
        user.verified = true;
        await user.save();
      }
  
      // Send success response
      res.status(200).send({
        message: "Account Verified"
      });
  
    } catch (error) {
      console.error("Error verifying account:", error);
      res.status(500).send({ 
        message: "Internal Server Error" 
      });
    }
  };
  
  export default verify;

export { register, login,verify };
