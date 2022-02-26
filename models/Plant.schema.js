const { Schema, model } = require('mongoose');

const plantSchema = new Schema(
  {
    plantName: {
      type: String,
      required: [true, 'Please enter de common name of the plant']
    },
    description: {
      type: String,
      required: [true, 'Please give a brief description of the plant'],
      minlength: 30,
      maxlength: 150
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    price: {
      type: Number,
      required: [true, 'Please set a price']
    },
    light: {
      type: String,
      enum: ['Sombra', 'Media Sombra', 'Sol']
    },
    location: {
      type: String,
      enum: ['Indoor', 'Outdoor']
    },
    imageUrl: String
  }
);

const Plant = model('Plant', plantSchema);
module.exports = Plant;