function getUTCTime(localTime){
    // create a copy
    var UTC = new Date(localTime);
    
    // timezone offset in hours
    var offset = localTime.getTimezoneOffset()/60;
    console.log("offset: " + offset)
    var hour = localTime.getHours();
    console.log("hour: " + hour)

    var newHour = offset + hour;

    if (newHour > 24) {
        // advance day by 1
        UTC.setDate(localTime.getDate() + 1);
        UTC.setHours(newHour%24);
    } else if (newHour < 0) {
        // go back one day
        UTC.setDate(localTime.getDate() - 1);
        UTC.setHours((newHour+24)%24);
    } else
        UTC.setHours(newHour);

    return UTC;
}

function getLocalTime(UTCTime){
    // create a copy
    var local = new Date(UTCTime);

    // timezone offset in hours
    var offset = UTCTime.getTimezoneOffset()/60;
    console.log("offset: " + offset)
    var hour = UTCTime.getHours();
    console.log("hour: " + hour)

    var newHour = hour - offset;
    console.log("new hour: " + newHour)

    if (newHour > 24) {
        // advance day by 1
        local.setDate(UTCTime.getDate() + 1);
        local.setHours(newHour%24);
    } else if (newHour < 0) {
        // go back one day
        local.setDate(UTCTime.getDate() - 1);
        local.setHours((newHour+24)%24);
    } else
        local.setHours(newHour);

    return local;
}

// returns the later date
// if same day, returns 0
function compareDates(A, B){

    var dateA = new Date(A.getFullYear(),
                        A.getMonth(),
                        A.getDate());

    var dateB = new Date(B.getFullYear(),
                       B.getMonth(),
                       B.getDate());

    if (dateA < dateB)
        return B;
    else if (dateA > dateB)
        return A;
    else return 0;
}

function test(){
    var t = new Date(2017, 11, 15, 20, 13, 15, 3);
    console.log("original time: " + t)
    var UTCtime = getUTCTime(t);
    console.log("UTC time: " + UTCtime)
    var localTime = getLocalTime(UTCtime);
    console.log("local time: " + localTime);
    console.log(compareDates(UTCtime, localTime));
}