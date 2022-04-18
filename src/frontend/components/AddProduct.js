import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'

const AddProduct = ({ contract }) => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState(null)
    const [isSellable, setIsSellable] = useState('')
    const [isUpForSale, setIsUpForSale] = useState('')
  
  const uploadToBlockchain = async () => {
    if (!name || !price || !isSellable || !isUpForSale) return

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

  return (
    <div className="container-fluid mt-5">
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
    </div>
  );
}

export default AddProduct