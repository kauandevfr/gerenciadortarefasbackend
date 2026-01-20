const { toZonedTime } = require("date-fns-tz");

function convertToBrazilTimezone(date) {
    console.log('na função, antes:' + date)

    const timeZone = "America/Sao_Paulo";
    const zonedDate = toZonedTime(new Date(date), timeZone);

    console.log('na função, depois antes do setHours:' + zonedDate)

    zonedDate.setHours(0, 0, 0, 0);

    console.log('na função, final:' + zonedDate)
    return zonedDate;
}

module.exports = convertToBrazilTimezone;
