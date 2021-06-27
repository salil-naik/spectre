
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import axios from 'axios';

import UserWallet from './userWallet.jsx';

import "../css/wallet.css"

import AES from "crypto-js/aes";
import {enc} from "crypto-js";


import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useHistory
  } from "react-router-dom";

// Need to add edge case for Mneumonic string

const VerifyWallet = (props) => {

    const checkMnemonic = () => {
        if(document.getElementById('verify-mnemonic').value.trim() === props.mnemonic) {

            const key = document.getElementById('add-wallet-password').value;
            const m = props.mnemonic;

            console.log("Verified!")
            props.setupWallet();
            props.setVerified(true);

            
            const encrypted = AES.encrypt( JSON.stringify({ m }), key.trim()).toString();
            localStorage.setItem('project_v_w', encrypted);
        }

        else {
            console.log("Please try again.");
        }
    }

    return(
        <div>
            <label htmlFor="verify-mnemonic"> Verify Mnemonic </label>
            <input id="verify-mnemonic" type="text" />
            <br />
            <label htmlFor="add-wallet-password"> Add a wallet password </label>
            <input id="add-wallet-password" type="text" />
            <br />
            <Link onClick={checkMnemonic} to="/wallet"> <button> Verify </button> </Link>

        </div>
    )
}

const ImportWallet = (props) => {

    const checkMnemonic = () => {
            let mnemonic = document.getElementById('import-mnemonic').value.trim();

            props.setMnemonic(mnemonic)

            const key = document.getElementById('import-wallet-password').value.trim();
            const m = props.mnemonic;

            console.log("Verified!")
            props.setupWallet();
            props.setVerified(true);

            console.log(m, key);

            const encrypted = AES.encrypt( JSON.stringify({ m }), key).toString();
            localStorage.setItem('project_v_w', encrypted);
    }

    return(
        <div>
            <label htmlFor="import-mnemonic" onChange={(e) => {props.setMnemonic(e.target.value)}}> Import Mnemonic </label>
            <input id="import-mnemonic" type="text"/>
            <br />
            <label htmlFor="import-wallet-password"> Add a wallet password </label>
            <input id="import-wallet-password" />
            <br />
            <Link onClick={checkMnemonic} to="/wallet"> <button> Verify </button> </Link>

        </div>
    )
}


function Wallet(props) {

    let history = useHistory();

    const [mnemonic, setMnemonic] = useState(null);
    const [address, setAddress] = useState([]);
    const [verified, setVerified] = useState(false);
    const [selectedAddress, SetSelectedAddress] = useState();
    // Default is Kovan
    const [network, SetNetwork] = useState(props.network.kovan.rpc);
    const [chainID, SetChainID] = useState(props.network.kovan.chainID);
    const [balances, setBalances] = useState([]);



    const createWallet = () => {
        const wallet = ethers.Wallet.createRandom();
        setMnemonic(wallet.mnemonic.phrase);

        const otherModal = document.getElementsByClassName('import-wallet-modal')[0];
        otherModal.style.display = "none";
        const modal = document.getElementsByClassName('create-wallet-modal')[0];
        modal.style.display = "grid";
        modal.style.justifyContent = "center";
        modal.style.justifyContent = "center";

    }

    const importWallet = () => {
        const otherModal = document.getElementsByClassName('create-wallet-modal')[0];
        otherModal.style.display = "none";
        const modal = document.getElementsByClassName('import-wallet-modal')[0];
        modal.style.display = "grid";
        modal.style.justifyContent = "center";
        modal.style.justifyContent = "center";
    }
    
    const setupWallet = () => {
        // To fetch first address generated by Mneumonic 
        const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);

        setAddress(arr => [...arr, {
            address : walletMnemonic.address,
            privateKey : walletMnemonic.privateKey
        }])

    }

    const addNewAddress = () => {

        const number = address.length;
        console.log(number);
        console.log(mnemonic);

        const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${number}`);

        setAddress(arr => [...arr, {
            address : walletMnemonic.address,
            privateKey : walletMnemonic.privateKey
        }])
    }

    // const getBalance = () => {
    //     let networkChosen = props.network;

    //     console.log(currentAddressChosen);
    
    //     const provider = new ethers.providers.JsonRpcProvider(networkChosen);
    //     // console.log(chainID);
    //     axios.get(`https://project-v.salilnaik.repl.co/TokenBalances/address/${currentAddressChosen}/chain/${chainID}/`)
    //         .then(result => {
    //             console.log(result.data.tokens);
    //             setBalances(result.data.tokens)
    //         })
    //         .catch(err => console.log(err));
    // }

    const changeNetwork = (input) => {
        switch(input) {
            case "kovan":
                SetNetwork(props.network.kovan.rpc);
                SetChainID(props.network.kovan.chainID);
                break;

            case "ethereum":
                SetNetwork(props.network.ethereumMainnet.rpc);
                SetChainID(props.network.ethereumMainnet.chainID);
                break;
            
            case "fantom-testnet":
                SetNetwork(props.network.fantomTestnet.rpc)
                SetChainID(props.network.fantomTestnet.chainID);
                break;

            case "fantom-mainnet":
                SetNetwork(props.network.fantomMainnet.rpc);
                SetChainID(props.network.fantomMainnet.chainID);
                break;
        }
    }

    const unlockWallet = () => {
        let password = document.getElementById('wallet-password').value.trim();
        let encrypted = localStorage.getItem('project_v_w');
        const decrypted = AES.decrypt(encrypted, password);
        console.log(decrypted);

        try {
            let decryptedText = decrypted.toString(enc.Utf8);
            let finalDecryptedText = JSON.parse(decryptedText)
            // var originalText = bytes.toString();
            let mnemonic = finalDecryptedText.m;
            // console.log(history);
            setVerified(true);

            setMnemonic(mnemonic)

            const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);

            setAddress(arr => [...arr, {
                address : walletMnemonic.address,
                privateKey : walletMnemonic.privateKey
            }])

            history.push('/wallet');

        }

        catch(err) {
            console.log(err);
        }

    }

  

    return(

            <Switch> 
            <Route path="/" exact> 
            {
                localStorage.getItem('project_v_w') ?
                <div> 
                <label htmlFor="wallet-password"> Wallet password </label>
                <input id="wallet-password" placeholder="password" type='password'/>
                <button onClick={unlockWallet}> Unlock wallet</button>
                </div>
                : 
                <div> You don't have a wallet created. </div>
            }

            <button onClick={createWallet}> Create Wallet </button> 
            <button onClick={importWallet}> Import Wallet </button> 

        
            <div className="create-wallet-modal"> 

            <p> Wallet Seed Phrase : {mnemonic} </p>
            
            <VerifyWallet mnemonic={mnemonic} setupWallet={setupWallet} setVerified={setVerified} />

            </div>

            <div className="import-wallet-modal"> 

            <p> Add your seed Phrase below </p>

            <ImportWallet setMnemonic={setMnemonic} mnemonic={mnemonic} setupWallet={setupWallet} setVerified={setVerified} />

            </div>
            </Route>

            <Route path="/wallet"> 
            <UserWallet changeNetwork={changeNetwork} verified={verified} network={props.network.kovan.rpc} address={address} balances={balances} setBalances={setBalances} addNewAddress={addNewAddress} chainID={chainID}/>
            </Route>

            </Switch>

    )
} 

export default Wallet;