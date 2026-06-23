const redis = require('redis')

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: 6379
    }
});

client.on('connect', () => {
    console.log('client connected to redis')
})

client.on('ready', () => {
    console.log('redis is ready to use')
})

client.on('error', (error) => {
    console.error(error)
})

client.on('end', () => {
    console.log('Client disconnected from redis')
})

process.on('SIGINT', () => {
    client.quit()
})

client.connect()
module.exports=client

// import { createClient } from 'redis';

// const client = await createClient()
//   .on('error', err => console.log('Redis Client Error', err))
//   .connect();

// await client.set('key', 'value');
// const value = await client.get('key');
// await client.disconnect();
