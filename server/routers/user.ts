import { Router } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY as string, {
    apiVersion: '2023-08-16',
    typescript: true,
});

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/customer', async (req, res, next) => {
            const model = req.body;

            try {
                const p = await stripe.customers.create({
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
            } catch(e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .get('/allcustomers', async (req, res, next) => {
            const model = req.body;

            try {
                const customers = await stripe.customers.list();
                
                res.send({
                    success: true,
                    customers: customers.data,
                });
            } catch (e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/setupintent', async (req, res, next) => {
            const model = req.body;
            const options: Stripe.SetupIntentCreateParams = {
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
                const s = await stripe.setupIntents.create(options);

                res.send({
                    success: true,
                    clientSecret: s?.client_secret,
                });
            } catch(e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/finishsetup', async (req, res, next) => {
            const model = req.body;

            try {
                if (!model.setupintent) {
                    throw new Error('Setup intent not found');
                }

                const si = await stripe.setupIntents.retrieve(model.setupintent);

                if (!si?.payment_method) {
                    throw new Error('Payment method not found');
                }

                //attach
                // if (!si.customer) {
                //     await stripe.paymentMethods.attach(<string>si.payment_method, {
                //         customer: user.stripeid,
                //     })
                // } else {

                // }

                await stripe.customers.update(<string>si.customer, {
                    invoice_settings: {
                        default_payment_method: <string>si.payment_method,
                    },
                });

                res.send({
                    success: true,
                    setupintent: si
                });
            } catch(e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/paymentintent', async (req, res, next) => {
            const model = req.body;
            console.log(model);
            try {


                const p = await stripe.paymentIntents.create({
                    amount: model.amount,
                    currency:'USD',
                    confirm:true,
                    customer: model.customer,
                    description:'SAVED CARD PAYMENT',
                    payment_method:model.payment_method,
                    return_url: model.return_url,
                    
                });

                res.send({
                    success: true,
                    paymentIntent:p
                });
            } catch(e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/paymentmethods', async (req, res, next) => {
            const model = req.body;

            try {
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: model.customerId,
                    type: 'card', // You can specify other types like 'card', 'bank_account', etc.
                });
        
                res.send({
                    success: true,
                    paymentMethods: paymentMethods.data,
                });
            } catch (e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/allsetupintents', async (req, res, next) => {
            const model = req.body;

            try {
                const setupIntents = await stripe.setupIntents.list({
                    customer: model.customerId,
                  });
        
                res.send({
                    success: true,
                    setupintents: setupIntents.data,
                });
            } catch (e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        .post('/getpaymentmethod', async (req, res, next) => {
            const model = req.body;

            try {
                const paymentMethod = await stripe.customers.retrievePaymentMethod(
                    model.customerId,
                    model.paymentmethod
                  );
                
                res.send({
                    success: true,
                    customers: paymentMethod,
                });
            } catch (e) {
                res.status(500).send({ success: false, error: (<Error>e)?.message });
            }
        })
        ;

    return router;
}

//stripe payment_intents create --amount="100" --currency="USD" --description="(created by Stripe Shell)" --confirm="true" --payment-method="pm_1Ox0GUIY5vQiKsJ6XUB1AolW" --customer="cus_PmC1P2GWZItlqD" 