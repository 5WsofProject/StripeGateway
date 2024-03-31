"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_KEY, {
    apiVersion: '2023-08-16',
    typescript: true,
});
function users() {
    const router = (0, express_1.Router)();
    router
        .get('/', (req, res, next) => {
        res.json({
            id: 1,
            firstname: 'Matt',
            lastname: 'Morgan',
        });
    })
        .post('/customer', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            const p = yield stripe.customers.create({
                email: model.email,
                name: `${model.firstname} ${model.lastname}`,
                metadata: {
                    firstname: model.firstname,
                    lastname: model.lastname,
                },
            });
            res.send({
                success: true,
                customer: p.id,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .get('/allcustomers', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            const customers = yield stripe.customers.list();
            res.send({
                success: true,
                customers: customers.data,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/setupintent', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        const options = {
            automatic_payment_methods: {
                enabled: true,
            },
            // payment_method_types: [
            //     'card',
            //     'us_bank_account',
            //     'cashapp',
            //     'link'
            // ],
        };
        if (!!model.customer) {
            options.customer = model.customer;
        }
        try {
            const s = yield stripe.setupIntents.create(options);
            res.send({
                success: true,
                clientSecret: s === null || s === void 0 ? void 0 : s.client_secret,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/finishsetup', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            if (!model.setupintent) {
                throw new Error('Setup intent not found');
            }
            const si = yield stripe.setupIntents.retrieve(model.setupintent);
            if (!(si === null || si === void 0 ? void 0 : si.payment_method)) {
                throw new Error('Payment method not found');
            }
            //attach
            // if (!si.customer) {
            //     await stripe.paymentMethods.attach(<string>si.payment_method, {
            //         customer: user.stripeid,
            //     })
            // } else {
            // }
            yield stripe.customers.update(si.customer, {
                invoice_settings: {
                    default_payment_method: si.payment_method,
                },
            });
            res.send({
                success: true,
                setupintent: si
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/paymentintent', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        console.log(model);
        try {
            const p = yield stripe.paymentIntents.create({
                amount: model.amount,
                currency: 'USD',
                confirm: true,
                customer: model.customer,
                description: 'SAVED CARD PAYMENT',
                payment_method: model.payment_method,
                return_url: model.return_url,
            });
            res.send({
                success: true,
                paymentIntent: p
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/paymentmethods', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            const paymentMethods = yield stripe.paymentMethods.list({
                customer: model.customerId,
                type: 'card', // You can specify other types like 'card', 'bank_account', etc.
            });
            res.send({
                success: true,
                paymentMethods: paymentMethods.data,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/allsetupintents', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            const setupIntents = yield stripe.setupIntents.list({
                customer: model.customerId,
            });
            res.send({
                success: true,
                setupintents: setupIntents.data,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }))
        .post('/getpaymentmethod', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const model = req.body;
        try {
            const paymentMethod = yield stripe.customers.retrievePaymentMethod(model.customerId, model.paymentmethod);
            res.send({
                success: true,
                customers: paymentMethod,
            });
        }
        catch (e) {
            res.status(500).send({ success: false, error: e === null || e === void 0 ? void 0 : e.message });
        }
    }));
    return router;
}
exports.default = users;
//stripe payment_intents create --amount="100" --currency="USD" --description="(created by Stripe Shell)" --confirm="true" --payment-method="pm_1Ox0GUIY5vQiKsJ6XUB1AolW" --customer="cus_PmC1P2GWZItlqD" 
