import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrip } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { conformTrip } from "./routes/confirm-trip";

const app = fastify();

app.register(cors,{
    origin : '*',
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(conformTrip);

app.listen({port: 3333}).then(() => {
    console.log("Server is running on port 3333");
});