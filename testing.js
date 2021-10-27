let ed = require("noble-ed25519");
// if you're using single file, use global variable nobleEd25519

const privateKey = ed.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
const msgHash = 'lelelelee';
(async () => {
  const publicKey = await ed.getPublicKey(privateKey);
  const signature = await ed.sign(msgHash, privateKey);
  const isSigned = await ed.verify(signature, msgHash, publicKey);
  console.log(isSigned);
})();
