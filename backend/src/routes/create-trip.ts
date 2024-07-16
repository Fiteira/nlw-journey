import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { object, z } from "zod";
import  dayjs  from "dayjs";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer';
import { create } from "domain";

export async function createTrip(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema : {
            body : z.object({
                destination : z.string().min(4),
                start_at : z.coerce.date(),
                ends_at : z.coerce.date(),
                owner_name : z.string(),
                owner_email : z.string().email(),

            })
        }},async ( request ) => {
        const { destination, start_at, ends_at, owner_name, owner_email } = request.body;

        if(dayjs(start_at).isAfter(new Date())) {
            throw new Error('Invalid trip start date.'); 
        }

        if(dayjs(ends_at).isBefore(start_at)) {
            throw new Error('Invalid trip end date.'); 
        }
        
        

        const trip = await prisma.trip.create({
            data : {
                destination,
                start_at,
                ends_at,
                Participant : {
                    create : {
                        name : owner_name,
                        email : owner_email,
                        is_owner : true,
                        is_confirmed : true
                    }
                }   
            
            }
        });

        const mail = await getMailClient();

        const messageEmail = await mail.sendMail({
            from : {
                name: 'Team plann.er',
                address : 'oi@plann.er'
            },
            to : {
                name: owner_name,
                address: owner_email
            },
            subject : 'Testing sending email',
            html : `<p>Hi ${owner_name},</p> <p> Your trip to ${destination} has been created. </p> <p> You can access it <a href="http://localhost:3000/trips/${trip.id}">here</a></p>`
            });

        console.log(nodemailer.getTestMessageUrl(messageEmail));
            

        return { tripId : trip.id };
    }
    );

}