const mongoose = require('mongoose');

const sessionsSchema = new mongoose.Schema({
    subject: {type: String, required: true},
    date: {type: Date, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    building: {type: String, enum: ['Hillman Library', 'Posvar Hall', 'Cathedral of Learning', 'Information Science Building', 
        'Sennot Square', 'William Pitt Union', 'Clapp Hall'], required: true},
    room: {type: Number, required: true},
    hostedBy: {type: String, required: true},
    additionalNotes: {type: String}
});

module.exports = mongoose.model('Session', sessionsSchema);