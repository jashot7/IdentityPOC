import React, { Component } from 'react';
import spyLogo from './images/spy.svg';
import './App.css';
import Button from './components/Button/Button';
import KeyPair from './components/KeyPair/KeyPair';
import PeerId from 'peer-id';
import multihashing from './multihashing-async';
import multihashes from './multihashes';
import * as Libp2pCrypto from 'libp2p-crypto';
import Bip39 from 'bip39';
import Bip32 from 'bip32';
import Base64 from 'base64-js';

class App extends Component {

  constructor(props) {
    super(props);

    const strGenerating = 'Generating...';

    this.state = {
      bip39Mnemonic: strGenerating,
      secretPassphrase: strGenerating,
      bip39Seed: strGenerating,
      bip32PrivateKeyBTC: strGenerating,
      bip32PublicKeyBTC: strGenerating,
      numBitsForIdentityGeneration: strGenerating,
      edd2519PrivateKey: strGenerating,
      edd2519PublicKey: strGenerating,
      peerID: strGenerating
    };

  }

  componentDidMount() {
    this.init();
  }

  init() {
    // 1. ----- Generate the Mnemonic -----

    // From BIP39 Library
    /* Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits
      of entropy Ex. 'seed sock milk update focus rotate barely fade car face mechanic mercy'
     */
    const bip39Mnemonic = Bip39.generateMnemonic()

    // 2. ----- Generate a seed from the Mnemonic using an optional secret passphrase -----
    const secretPassphrase = 'Secret Passphrase';
    const bip39Seed = Bip39.mnemonicToSeed(bip39Mnemonic, secretPassphrase);

    // 3. ----- Generate the BIP32 Keys for specific coins-----
    const bip32MasterKeyBTC = Bip32.fromSeed(bip39Seed); // Default is BITCOIN
    const bip32PrivateKeyBTC = bip32MasterKeyBTC.privateKey.toString('hex');
    const bip32PublicKeyBTC = bip32MasterKeyBTC.publicKey.toString('hex');

    // 4. ----- Generate Identity Key -----
    const numBits = 4096;
    this.identityKeyFromSeed(bip39Seed, numBits, (edd2519PrivateKey) => {
      const edd2519PublicKey = edd2519PrivateKey.public;

      this.identityFromKey(edd2519PrivateKey.bytes, (base58PrivKey, peerID) => {

        const newState = {
          ...this.state,
          bip39Mnemonic: bip39Mnemonic,
          secretPassphrase: secretPassphrase,
          bip39Seed: bip39Seed.toString('hex'),
          bip32PrivateKeyBTC: bip32PrivateKeyBTC.toString('hex'),
          bip32PublicKeyBTC: bip32PublicKeyBTC.toString('hex'),
          numBitsForIdentityGeneration: numBits,
          edd2519PrivateKey: edd2519PrivateKey.bytes.toString('hex'),
          edd2519PublicKey: edd2519PublicKey.bytes.toString('hex'),
          peerID: peerID
        }

        this.setState({...this.state, ...newState});

      });
    });
  }


  render() {
    return (
      <div className="App">
        <div className='grid-container'>
          <header className="App-header">
            <img src={spyLogo} className="App-logo" alt="logo" />
            <h1 className="App-title">Identity Proof of Concept</h1>
          </header>
          <aside><Button callback={() => this.handleGenerate()}>Re-Generate</Button></aside>
          <section>

            <div className='values-container'>
              <KeyPair label='BIP39 Mnemonic:' value={this.state.bip39Mnemonic}/>
              <KeyPair label='Secret Passphrase:' value={this.state.secretPassphrase}/>
              <KeyPair label='BIP39 Seed:' value={this.state.bip39Seed}/>
              <KeyPair label='BIP32 Public Key (BTC)' value={this.state.bip32PublicKeyBTC}/>
              <KeyPair label='BIP32 Private Key (BTC)' value={this.state.bip32PrivateKeyBTC}/>
              <KeyPair label='Bits for EDD2519 Identity Generation:' value={this.state.numBitsForIdentityGeneration}/>
              <KeyPair label='EDD2519 Private Key:' value={this.state.edd2519PrivateKey}/>
              <KeyPair label='EDD2519 Public Key:' value={this.state.edd2519PublicKey}/>
              <KeyPair label='Peer ID:' value={this.state.peerID}/>
            </div>
          </section>
          <aside><p>The user's identity (The user's identity (public and private keys, peerID) will be generated from a
series of words they should remember. Once generated, their identity data should be stored in their
local browser in a secure manner.)</p>

More Info at <a href='https://github.com/OpenBazaar/openbazaar-web/issues/4'>github issue</a></aside>
          <footer>Jason Hotelling</footer>

        </div>
      </div>
    );
  }

  handleGenerate() {
    this.init();
  }

  /*
    We need to generate an ED25519 keypair from the given seed with the given number of bits.

    HMAC (Keyed-Hash Message Authentication Code)
    a cryptographic hash that uses a key to sign a message. The receiver verifies the hash by
    recomputing it using the same key.
  */
  identityKeyFromSeed(seed, bits, cb) {

    const hash = 'SHA256'
    const hmacSeed = 'OpenBazaar seed';

    Libp2pCrypto.hmac.create(hash, Buffer.from(hmacSeed), (err, hmac) => {
      if (!err) {
        hmac.digest(Buffer.from(seed), (err, sig) => {
          if (!err) {
            Libp2pCrypto.keys.generateKeyPairFromSeed('ed25519', sig, bits, (err, privKey) => {

              // Possibly use the below to do a check/test.
              // const keyHex = '08011260499228645d120d15b5008b1da0b9dba898df328001ea03c0be84a64c41d205ff1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f1b8339a303cd8cf2945b66c89ac29fa90e79731d67000694284791af404eeb1f';

              // const encodedKey = Array.from(privKey.bytes);
              // const keyHexInBytes = this.hexToBytes(keyHex);
              // console.log(`Are they equal? ${this.arraysEqual(encodedKey, keyHexInBytes)}`);

              cb(privKey);
            })
          }
        })
      }
    })
  }

  identityFromKey(privKey, cb) {
    Libp2pCrypto.keys.unmarshalPrivateKey(privKey, (err, base58PrivKey) => {
      PeerId.createFromPubKey(base58PrivKey.public.bytes, (err, peerID) => {
        cb(Base64.fromByteArray(base58PrivKey.bytes), peerID._idB58String);
      });
    })
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
