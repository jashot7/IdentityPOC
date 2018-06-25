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
    console.log(mnemonic.phrase)

    // Generate a private HD key from the Mnemonic.
    const HDPrivateKey = mnemonic.toHDPrivateKey();
    console.log(HDPrivateKey);



    // Generate PeerID
    const peerID = this.generatePeerId(HDPrivateKey);

    // Save State
    this.setState({
      ...this.state,
      mnemonic: mnemonic,
      seed: mnemonic ? (mnemonic.toSeed() || 'none') : 'generating',
      HDPrivateKey: HDPrivateKey,
      HDPublicKey: HDPrivateKey.hdPublicKey,
      peerID: peerID
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
        <KeyPair label='Mnemonic:' value={this.state.mnemonic.phrase}/>
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
    var mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH);
    // const mnemonicString = mnemonic.toString(); // natal hada sutil año sólido papel jamón combate aula flota ver esfera...
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

  identityFromKey(privateKey) {
    const node = new ipfs().libp2p;
    // console.log(`crypto? : ${ipfs.utils.crypto}`);
    // console.log(`crypto is: ${crypto}`);
    // // console.log(Poop.generateKeyPair.toString());
    // // console.log(`libp2p: ${libp2p}`);
    console.log(pipto.keys);
    const exKey = [1,2,3];
    var sk = pipto.keys.unmarshalPrivateKey(exKey, (sk) => {
      console.log(`thisis the unmarshaled private key:${sk}`);
    })

    const key = pipto.pbkdf2('passwordbah', 'encryptoid', 5000, 24, 'sha2-256')
      // We're only using the key once, so a fixed IV should be ok
      const iv = Buffer.from([...Array(16).keys()])
      // Create AES encryption object
      // crypto.aes.create(Buffer.from(key), iv, (err, cipher) => {
      //   if (!err) {
      //     cipher.encrypt(Buffer.from('somemessage'), async (err, encrypted) => {
      //       if (!err) {
      //         const hashed = (await ipfs.files.add(encrypted))[0]
      //         console.log(`/ipfs/${hashed.hash}`);
      //       }
      //     })
      //   }
      // })

      this.identityFromSeed('a','b');
  }

  identityFromSeed(seed, bits) {
    // HMAC Sha256 the seed using 'OpenBazaar Seed'
    const test = CryptoJS.HmacSHA256("test", "secret").toString(CryptoJS.enc.Hex);
    console.log(`test: ${test.toString()}`);
    // pipto.keys.gener
  }
}

export default App;
