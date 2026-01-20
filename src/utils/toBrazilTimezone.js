const { toZonedTime } = require("date-fns-tz");

function convertToBrazilTimezone(date) {
    const timeZone = "America/Sao_Paulo";
    const zonedDate = toZonedTime(new Date(date), timeZone);

    zonedDate.setHours(0, 0, 0, 0);
    return zonedDate;
}

module.exports = convertToBrazilTimezone;
