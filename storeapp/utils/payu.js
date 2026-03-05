const crypto = require("crypto");

const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const SALT = process.env.PAYU_SALT;
const MODE = process.env.PAYU_MODE || "test";

const PAYU_BASE_URL = MODE === "test"
  ? "https://test.payu.in/_payment"
  : "https://secure.payu.in/_payment";

const generateHash = (params) => {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${SALT}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

const createPaymentParams = (store, plan) => {
  const planPrices = {
    "1month": 499,
    "3months": 1299,
    "6months": 2399,
    "1year": 4299
  };

  const txnid = `TXN_${store._id}_${Date.now()}`;
  const amount = planPrices[plan];
  const productinfo = `Kirana SaaS ${plan} Subscription`;
  const firstname = store.name;
  const email = store.email;

  const params = {
    key: MERCHANT_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    surl: `http://localhost:5000/api/payment/success`,
    furl: `http://localhost:5000/api/payment/failure`,
  };

  params.hash = generateHash(params);
  params.action = PAYU_BASE_URL;

  return params;
};

module.exports = { createPaymentParams };