module.exports={
    checkstatus(status){
        if(status==="completed" || status==="confirmed") return false;
        return true;
    }
}