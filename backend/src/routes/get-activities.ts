import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";


export async function getActivities(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
        schema : {
            params : z.object({ tripId : z.string() })

        }},async ( request ) => {
            const tripId = request.params.tripId; 
            
            const trip = await prisma.trip.findUnique({
                where : { id : tripId },
                include : { 
                    activities : {
                        orderBy : { 
                            occurs_at : 'asc' 
                        }
                    }
                }
            });            

                
            if(!trip) {
                throw new Error('Trip not found');
            }
            
            const differenceInDaysBetweenStartAndEnd = dayjs(trip.ends_at).diff(dayjs(trip.start_at), 'days');

            const activities = Array.from({length : differenceInDaysBetweenStartAndEnd + 1}).map((_, index) => {
                
                const date = dayjs(trip.start_at).add(index, 'days');  


                return { 
                    date : date.toDate(),
                    activities : trip.activities.filter(activity => {
                        return dayjs(activity.occurs_at).isSame(date, 'day');

                    })
                }
            })

            return {activities};

        }        
    );

}