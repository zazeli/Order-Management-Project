import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import products from "./controllers/products.js";
import orders from "./controllers/orders.js";

const app = express()

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({
    extended: false
}))

app.use('/products', products)
app.use('/orders', orders)

const init = async () => {
    try {
        mongoose.connect('mongodb://localhost/OrderManagement');
        
        app.listen(5001)

        console.log('Prisijungimas prie duomenu bazes pavyko')
    } catch(err) {
        console.log(err)
    }
} 

init()