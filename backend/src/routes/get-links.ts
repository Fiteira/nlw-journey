import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { link } from "fs";

export async function getLink(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', {
        schema : {
            params : z.object({ tripId : z.string() })

        }},async ( request ) => {
            const tripId = request.params.tripId; 
            
            const trip = await prisma.trip.findUnique({
                where : { id : tripId },
                include : { 
                    links : true
                }
            });            

                
            if(!trip) {
                throw new Error('Trip not found');
            }
            
        
            return {links : trip.links};

        }        
    );

}