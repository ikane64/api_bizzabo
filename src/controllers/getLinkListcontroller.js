const axios = require('axios');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');



const processPage = async (apiKey, eventId, page, filePath) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        params: {
            eventId: eventId,
            size: 200,
            page: page,
            sort: 'asc',
            filter: 'validity=valid',
        }
    };

    try {
        const response = await axios.get('https://api.bizzabo.com/api/registrations', config);
        console.log('Request status:', response.status);

        const registrations = response.data.content;

        let workbook;
        if (fs.existsSync(filePath)) {
            workbook = xlsx.readFile(filePath);
        } else {
            workbook = xlsx.utils.book_new();
        }

        let worksheet = workbook.Sheets['Registrations'];
        if (!worksheet) {
            worksheet = xlsx.utils.aoa_to_sheet([
                ['First Name', 'Last Name', 'Email', 'Ticket Type', 'Ticket ID', 'Magic Link']
            ]);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');
        }

        registrations.forEach(registration => {
            const {
                properties,
                ticketName,
                id,
                magicLink
            } = registration;
            xlsx.utils.sheet_add_aoa(worksheet, [
                [properties.firstName, properties.lastName, properties.email, ticketName, id, magicLink]
            ], {
                origin: -1
            });
        });

        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error('Error processing page:', error);
    }
};

const getRegistrations = async (req, res) => {
    const {
        apiKey,
        eventId
    } = req.body;
    const totalPages = await getPageCount(apiKey, eventId);
    let fileName;

    if (totalPages > 0) {
        fileName = await createExcelFile("magicLinks_" + eventId);
        const filePath = `../public/xls/${fileName}.xlsx`;
        const promises = [];

        for (let page = 0; page < totalPages; page++) {
            promises.push(processPage(apiKey, eventId, page, filePath));
        }

        try {
            // Wait for all promises to resolve
            await Promise.all(promises);

            // Send a response with the file link if the process is successful
            const fileLink = `/xls/${fileName}.xlsx`;
            res.json({
                fileLink
            });
        } catch (error) {
            // If an error occurs during processing, send a response with the error message
            console.error('Error processing registrations:', error);
            res.json({
                error: `Request failed. Check if API key and event ID are correct.`
            });
        }
    } else {
        // If there are no pages to process, send a response with a message indicating no registrations
        res.json({
            message: 'No registrations found. Check if the event ID is correct.'
        });
    }
};


const createExcelFile = async (filename) => {
    let newFilename = filename;
    let counter = 1;
    const xlsFolderPath = '../public/xls';

    // Check if the xls folder exists, create it if it doesn't
    if (!fs.existsSync(xlsFolderPath)) {
        fs.mkdirSync(xlsFolderPath);
    }

    // Check if the file exists
    while (fs.existsSync(path.join(xlsFolderPath, `${newFilename}.xlsx`))) {
        // If the file exists, add a counter to the filename
        newFilename = `${filename}(${counter})`;
        counter++;
    }

    return newFilename;
};

// Function for getting page count
const getPageCount = async (apiKey, eventId) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        params: {
            eventId: eventId,
            size: 200,
            sort: 'asc',
            filter: 'validity=valid',
        }
    };

    try {
        const response = await axios.get('https://api.bizzabo.com/api/registrations', config);
        const totalPages = response.data.page.totalPages;
        return totalPages;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

module.exports = {
    getRegistrations: getRegistrations,
};