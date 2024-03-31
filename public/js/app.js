(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./src/app");

},{"./src/app":2}],2:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_js_1 = require("@stripe/stripe-js");
const ref_1 = require("./ref");
(function () {
    const el = document.getElementById('payment');
    const btn = document.getElementById('submit');
    const payBy = document.getElementById('card-name');
    const payNow = document.getElementById('pay-now');
    const customerform = document.getElementById('customer-form');
    const paymentform = document.getElementById('payment-form');
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const amount = document.getElementById('amount');
    const container = document.querySelector('.container');
    const dislplayCardLayout = document.getElementById('display-card-layout');
    const dislplayPaymentLayout = document.getElementById('display-payment-layout');
    const customerName = document.getElementById('customer-name');
    let customerstableBody = document.querySelector('#customersTable tbody');
    let tableBody = document.querySelector('#paymentMethodsTable tbody');
    let setUpIntentstableBody = document.querySelector('#setupIntentsTable tbody');
    let stripe;
    let elements;
    var customerId = '';
    var paymentMethodId = '';
    function load(customer, name) {
        return __awaiter(this, void 0, void 0, function* () {
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
            stripe = (yield (0, stripe_js_1.loadStripe)(ref_1.STRIPE_PUBLIC_KEY));
            const res = yield rprom;
            const data = yield res.json();
            const appearance = {
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
            elements = stripe === null || stripe === void 0 ? void 0 : stripe.elements({
                clientSecret: data.clientSecret,
                loader: 'auto',
                appearance,
            });
            const payEl = elements === null || elements === void 0 ? void 0 : elements.create('payment', {
                layout: 'tabs',
                defaultValues: {
                    billingDetails: {
                        name: name
                    },
                },
            });
            payEl === null || payEl === void 0 ? void 0 : payEl.mount(el);
        });
    }
    customerform === null || customerform === void 0 ? void 0 : customerform.addEventListener('submit', (ev) => __awaiter(this, void 0, void 0, function* () {
        ev.preventDefault();
        if (!(email === null || email === void 0 ? void 0 : email.value)) {
            alert('Please input an email address');
            return;
        }
        const post = yield fetch(`/api/v1/users/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstname: firstName === null || firstName === void 0 ? void 0 : firstName.value,
                lastname: lastName === null || lastName === void 0 ? void 0 : lastName.value,
                email: email === null || email === void 0 ? void 0 : email.value,
            }),
        });
        const resp = yield post.json();
        if (resp.success) {
            // form.classList.add('hide');
            // container?.classList.remove('hide');
            // load(resp.customer);
            fetchAndDisplayCustomers();
        }
        else {
            alert(`Error - ${resp.error}`);
        }
    }));
    btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        // const sResult = await stripe?.confirmPayment({
        //     elements,
        //     redirect: 'if_required',
        //     confirmParams: {
        //         return_url: 'http://localhost:3000',
        //     },
        // });
        var _a;
        const sResult = yield (stripe === null || stripe === void 0 ? void 0 : stripe.confirmSetup({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: 'http://localhost:3000',
            },
        }));
        if (!!(sResult === null || sResult === void 0 ? void 0 : sResult.error)) {
            // alert(sResult.error.message);
            return;
        }
        const post = yield fetch(`/api/v1/users/finishsetup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                setupintent: (_a = sResult === null || sResult === void 0 ? void 0 : sResult.setupIntent) === null || _a === void 0 ? void 0 : _a.id
            }),
        });
        const resp = yield post.json();
        if (resp.success) {
            fetchAndDisplayPaymentMethods();
        }
        else {
            alert(`Error - ${resp.error}`);
        }
    }));
    paymentform === null || paymentform === void 0 ? void 0 : paymentform.addEventListener('submit', (ev) => __awaiter(this, void 0, void 0, function* () {
        ev.preventDefault();
        CreatePayment(parseFloat(amount.value), "USD", paymentMethodId, customerId);
    }));
    function fetchAndDisplayPaymentMethods(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield fetch(`/api/v1/users/paymentmethods`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerId: customerId,
                    }),
                });
                const data = yield post.json();
                if (data.success) {
                    const paymentMethods = data.paymentMethods;
                    while (tableBody === null || tableBody === void 0 ? void 0 : tableBody.firstChild) {
                        tableBody === null || tableBody === void 0 ? void 0 : tableBody.removeChild(tableBody === null || tableBody === void 0 ? void 0 : tableBody.firstChild);
                    }
                    // Clear existing rows
                    console.log(paymentMethods);
                    //Populate table rows with payment methods
                    paymentMethods.forEach(paymentMethod => {
                        var _a, _b, _c;
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${paymentMethod.id}</td>
                        <td>${paymentMethod.type}</td>
                        <td>${(_a = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.card) === null || _a === void 0 ? void 0 : _a.brand}</td>
                        <td>${(_b = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.card) === null || _b === void 0 ? void 0 : _b.last4}</td>
                        <td><a class='add-card btn btn-sm btn-success' data-payment-id='${paymentMethod.id}' data-card-id='${(_c = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.card) === null || _c === void 0 ? void 0 : _c.brand}'>Create Payment</a></td>
                    `;
                        tableBody === null || tableBody === void 0 ? void 0 : tableBody.appendChild(row);
                    });
                    // Add click event listeners to all buttons with class 'customer-button'
                    var buttons = document.querySelectorAll('.add-card');
                    buttons.forEach(function (button) {
                        button.addEventListener('click', function () {
                            paymentMethodId = button.getAttribute('data-payment-id');
                            console.log(paymentMethodId);
                            var cardName = button.getAttribute('data-card-id');
                            dislplayPaymentLayout.classList.remove('hide');
                            payBy.textContent = cardName;
                            //GetPaymentMethod();
                        });
                    });
                }
                else {
                    console.error('Failed to fetch payment methods:', data.error);
                }
            }
            catch (error) {
                console.error('Error fetching payment methods:', error);
            }
        });
    }
    function fetchAndDisplaySetupIntents(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield fetch(`/api/v1/users/allsetupintents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerId: customerId,
                    }),
                });
                const data = yield post.json();
                if (data.success) {
                    const intents = data.setupintents;
                    // Clear existing rows
                    console.log(intents);
                    //Populate table rows with payment methods
                    intents.forEach(intent => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${intent.id}</td>
                        <td>${intent.client_secret}</td>
                        <td>${intent === null || intent === void 0 ? void 0 : intent.status}</td>
                    `;
                        setUpIntentstableBody === null || setUpIntentstableBody === void 0 ? void 0 : setUpIntentstableBody.appendChild(row);
                    });
                }
                else {
                    console.error('Failed to fetch setup intents:', data.error);
                }
            }
            catch (error) {
                console.error('Error fetching setupintents:', error);
            }
        });
    }
    function fetchAndDisplayCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                dislplayCardLayout.classList.add('hide');
                const get = yield fetch(`/api/v1/users/allcustomers`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = yield get.json();
                if (data.success) {
                    const customers = data.customers;
                    while (customerstableBody === null || customerstableBody === void 0 ? void 0 : customerstableBody.firstChild) {
                        customerstableBody === null || customerstableBody === void 0 ? void 0 : customerstableBody.removeChild(customerstableBody === null || customerstableBody === void 0 ? void 0 : customerstableBody.firstChild);
                    }
                    // Clear existing rows
                    console.log(customers);
                    //Populate table rows with payment methods
                    for (var i = 0; i < customers.length; i++) {
                        const row = document.createElement('tr');
                        let name = `${customers[i].metadata["firstname"]} ${customers[i].metadata["lastname"]}`;
                        row.innerHTML = `
                        <td>${customers[i].id}</td>
                        <td>${customers[i].email}</td>
                        <td><a class='add-card btn btn-sm btn-success' data-customer-name='${name}' data-customer-id='${customers[i].id}'>Add Card</a></td>
                    `;
                        customerstableBody === null || customerstableBody === void 0 ? void 0 : customerstableBody.appendChild(row);
                    }
                    // Add click event listeners to all buttons with class 'customer-button'
                    var buttons = document.querySelectorAll('.add-card');
                    buttons.forEach(function (button) {
                        button.addEventListener('click', function () {
                            var customerid = button.getAttribute('data-customer-id');
                            var customerName = button.getAttribute('data-customer-name');
                            customerId = customerid;
                            console.log(customerId);
                            load(customerId, customerName);
                            fetchAndDisplayPaymentMethods(customerId);
                        });
                    });
                }
                else {
                    console.error('Failed to fetch customers:', data.error);
                }
            }
            catch (error) {
                console.error('Error fetching customers:', error);
            }
        });
    }
    function CreatePayment(amount, currency, paymentMethodId, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(paymentMethodId + '-' + customerId);
                const result = yield fetch(`/api/v1/users/paymentintent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount * 100,
                        currency: currency,
                        payment_method: paymentMethodId,
                        customer: customerId,
                        return_url: 'http://localhost:3000',
                    }),
                });
                const data = yield result.json();
                console.log(data.paymentIntent);
                if (data.success) {
                    alert('Payment done successfully');
                }
                else {
                    alert('Error making payment: ' + data.error);
                }
            }
            catch (error) {
                alert('Error making payment: ' + error);
            }
        });
    }
    function GetPaymentMethod() {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield fetch(`/api/v1/users/getpaymentmethod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: customerId,
                    paymentmethod: paymentMethodId
                }),
            });
            const data = yield post.json();
            console.log(data);
        });
    }
    fetchAndDisplayCustomers();
})();

},{"./ref":3,"@stripe/stripe-js":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_PUBLIC_KEY = void 0;
exports.STRIPE_PUBLIC_KEY = 'pk_test_51HlqVDIY5vQiKsJ6L38hZbgLLdvVjZF6BdAZ0HznCan9305R251TZaE3X3dLsYVyJ0qAXHXEbhsrz5kbUf1fU0v800yZvfwSUK';

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var V3_URL = 'https://js.stripe.com/v3';
var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
var EXISTING_SCRIPT_MESSAGE = 'loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used';
var findScript = function findScript() {
  var scripts = document.querySelectorAll("script[src^=\"".concat(V3_URL, "\"]"));

  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];

    if (!V3_URL_REGEX.test(script.src)) {
      continue;
    }

    return script;
  }

  return null;
};

var injectScript = function injectScript(params) {
  var queryString = params && !params.advancedFraudSignals ? '?advancedFraudSignals=false' : '';
  var script = document.createElement('script');
  script.src = "".concat(V3_URL).concat(queryString);
  var headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error('Expected document.body not to be null. Stripe.js requires a <body> element.');
  }

  headOrBody.appendChild(script);
  return script;
};

var registerWrapper = function registerWrapper(stripe, startTime) {
  if (!stripe || !stripe._registerWrapper) {
    return;
  }

  stripe._registerWrapper({
    name: 'stripe-js',
    version: "2.1.6",
    startTime: startTime
  });
};

var stripePromise = null;
var loadScript = function loadScript(params) {
  // Ensure that we only attempt to load Stripe.js at most once
  if (stripePromise !== null) {
    return stripePromise;
  }

  stripePromise = new Promise(function (resolve, reject) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    if (window.Stripe && params) {
      console.warn(EXISTING_SCRIPT_MESSAGE);
    }

    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    try {
      var script = findScript();

      if (script && params) {
        console.warn(EXISTING_SCRIPT_MESSAGE);
      } else if (!script) {
        script = injectScript(params);
      }

      script.addEventListener('load', function () {
        if (window.Stripe) {
          resolve(window.Stripe);
        } else {
          reject(new Error('Stripe.js not available'));
        }
      });
      script.addEventListener('error', function () {
        reject(new Error('Failed to load Stripe.js'));
      });
    } catch (error) {
      reject(error);
      return;
    }
  });
  return stripePromise;
};
var initStripe = function initStripe(maybeStripe, args, startTime) {
  if (maybeStripe === null) {
    return null;
  }

  var stripe = maybeStripe.apply(undefined, args);
  registerWrapper(stripe, startTime);
  return stripe;
}; // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

// own script injection.

var stripePromise$1 = Promise.resolve().then(function () {
  return loadScript(null);
});
var loadCalled = false;
stripePromise$1["catch"](function (err) {
  if (!loadCalled) {
    console.warn(err);
  }
});
var loadStripe = function loadStripe() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  loadCalled = true;
  var startTime = Date.now();
  return stripePromise$1.then(function (maybeStripe) {
    return initStripe(maybeStripe, args, startTime);
  });
};

exports.loadStripe = loadStripe;

},{}]},{},[1]);
