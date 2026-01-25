const office = require("../models/Office");
const company = require("../models/Company");

const companyName = "Speedier";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

async function calculatePackagePrice(weight, origin, destination) {
    const c = await company.findOne({name: companyName});
    if (!c) {
        return 0;
    }

    const originOffice = await office.findOne({address: origin});
    let priceIncreaseFromAddress = 0;
    if (!originOffice) {
        priceIncreaseFromAddress = c.priceFromAddress;
    }

    let destinationPrice = 0;
    const destinationOffice = await office.findOne({address: destination});
    if (destinationOffice) {
        destinationPrice = c.priceToOffice;
    } else {
        destinationPrice = c.priceToAddress;
    }

    let weightPrice = c.pricePerKg * weight;
    weightPrice = roundToTwo(weightPrice);

    return (priceIncreaseFromAddress + destinationPrice + weightPrice);
}

module.exports = calculatePackagePrice;