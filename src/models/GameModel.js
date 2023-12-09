const mongoose = require("mongoose")
const PlayerSchema = require("./PlayerModel")

const GameModelName = "Game";

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    words:[{
        type:String,
    }],
    players:[PlayerSchema],
    isJoin:{ type:Boolean,default:true},
    isOver:{ type:Boolean,default:false},
    startTime:{type:Number},

  },
  {
    timestamps: false,
    versionKey:false,
    collection: GameModelName,
  }
);


module.exports = mongoose.model(GameModelName, GameSchema)