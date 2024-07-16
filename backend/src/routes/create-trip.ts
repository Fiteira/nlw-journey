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
                emails_to_invite : z.array(z.string().email())

            })
        }},async ( request ) => {
        const { destination, start_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

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
                    createMany : {
                        data: [
                            {
                                name : owner_name,
                                email : owner_email,
                                is_owner : true,
                                is_confirmed : true
                            },
                            ...emails_to_invite.map(email => {
                                return {email}
                            })
                        ]
                    }
                }   
            
            }
        });

        const mail = await getMailClient();

        const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`;

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
            html : `<p>Hi ${owner_name},</p> <p> Your trip to ${destination} 
            has been created. </p> <p> You can access it <a href=${confirmationLink}>Confirmation Link</a></p>`.trim()
            });

        console.log(nodemailer.getTestMessageUrl(messageEmail));
            

        return { tripId : trip.id };
    }
    );

}