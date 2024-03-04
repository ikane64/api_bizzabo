const axios = require('axios');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExportMagicLinkListService {
    constructor(apiKey, eventId) {
        this.apiKey = apiKey;
        this.eventId = eventId;
        this.baseUrl = 'https://api.bizzabo.com/api/registrations';
    }

    async getPageCount() {
        const config = this.getConfig({
            eventId: this.eventId,
            size: 200,
            sort: 'asc',
            filter: 'validity=valid',
        });
    
        try {
            const response = await axios.get(this.baseUrl, config);
            if (response.status === 200 && response.data.page) {
                return response.data.page.totalPages;
            } else {
                return null;  // Return null if the response is not as expected
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
            return null;  // Return null in case of an error
        }
    }

    async processPage(page, filePath) {
        const config = this.getConfig({
            eventId: this.eventId,
            size: 200,
            page: page,
            sort: 'asc',
            filter: 'validity=valid',
        });

        try {
            const response = await axios.get(this.baseUrl, config);
            console.log('Request status:', response.status);

            const registrations = response.data.content;
            ExcelFileService.appendRegistrationsToSheet(filePath, registrations);
        } catch (error) {
            console.error('Error processing page:', error);
            throw error;
        }
    }

    getConfig(params) {
        return {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            params: params
        };
    }
}

class ExcelFileService {
    static appendRegistrationsToSheet(filePath, registrations) {
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
            const { properties, ticketName, id, magicLink } = registration;
            xlsx.utils.sheet_add_aoa(worksheet, [
                [properties.firstName, properties.lastName, properties.email, ticketName, id, magicLink]
            ], { origin: -1 });
        });

        xlsx.writeFile(workbook, filePath);
    }

    static createExcelFile(filename, directory) {
        let newFilename = filename;
        let counter = 1;

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        while (fs.existsSync(path.join(directory, `${newFilename}.xlsx`))) {
            newFilename = `${filename}(${counter})`;
            counter++;
        }

        return newFilename;
    }
}

const exportMagicLinkList = async (req, res) => {
    const { apiKey, eventId } = req.body;
    const registrationService = new ExportMagicLinkListService(apiKey, eventId);
    const totalPages = await registrationService.getPageCount();

    if (totalPages > 0) {
        // Proceed with processing if totalPages is valid
        let fileName = ExcelFileService.createExcelFile(`magicLinks_${eventId}`, path.join(__dirname, '..', 'public', 'xls'));
        const filePath = path.join(__dirname, '..', '..', 'public', 'xls', `${fileName}.xlsx`);
        const promises = [];

        for (let page = 0; page < totalPages; page++) {
            promises.push(registrationService.processPage(page, filePath));
        }

        try {
            await Promise.all(promises);
            const fileLink = `/xls/${fileName}.xlsx`;
            res.json({ fileLink });
        } catch (error) {
            console.error('Error processing registrations:', error);
            res.status(500).json({ error: 'Error processing registrations. Please try again later.' });
        }
    } else {
        res.json({ message: 'No registrations found. Check if the event ID is correct.' });
    }
};


module.exports = {
    exportMagicLinkList,
};
