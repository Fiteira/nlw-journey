import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer';

export async function conformTrip(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema : {
            params : z.object({
                tripId : z.string().uuid()
            })
            
        }},async ( request , response) => {
            
            const { tripId } = request.params;

            const trip = await prisma.trip.findUnique({
                where : {
                    id : tripId
                },
                include : {
                    participants : {
                        where : {
                            is_owner : false
                        }
                    }
                }
            });

            if(!trip) {
                throw new Error("Trip not found");
            }

            if(trip.is_confirmed){
                return response.redirect(`http://localhost:3000/trips/${tripId}`);
            }

            await prisma.trip.update({
                where : {
                    id : tripId
                },
                data : {
                    is_confirmed : true
                }
            }); 

            const mail = await getMailClient();
            
            await Promise.all(
                trip.participants.map(async participant => {

                const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;

                const message = await mail.sendMail({
                    from : {
                        name: 'Team plann.er',
                        address : 'oi@plann.er'
                    },
                    to : participant.email,
                    subject : 'Testing sending email',
                    html : `<p>Hi ${participant.name},</p> <p> Your trip to ${trip.destination} 
                    has been created. </p> <p> You can access it <a href=${confirmationLink}>Confirmation Link</a></p>`.trim()
                    });

                console.log(nodemailer.getTestMessageUrl(message));

                })
            );

            return response.redirect(`http://localhost:3000/trips/${tripId}`);
        }
    );

}