const puppeteer = require('puppeteer');
const cheerio = require("cheerio");

const fetchContactInfo = async (associationNumber) => {
    const url = `https://www.guidestar.org.il/organization/${associationNumber}/contact`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        const data = await page.content();
        const $ = cheerio.load(data);
        const websiteLink = $(".malkar-contact-web .malkar-contact-section a[href^='http']").first().attr("href");
        const emailLink = $(".malkar-contact-info .malkar-contact-detail a[href^='mailto']").first().attr("href");
        //const phone = $(".malkar-contact-phone a[href^='tel']").first().text();
        const fullAddress = $(".malkar-contact-detail ng-star-inserted").first().text();
        const phoneNumbers = [];
        $(".malkar-contact-phone-num-wrapper .malkar-contact-detail.malkar-contact-phone a[href^='tel']").each((index, element) => {
            const phoneNumber = $(element).text().trim();
            if (phoneNumber) {
                phoneNumbers.push(phoneNumber);
            }
        })

        await browser.close();

        const contactInfo = {};

        if (websiteLink) contactInfo.website = websiteLink;
        if (emailLink) contactInfo.email = emailLink.replace("mailto:", "");
        if (phoneNumbers) contactInfo.phoneNumbers = phoneNumbers;
        if (fullAddress) contactInfo.address = fullAddress.replace(/\s+/g, " "); // Remove extra spaces in the address string

        return Object.keys(contactInfo).length > 0 ? contactInfo : "NO_CONTACT_INFO";

    } catch (error) {
        console.error('Error fetching association contact:', error);
        await browser.close();
        throw error;
        // await browser.close();
        // if (error.response) {
        //     // If the error is due to a bad response from axios
        //     throw { status: 500, message: 'Error fetching data from external source.' };
        // }
        // throw error; // Rethrow the original error if it's not from axios
    }
};

module.exports = { fetchContactInfo };