import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { Spinner } from 'react-bootstrap'

const AddProduct = ({ contract, account }) => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState(null)
    const [isSellable, setIsSellable] = useState('')
    const [isUpForSale, setIsUpForSale] = useState('')
    const [isAuthenticUser, setUserAuthentication] = useState(false)
    const [loading, setLoading] = useState(false)
  
  const uploadToBlockchain = async () => {
    if (!name || !price || !isSellable || !isUpForSale) {
      alert("All fields are Mandatory!")
      return;
    }else if(price < 0){
      alert("Invalid price!");
      return;
    }else if(!(isSellable === "y" || isSellable === "n")){
      alert('Enter "y" for Yes or "n" for No in the "Is Sellable?" field.');
      return;
    }else if(!(isUpForSale === "y" || isUpForSale === "n")){
      alert('Enter "y" for Yes or "n" for No in the "Is up for Sale?" field.');
      return;
    }

    // add product to contract
    const listingPrice = ethers.utils.parseEther(price.toString())
    let today = new Date().toLocaleDateString()
    let iS = false
    let iUFS = false
    if(isSellable === "y")
    iS = true
    if(isUpForSale === "y")
    iUFS = true
    await(await contract.addProduct(name, listingPrice, iS, iUFS, today)).wait()
    console.log("Product added Successfully!!")
  }

  const userAuthentication = async () => {
    const currentUser = await contract.users(account);
    console.log("USER AUTHENTICATION:")
    console.log("Account:")
    console.log(account)
    console.log("currentUser:")
    console.log(currentUser)
    console.log("currentUser.accountAddress:")
    console.log(currentUser.accountAddress)

    const admin = await contract.admin()
    console.log("admin:")
    console.log(admin)

    if(admin.toLowerCase() === account || currentUser.accountAddress != "0x0000000000000000000000000000000000000000"){
      setUserAuthentication(true);
    }else{
      setUserAuthentication(false);
    }
  }

  useEffect(() => {
    userAuthentication()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="container-fluid mt-5">
      {isAuthenticUser ? 
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <Form.Control onChange={(e) => setIsSellable(e.target.value)} size="lg" required type="text" placeholder="Is Sellable? (y/n)" />
              <Form.Control onChange={(e) => setIsUpForSale(e.target.value)} size="lg" required type="text" placeholder="Is up for Sale? (y/n)" />
              <div className="d-grid px-0">
                <Button onClick={uploadToBlockchain} variant="primary" size="lg">
                  Add Product
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spinner animation="border" style={{ display: 'flex' }} />
          <p className='mx-3 my-0'>Cannot access this private blockchain. User registration needed.</p>
        </div>
      )}
    </div>
  );
}

export default AddProduct