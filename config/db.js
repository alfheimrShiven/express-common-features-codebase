const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });
    console.log(
        colors.cyan.underline.bold(
            'Connected with mongoDB with host:' + conn.connection.host
        )
    );
};

module.exports = connectDB;