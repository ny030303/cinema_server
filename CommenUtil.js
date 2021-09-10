exports.getNowDateToYYMMDD =  () => {
    let d = new Date();
    let fomatDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return fomatDate.replace("T", " ").slice(0, -5);
}