import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrip } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { conformTrip } from "./routes/confirm-trip";
import { conformParticipant } from "./routes/confirm-participant";
import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLink } from "./routes/get-links";

const app = fastify();

app.register(cors,{
    origin : '*',
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(conformTrip);
app.register(conformParticipant);
app.register(createActivity);  
app.register(getActivities);
app.register(createLink);
app.register(getLink);

app.listen({port: 3333}).then(() => {
    console.log("Server is running on port 3333");
});
