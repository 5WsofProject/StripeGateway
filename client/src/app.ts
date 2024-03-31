import {
    Stripe,
    StripeElements,
    loadStripe,
    Appearance,
    PaymentMethod,
    SetupIntent
} from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from './ref';

(function () {
    const el = <HTMLElement>document.getElementById('payment');
    const btn = <HTMLButtonElement>document.getElementById('submit');
    const payBy = <HTMLButtonElement>document.getElementById('card-name');
    const payNow = <HTMLButtonElement>document.getElementById('pay-now');
    const customerform = <HTMLFormElement>document.getElementById('customer-form');
    const paymentform = <HTMLFormElement>document.getElementById('payment-form');
    const firstName = <HTMLInputElement>document.getElementById('first-name');
    const lastName = <HTMLInputElement>document.getElementById('last-name');
    const email = <HTMLInputElement>document.getElementById('email');
    const amount = <HTMLInputElement>document.getElementById('amount');
    const container = document.querySelector('.container');
    const dislplayCardLayout = <HTMLElement>document.getElementById('display-card-layout');
    const dislplayPaymentLayout = <HTMLElement>document.getElementById('display-payment-layout');
    const customerName = <HTMLElement>document.getElementById('customer-name');
    let customerstableBody = document.querySelector('#customersTable tbody');
    let tableBody = document.querySelector('#paymentMethodsTable tbody');
    let setUpIntentstableBody = document.querySelector('#setupIntentsTable tbody');
    let stripe: Stripe;
    let elements: StripeElements;
    var customerId = '';
    var paymentMethodId = '';

    async function load(customer: string, name : string) {
        if (!el) {
            return;
        }
 
        dislplayCardLayout.classList.remove('hide');
        customerName.textContent = name;

        // const rprom = fetch(`/api/v1/users/paymentintent`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         amount: 1500,
        //     }),
        // });
        const rprom = fetch(`/api/v1/users/setupintent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer,
            }),
        });

        stripe = await loadStripe(STRIPE_PUBLIC_KEY) as Stripe;

        const res = await rprom;
        const data = await res.json();
        const appearance: Appearance = {
            theme: 'stripe',
            variables: {
                borderRadius: '6px',
                // colorDanger: 'purple',
            },
            rules: {
                '.Input': {
                    boxShadow: 'inset 0 0 0 1px rgb(209, 213, 219)',
                    border: 'none',
                    outline: 'none',
                    padding: '0.75em 1em',
                    color: '#444',
                },
                '.Input:focus': {
                    boxShadow: 'inset 0 0 0 2px #2563eb',
                },
            },
        };

        elements = stripe?.elements({
            clientSecret: data.clientSecret,
            loader: 'auto',
            appearance,
        });

        const payEl = elements?.create('payment', {
            layout: 'tabs',
            defaultValues: {
                billingDetails: {
                    name: name   
                },
            },
        });
        payEl?.mount(el);
    }

    customerform?.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        if (!email?.value) {
            alert('Please input an email address');
            return;
        }

        const post = await fetch(`/api/v1/users/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstname: firstName?.value,
                lastname: lastName?.value,
                email: email?.value,
            }),
        });

        const resp = await post.json();

        if (resp.success) {
            // form.classList.add('hide');
            // container?.classList.remove('hide');
            // load(resp.customer);
            fetchAndDisplayCustomers();
        } else {
            alert(`Error - ${resp.error}`);
        }
    });

    btn?.addEventListener('click', async () => {
        // const sResult = await stripe?.confirmPayment({
        //     elements,
        //     redirect: 'if_required',
        //     confirmParams: {
        //         return_url: 'http://localhost:3000',
        //     },
        // });


        const sResult = await stripe?.confirmSetup({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: 'http://localhost:3000',
            },
        });

        if (!!sResult?.error) {
            // alert(sResult.error.message);
            return;
        }

        const post = await fetch(`/api/v1/users/finishsetup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                setupintent: sResult?.setupIntent?.id
                
            }),
        });

        const resp = await post.json();

        if (resp.success) {
            fetchAndDisplayPaymentMethods(customerId);
        } else {
            alert(`Error - ${resp.error}`);
        }
    });
    
    paymentform?.addEventListener('submit', async (ev) => {
        ev.preventDefault();
         CreatePayment(parseFloat(amount.value), "USD",paymentMethodId as string, customerId as string);   
    });

    async function fetchAndDisplayPaymentMethods(customerId?:string) {
        try {

            const post = await fetch(`/api/v1/users/paymentmethods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: customerId,
                }),
            });
    
            const data = await post.json();

            if (data.success) {
                const paymentMethods = data.paymentMethods as PaymentMethod[];
                
                while (tableBody?.firstChild) {
                    tableBody?.removeChild(tableBody?.firstChild);
                  }
                // Clear existing rows
                console.log(paymentMethods);
                //Populate table rows with payment methods
                paymentMethods.forEach(paymentMethod => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${paymentMethod.id}</td>
                        <td>${paymentMethod.type}</td>
                        <td>${paymentMethod?.card?.brand}</td>
                        <td>${paymentMethod?.card?.last4}</td>
                        <td><a class='add-card btn btn-sm btn-success' data-payment-id='${paymentMethod.id}' data-card-id='${paymentMethod?.card?.brand}'>Create Payment</a></td>
                    `;                   
                    tableBody?.appendChild(row);
                });

                // Add click event listeners to all buttons with class 'customer-button'
                  
                var buttons = document.querySelectorAll('.add-card');
                buttons.forEach(function(button) {
                  button.addEventListener('click', function() {
                    paymentMethodId = button.getAttribute('data-payment-id') as string;
                    console.log(paymentMethodId);
                    var cardName = button.getAttribute('data-card-id') as string;
                    dislplayPaymentLayout.classList.remove('hide');
                    payBy.textContent = cardName;
                    
                    //GetPaymentMethod();

                  });
                });
            } else {
                console.error('Failed to fetch payment methods:', data.error);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    }

    async function fetchAndDisplaySetupIntents(customerId?:string) {
        try {

            const post = await fetch(`/api/v1/users/allsetupintents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: customerId,
                }),
            });
    
            const data = await post.json();

            if (data.success) {
                const intents = data.setupintents as SetupIntent[];
                
                
                // Clear existing rows
                console.log(intents);
                //Populate table rows with payment methods
                intents.forEach(intent => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${intent.id}</td>
                        <td>${intent.client_secret}</td>
                        <td>${intent?.status}</td>
                    `;                   
                    setUpIntentstableBody?.appendChild(row);
                });
            } else {
                console.error('Failed to fetch setup intents:', data.error);
            }
        } catch (error) {
            console.error('Error fetching setupintents:', error);
        }
    }

    async function fetchAndDisplayCustomers() {
        try {
            dislplayCardLayout.classList.add('hide');
            const get = await fetch(`/api/v1/users/allcustomers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            const data = await get.json();

            if (data.success) {
                const customers = data.customers;
                while (customerstableBody?.firstChild) {
                    customerstableBody?.removeChild(customerstableBody?.firstChild);
                  }
                // Clear existing rows
                console.log(customers);
                //Populate table rows with payment methods
                for(var i= 0; i<customers.length;i++)
                {
                    const row = document.createElement('tr');
                    let name = `${customers[i].metadata["firstname"]} ${customers[i].metadata["lastname"]}` ;
                    row.innerHTML = `
                        <td>${customers[i].id}</td>
                        <td>${customers[i].email}</td>
                        <td><a class='add-card btn btn-sm btn-success' data-customer-name='${name}' data-customer-id='${customers[i].id}'>Add Card</a></td>
                    `;                   
                    customerstableBody?.appendChild(row);
                }


                  // Add click event listeners to all buttons with class 'customer-button'
                  
                    var buttons = document.querySelectorAll('.add-card');
                    buttons.forEach(function(button) {
                      button.addEventListener('click', function() {
                        var customerid = button.getAttribute('data-customer-id') as string;
                        var customerName = button.getAttribute('data-customer-name') as string;
                        customerId = customerid;
                        console.log(customerId);
                        load(customerId as string, customerName as string);
                        fetchAndDisplayPaymentMethods(customerId as string);
                      });
                    });
                  
                
            } else {
                console.error('Failed to fetch customers:', data.error);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    async function CreatePayment(amount:number, currency:string, paymentMethodId:string, customerId:string)
    {
        try
        {
            console.log(paymentMethodId+'-'+customerId);
            const result = await fetch(`/api/v1/users/paymentintent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount:amount * 100,
                    currency:currency,
                    payment_method:paymentMethodId,
                    customer:customerId,
                    return_url: 'http://localhost:3000',
                }),
            });
    
            const data = await result.json();
            console.log(data.paymentIntent);
            if(data.success)
            {
                alert('Payment done successfully');
            }
            else
            {
                alert('Error making payment: '+data.error);
            }
        }
        catch (error) {
            alert('Error making payment: '+error);
        }
        

    }

    async function GetPaymentMethod()
    {
        const post = await fetch(`/api/v1/users/getpaymentmethod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: customerId,
                paymentmethod:paymentMethodId
            }),
        });

        const data = await post.json();
        console.log(data);
    }

    fetchAndDisplayCustomers();
})();