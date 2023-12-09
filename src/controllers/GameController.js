const axios = require('axios')
const mongoose = require('mongoose')
const GameRepo = require('../repositories/GameRepo')

const getSentence = async() =>{
    try{
        const response = await axios.get('https://api.quotable.io/random')
        return response.data.content.split(' ')

    }catch(err){
        console.log(err)
    }
}

const createGame = async(nickname,socketID)=>{
    try{
        const words = await getSentence()
        let players = [{
            socketID,
            nickname,
            isPartyLeader:true,

        }]
        
        const Game = await GameRepo.createGame({words,players})
        return Game
    }catch(err){
        console.log(err)
    }

}

const joinGame = async(gameID,nickname,socketID)=>{
    try{

        let Game = await GameRepo.findOneByObj({_id:gameID})
       
        if(Game.isJoin){
            const id = Game._id.toString()
             Game =   await GameRepo.addPlayer(id,nickname,socketID)
             return Game
        }

         
    }catch(err){
        console.log(err)
    }
}


const findPlayer = async (playerID,gameID)=>{
    try{

        const Game = await GameRepo.findOneByObj({_id:gameID})

        const Player = Game.players.id(playerID)

        console.log(Player)

       return Player


    
        


    }catch(err){
        console.log(err)
    }
}


module.exports = {
    createGame,
    joinGame,
    findPlayer,
}