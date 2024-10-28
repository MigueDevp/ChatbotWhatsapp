const { MongoClient } = require('mongodb');

const connectDB = async () => {
    try {
        const url = 'mongodb://localhost:27017/cotizaciones';
        const client = await MongoClient.connect(url);
        console.log('Connected successfully to MongoDB');
        return client.db();
        
    } catch (error) {
        console.log(error);
    }
};

module.exports = { connectDB };
