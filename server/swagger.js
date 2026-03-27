import swaggerAutogen from 'swagger-autogen';
import { config } from 'dotenv';

config()

const PORT = process.env.PORT || 5000; // Choose your desired port

const doc = {
    info: {
        title: 'Budget Buddy Server',
        description: 'Connection APIs for products, locations, goods, and etc.',
        version: '1.0.0',
    },
    host: `localhost:${PORT}`,
    schemes: ['http', 'https'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.mjs']; // your main express file or route folder

swaggerAutogen()(outputFile, endpointsFiles, doc);
