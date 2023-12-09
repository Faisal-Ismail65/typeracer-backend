const GameModel = require('../models/GameModel')

const createGame = async(obj)=>{
    return await GameModel.create(obj)
}

const findOneByObj = async (obj) =>{
    return await GameModel.findOne(obj)
}

const addPlayer = async(_id,nickname,socketID) =>{
    return await GameModel.findOneAndUpdate({_id},{$push:{players:{nickname,socketID}}})
}

module.exports = {
    createGame,
    findOneByObj,
    addPlayer,
}