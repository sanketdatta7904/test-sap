const cds = require('@sap/cds')

module.exports = async function () {
    this.on('CREATE', `Products`, async (req, next) => {
        const { Name } = req.data;

        try {
            // Check if a product with the same name already exists
            const existingProducts = await cds.transaction(req).run(
                SELECT.from('sap_ui5_marketplace_Products').where({ Name })
            );

            if (existingProducts.length > 0) {
                throw new Error(`Product with name "${Name}" already exists.`);
            }

            console.log('Creating Product:', req.data);
            return next();
        } catch (error) {
            console.error(error.message);
            return req.reject(400, error.message);
        }
    });

    this.on('UPDATE', 'Products', async (req, next) => {

        const { Name } = req.data;
        const id = req.params[0]
        try {
            const existingProducts = await cds.transaction(req).run(
                SELECT.from('sap_ui5_marketplace_Products').where({ Name: Name, ID: { '!=': id } })
            );

            if (existingProducts.length > 0) {
                throw new Error(`Product with name "${Name}" already exists.`);
            }

            console.log('Updating Product:', req.data);
            return next();
        } catch (error) {
            console.error(error.message);
            return req.reject(400, error.message);
        }
    });
}
