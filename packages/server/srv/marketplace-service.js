const cds = require('@sap/cds')

// https://cap.cloud.sap/docs/guides/providing-services#registering-event-handlers
module.exports = function () {
    this.on('CREATE', `Products`, (req, next) => {
        // Here you can modify req object
        console.log(req.data)
        return next();
    });

    this.on('UPDATE', 'Products', (req, next) => {
        console.log('Updating Product:', req.data);
        return next();
    });
}
