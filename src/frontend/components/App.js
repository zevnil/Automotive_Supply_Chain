import './App.css';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { useState } from 'react';
import { ethers } from "ethers";
import AutomotiveSupplyChainAbi from '../contractsData/AutomotiveSupplyChain.json'
import AutomotiveSupplyChainAddress from '../contractsData/AutomotiveSupplyChain-address.json'
import Navigation from './Navbar';
import Home from './Home.js'
import Profile from './Profile.js'
import AddProduct from './AddProduct.js'
import Marketplace from './Marketplace.js'
import AddUser from './AddUser.js'
import ViewProduct from './ViewProduct.js'
import AddComponent from './AddComponent.js'
import AddState from './AddState.js'
import { Spinner } from 'react-bootstrap'

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})
  const [admin, setAdmin] = useState(null)
  // MetaMask Login/Connect
  const web3Handler = async () => {
    console.log("---web3Handler REACHED!!---")
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    console.log("--- ACCOUNT SET TO: ---")
    console.log(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })

    console.log("--- loadContract(signer) CALLED FROM web3Handler ---")
    loadContract(signer)
  }

  const loadContract = async (signer) => {
    // Get deployed copies of contracts
    const contract = new ethers.Contract(AutomotiveSupplyChainAddress.address, AutomotiveSupplyChainAbi.abi, signer)
    setContract(contract)

    const _admin = await contract.admin()
    setAdmin(_admin.toLowerCase())
    console.log("--- CONTRACT SET IN loadContract(signer) ---")
    setLoading(false)
    console.log("--- setLoading(false) IN loadContract(signer) ---")
  }

  return (
    <BrowserRouter>
    <div className= "App">
      <Navigation web3Handler={web3Handler} account={account} admin={admin} />
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spinner animation="border" style={{ display: 'flex' }} />
          <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={
            <Home contract={contract} account={account} />
          } />
          <Route path="/profile" element={
            <Profile contract={contract} account={account} />
          } />
          <Route path="/add-product" element={
            <AddProduct contract={contract} account={account} />
          } />
          <Route path="/marketplace" element={
            <Marketplace contract={contract} account={account} />
          } />
          <Route path="/add-user" element={
            <AddUser contract={contract} account={account} />
          } />
          <Route path="/view-product/:id" element={
            <ViewProduct contract={contract} account={account} />
          } />
          <Route path="/add-component/:id" element={
            <AddComponent contract={contract} account={account} />
          } />
          <Route path="/add-state/:id" element={
            <AddState contract={contract} account={account} />
          } />
        </Routes>
      )}
    </div>
    </BrowserRouter>
  );
}

export default App;
