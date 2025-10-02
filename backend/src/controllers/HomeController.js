

function HomeMessage(req,res){
    res.send('This is home page message');
}

function AboutMessage(req,res){
    res.send('This is about page message');
}
module.exports = {HomeMessage,AboutMessage};