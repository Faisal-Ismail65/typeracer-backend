const mongoose = require("mongoose");

const PlayerModelName = "Player";

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    nickname:{type:String},
    currentWordIndex:{type:Number,default:0},
    WPM:{type:Number,default:-1},
    socketID:{type:String},
    isPartyLeader:{type:Boolean,default:false},

  },
  {
    versionKey:false,
    timestamps: false,
    collection: PlayerModelName,
  }
);


module.exports = PlayerSchema
// module.exports = mongoose.model(PlayerModelName, PlayerSchema)