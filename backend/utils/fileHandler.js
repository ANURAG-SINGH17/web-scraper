const fs = require("fs");

const saveToFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error("Error saving file:", error.message);
    }
};

module.exports = { saveToFile };
