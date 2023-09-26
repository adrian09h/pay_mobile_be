const Web3 = require('web3');
const CryptoJS = require('crypto-js');

const web3 = new Web3('https://goerli.infura.io/v3/e91db053835c49f59387520140cd33ad');

const encryptString = (text) => {
  const key = process.env.WEB3_KEY.concat('https://');
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
};

const decryptString = (encrypted) => {
  const key = process.env.WEB3_KEY.concat('https://');
  const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
  return decrypted;
};

const createWallet = () => {
  const wallet = web3.eth.accounts.create(web3.utils.randomHex(32));
  return {
    address: wallet.address,
    privateKey: encryptString(wallet.privateKey),
  };
};

module.exports = {
  createWallet,
  encryptString,
  decryptString,
};
