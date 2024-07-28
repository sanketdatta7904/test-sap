const { expect } = require('@jest/globals');
const request = require('supertest');
const { v4: uuidv4 } = require('uuid');

const server = 'http://localhost:4004';

describe('Products Service', () => {
    const productName = 'New Product4'

    describe('CREATE Product', () => {

        it('should create a new product', async () => {
            const newId = uuidv4()
            const res = await request(server)
                .post('/marketplace/Products')
                .send({ Name: productName, ID: newId });
            expect(res.status).toBe(201);


        });

        it('should not create a product with an existing name', async () => {
            const res = await request(server)
                .post('/marketplace/Products')
                .send({ Name: productName, ID: uuidv4() });
            expect(res.status).toBe(400);
            expect(res.body.error.message).toBe(`Product with name \"${productName}"\ already exists.`);
        });
    });

    describe('UPDATE Product', () => {

        const productID = "12345678-1234-1234-1234-123456789a11";
        it('should update an existing product Apple', async () => {
            const res = await request(server)
                .patch(`/marketplace/Products(${productID})`)
                .send({ ID: productID, Name: 'Updated Product1' });
            expect(res.status).toBe(200);

        });

        it('should not update to a product with an existing name', async () => {
            await request(server)
                .post('/marketplace/Products')
                .send({ Name: 'Another Product', ID: productID });

            const res = await request(server)
                .patch(`/marketplace/Products(${productID})`)
                .send({ ID: productID, Name: productName });
            expect(res.status).toBe(400);
            expect(res.body.error.message).toBe(`Product with name \"${productName}"\ already exists.`);
        });
    });
});
