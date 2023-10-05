const Web3 = require('web3');
const CryptoJS = require('crypto-js');
const axios = require('axios');

const provider = process.env.WEB3_PROVIDER;
const web3 = new Web3(provider);

const encryptString = (text) => {
  const key = process.env.CRYPTO_KEY.concat('https://');
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
};

const decryptString = (encrypted) => {
  const key = process.env.CRYPTO_KEY.concat('https://');
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

const getBalance = (address) => {
  const promise = new Promise(function (resolve, reject) {
    web3.eth
      .getBalance(address)
      .then((result) => {
        const amountInETH = web3.utils.fromWei(result, 'ether');
        resolve(amountInETH);
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
};

const createTransaction = (fromAddress, toAddress, amount, isSentAll = false) => {
  // amount in Wei
  const promise = new Promise(function (resolve, reject) {
    const transaction = {
      from: fromAddress,
      to: toAddress,
      gas: web3.utils.toHex(42000),
      // value: web3.utils.toHex(web3.utils.toWei(amount, "ether"))
      // input: web3.utils.toHex('userId here'),
      value: amount,
    };

    web3.eth
      .getGasPrice()
      .then((gasPrice) => {
        const gasValue = gasPrice * 42000;
        web3.eth
          .getBalance(fromAddress)
          .then((balance) => {
            if ((isSentAll && balance < gasValue) || amount > balance - gasValue) {
              reject(new Error('not enough balance'));
            } else if (isSentAll) {
              transaction.value = web3.utils.toHex(balance - gasValue);
            }
            resolve(transaction);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
};

const sendETH = (fromAddress, toAddress, privateKey, amountETH, isSentAll = false) => {
  const amount = web3.utils.toHex(web3.utils.toWei(amountETH, 'ether'));
  // amount in Wei
  const promise = new Promise(function (resolve, reject) {
    createTransaction(fromAddress, toAddress, amount, isSentAll)
      .then((tx) => {
        web3.eth.accounts
          .signTransaction(tx, privateKey)
          .then((signedTx) => {
            // Send the transaction
            // console.log('signedTx: ', signedTx);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, txHash) {
              if (!error) {
                // console.log('Transaction hash: ', hash);
                const amountSent = web3.utils.fromWei(web3.utils.hexToNumber(tx.value).toString(), 'ether');
                resolve({ txHash, amountSent });
              } else {
                // console.log('Error: ', error);
                reject(error);
              }
            });
          })
          .catch((error) => {
            // console.log('signTransaction failed: ', error);
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
};

const getETHPriceUSD = async () => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  const response = await axios.get(url);
  return response.data.ethereum.usd;
};

const getTransactionStatus = async (txHash) => {
  const result = await web3.eth.getTransactionReceipt(txHash);
  if (result) {
    if (result.status) {
      return true;
    }
    return false;
  }
  return false;
};

module.exports = {
  createWallet,
  encryptString,
  decryptString,
  sendETH,
  getBalance,
  getETHPriceUSD,
  getTransactionStatus,
};
