import React, { Component } from 'react';
import spyLogo from './images/spy.svg';
import './App.css';
import Button from './components/Button/Button';
import KeyPair from './components/KeyPair/KeyPair';
import PeerId from 'peer-id';
import Mnemonic from 'bitcore-mnemonic';
import ipfs from 'ipfs';
import libp2p from 'libp2p';
import * as pipto from 'libp2p-crypto';
import CryptoJS from 'crypto-js';
import bip39 from 'bip39';
import bip32 from 'bip32';
import base64 from 'base64-js';

// import Crypto from 'libp2p-crypto';


class App extends Component {

  constructor(props) {
    super(props);

    const strGenerating = 'Generating...';

    this.state = {
      mnemonic: strGenerating,
      HDPrivateKey: strGenerating,
      HDPublicKey: strGenerating,
      peerId: strGenerating
    };

  }

  componentDidMount() {
    this.init();
  }

  init() {
    // Generate the Mnemonic
    const mnemonic = this.generateMnemonicUsingLibrary();

    // Generate a private HD key from the Mnemonic.
    // const HDPrivateKey = mnemonic.toHDPrivateKey();
    // console.log(HDPrivateKey);

    // Generate PeerID
    // const peerID = this.generatePeerId(HDPrivateKey);

    // const seed = bip39.mnemonicToSeedHex(mnemonic);
    const mnemonicHardcoded = 'mule track design catch stairs remain produce evidence cannon opera hamster burst';
    const seed = bip39.mnemonicToSeed(mnemonicHardcoded, "Secret Passphrase");
    const network = 'litecoin'; // 'litecoin' ||
    const bip32MasterKey = bip32.fromSeed(seed);
    console.log(`bip32Private Bitcoin: ${bip32MasterKey.privateKey.toString('hex')}`);
    console.log(`bip32Public BItcoin: ${bip32MasterKey.publicKey.toString('hex')}`);
    const node = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
    // const testSeed = "08011260499228645d120d15b5008b1da0b9dba898df328001ea03c0be84a64c41d205ff1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f";
    // var enc = new TextEncoder(); // always utf-8
    // const encodedSeed = enc.encode(testSeed);
    const bits = 4096;
    this.identityKeyFromSeed(seed, bits);

    // Save State
    this.setState({
      ...this.state,
      mnemonic: mnemonic,
       seed: seed,
      // HDPrivateKey: HDPrivateKey,
      // HDPublicKey: HDPrivateKey.hdPublicKey,
      // peerID: peerID
    })
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={spyLogo} className="App-logo" alt="logo" />
          <h1 className="App-title">Identity Proof of Concept</h1>
        </header>
        <p className="App-intro">
          <Button callback={() => this.handleGenerate()}>Re-Generate</Button>
        </p>
        <KeyPair label='Mnemonic:' value={this.state.mnemonic}/>
        <KeyPair label='Seed:' value={this.state.seed}/>
        <KeyPair label='HD Private Key:' value={this.state.HDPrivateKey.toString()}/>
        <KeyPair label='HD Public Key:' value={this.state.HDPublicKey.toString()}/>
        <KeyPair label='The ID for Thine Peer:' value={this.state.peerId}/>

        {/* State & Props Debugging */}
        <span className='state-debug'>State: {JSON.stringify(this.state)} Props: {JSON.stringify(this.props)}</span>

      </div>
    );
  }

  handleGenerate() {
    console.log('generating...');
    this.setState({mnemonic: this.generateMnemonic(), peerId: this.generatePeerId()})
  }

  generateMnemonicIanColeman() {
    return window.iancoleman.generateRandomPhrase()
  }

  generateMnemonicUsingLibrary() {
    // From Mnemonic Library (bitcore)
    // var mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH);
    // // const mnemonicString = mnemonic.toString(); // natal hada sutil año sólido papel jamón combate aula flota ver esfera...
    // return mnemonic;

    // From BIP39 Library
    // Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
    var mnemonic = bip39.generateMnemonic() // => 'seed sock milk update focus rotate barely fade car face mechanic mercy'

    bip39.mnemonicToSeedHex('basket actual')

    return mnemonic;
  }

  generatePrivateKey() {
    const privateKey = this.state.mnemonic.toHDPrivateKey()

    return privateKey
  }

  generatePeerId(privateKey) {
    console.log(`privateKey to generate peerID: ${privateKey}`);
    const that = this;
    PeerId.create({ bits: 1024 }, (err, id) => {
      if (err) { throw err }
      console.log(JSON.stringify(id.toJSON(), null, 2))
    })
    // PeerId.createFromPubKey(publicKey, (peerID) => {
    //   console.log(`peerID: ${peerID}`);
    //   that.setState({...that.state, peerID: peerID});
    // })
    // PeerId.createFromPrivKey(publicKey, (peerID) => {
    //   console.log(`peerID: ${peerID}`);
    //   that.setState({...that.state, peerID: peerID});
    // })
    // PeerId.createFromHexString(publicKey, (peerID) => {
    //   console.log(`peerID: ${peerID}`);
    //   that.setState({...that.state, peerID: peerID});
    // })

    this.identityFromKey(privateKey)

  }

  /*
    We need to generate an ED25519 keypair from the given seed with the given number of bits.

    HMAC (Keyed-Hash Message Authentication Code)
    a cryptographic hash that uses a key to sign a message. The receiver verifies the hash by
    recomputing it using the same key.
  */
  identityKeyFromSeed(seed, bits) {
    console.log('generating ED25519 keypair...');
    // const keypair = pipto.keys.generateKeyPairFromSeed('ed25519', seed, bits, (e) => {
    //   console.log('we did it');
    // })

    let hash = 'SHA256' // 'SHA256' || 'SHA512'

    pipto.hmac.create(hash, Buffer.from('OpenBazaar seed'), (err, hmac) => {
      if (!err) {
        hmac.digest(Buffer.from(seed), (err, sig) => {
          if (!err) {
            console.log(sig)
                const keypair = pipto.keys.generateKeyPairFromSeed('ed25519', sig, bits, (err, privKey) => {
                  console.log('we did it');
                  const pubKey = privKey.public;
                  console.log(`privKey: ${privKey}, pubKey: ${pubKey}`);
                  const keyHex = '08011260499228645d120d15b5008b1da0b9dba898df328001ea03c0be84a64c41d205ff1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f';
                  var enc = new TextEncoder(); // always utf-8
                  var dec = new TextDecoder();
                  // const decodedSeed = dec.decode(keyHex);
                  const encodedKey = Array.from(privKey.bytes);
                  const keyHexInBytes = this.hexToBytes(keyHex);
                  console.log(`Are they equal? ${this.arraysEqual(encodedKey, keyHexInBytes)}`);

                  this.identityFromKey(privKey.bytes);
                })
          }
        })
      }
    })
  }

  identityFromKey(privKey) {


    console.log(' ----- identityFromKey! ----- ')
    pipto.keys.unmarshalPrivateKey(privKey, (err, base58PrivKey) => {
      var identity = {privKey: '', peerID: ''};
      console.log(`base58PrivKey: ${base58PrivKey}`)

      identity.privKey = base64.fromByteArray(base58PrivKey.bytes);
      console.log(JSON.stringify(identity));

      // Do Peer ID NOW!
      const inBytes = base58PrivKey.bytes;
      const regular = base58PrivKey.public;
      const daKey = base58PrivKey.public._key;
      PeerId.createFromPubKey(base58PrivKey.public.bytes, (err, peerID) => {
        console.log(`peerID: ${peerID._idB58String}`);
        identity.peerID = peerID._idB58String;
        // that.setState({...that.state, peerID: peerID});
        console.log(JSON.stringify(identity));
      });
    })
    // const node = new ipfs().libp2p;
    // // console.log(`crypto? : ${ipfs.utils.crypto}`);
    // // console.log(`crypto is: ${crypto}`);
    // // // console.log(Poop.generateKeyPair.toString());
    // // // console.log(`libp2p: ${libp2p}`);
    // console.log(pipto.keys);
    // const exKey = [1,2,3];
    // var sk = pipto.keys.unmarshalPrivateKey(exKey, (sk) => {
    //   console.log(`thisis the unmarshaled private key:${sk}`);
    // })

    // const key = pipto.pbkdf2('passwordbah', 'encryptoid', 5000, 24, 'sha2-256')
    //   // We're only using the key once, so a fixed IV should be ok
    //   const iv = Buffer.from([...Array(16).keys()])
    //   // Create AES encryption object
    //   // crypto.aes.create(Buffer.from(key), iv, (err, cipher) => {
    //   //   if (!err) {
    //   //     cipher.encrypt(Buffer.from('somemessage'), async (err, encrypted) => {
    //   //       if (!err) {
    //   //         const hashed = (await ipfs.files.add(encrypted))[0]
    //   //         console.log(`/ipfs/${hashed.hash}`);
    //   //       }
    //   //     })
    //   //   }
    //   // })

    //   this.identityFromSeed('a','b');


  }

  identityFromSeed(seed, bits) {
    // HMAC Sha256 the seed using 'OpenBazaar Seed'
    const test = CryptoJS.HmacSHA256("test", "secret").toString(CryptoJS.enc.Hex);
    console.log(`test: ${test.toString()}`);
    // pipto.keys.gener
  }

  // Convert a hex string to a byte array
  hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  }

  // Convert a byte array to a hex string
  bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
  }

  arraysEqual(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

  }
}

export default App;
