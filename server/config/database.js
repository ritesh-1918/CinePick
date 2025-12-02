const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!uri) {
            console.error('❌ MONGODB_URI or MONGO_URI is not defined in environment variables');
            // Return a rejected promise or null to prevent crash, but ensure we know it failed
            return Promise.reject(new Error('Missing MongoDB URI'));
        }

        const opts = {
            // bufferCommands: true, // Default is true, allowing queries to queue until connected
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log(`✅ New MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        console.error('❌ MongoDB Connection Error:', e);
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
