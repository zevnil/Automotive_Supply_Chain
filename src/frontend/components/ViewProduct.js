import { useState, useEffect } from 'react'
import React from "react";
import { ethers } from "ethers"
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';


export default function ViewProduct ({ contract, account }) {
  const [loading, setLoading] = useState(true)
  const [productDetails, setProductDetails] = useState({})
  const [componentDetails, setComponentDetails] = useState([])
  const [states, setStates] = useState([])
  const [productCount, setProductCount] = useState(null)
  const [displayPriceComp, setdisplayPriceComp] = useState(false)
  const [price, setPrice] = useState(null)
  let product_id = useParams().id;
  console.log("PRODUCT ID received:");
  console.log(product_id);

  const addComponentLink = "/add-component/" + product_id;
  const addStateLink = "/add-state/" + product_id;

  const loadProductDetails = async () => {
    const _productCount = await contract.productCount();
    setProductCount(_productCount);
    const currentProduct = await contract.products(product_id)
    let iUFS = "No"
    if(currentProduct.isUpForSale == true)
    iUFS = "Yes"
    let iS = "No"
    if(currentProduct.isSellable == true)
    iS = "Yes"
    const owner = await contract.users(currentProduct.ownerAddress)
    const pComponents = await contract.getComponents(product_id);
    const pStates = await contract.getStates(product_id);
    let details = {
        id: currentProduct.id.toNumber(),
        name: currentProduct.name,
        price: ethers.utils.formatEther(currentProduct.price),
        seller: owner.companyName,
        ownerAddress: currentProduct.ownerAddress.toLowerCase(),
        isSellable: iS,
        isUpForSale: iUFS,
        totalStateLogs: currentProduct.totalStateLogs.toNumber(),
        totalComponents: currentProduct.totalComponents.toNumber()
    }
    console.log("Components");
    console.log(pComponents);
    let cmpdtls = [];

    for(let i=0; i < details.totalComponents; ++i){

      const cmpnt = await contract.products(pComponents[i].toNumber());
      cmpdtls.push({
        id: cmpnt.id.toNumber(),
        name: cmpnt.name,
        linkAddr: "/view-product/" + pComponents[i].toNumber()
      });
    }
    setComponentDetails(cmpdtls)

    console.log("States:");
    console.log(pStates);

    let sts = [];
    for(let i=details.totalStateLogs-1; i >= 0; --i){
      sts.push({
        owner: pStates[i].owner,
        description: pStates[i].description,
        date: pStates[i].date
      });
    }
    setStates(sts);

    console.log("DETAILS:")
    console.log(details);
    setProductDetails(details)
  }

  const removeProductFromSale = async (productDetails) => {
    if (! (productDetails.ownerAddress === account)) return;

    await(await contract.removeProductFromSale(productDetails.id)).wait()
    console.log("Product Removed from Sale.")
  }

  const putProductOnSale = async () => {
    if (! (productDetails.ownerAddress === account)) return;
    else if(price < 0){
      alert("Invalid Price!");
      return;
    }else if(productDetails.isSellable === "No"){
      alert("Can't sell product components individually");
      return;
    }

    const listingPrice = ethers.utils.parseEther(price.toString());
    
    await(await contract.putProductOnSale(productDetails.id, listingPrice)).wait()
    console.log("Product on sale at price "+price+" ETH");

    setdisplayPriceComp(false);
  }
  function displayPrice(){
    if(displayPriceComp == false)
    setdisplayPriceComp(true)
    else
    setdisplayPriceComp(false)
  }

  useEffect(() => {
      console.log("REACHED 1");
    loadProductDetails()
    setLoading(false)
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {product_id <= productCount ? 
      <div>
        <div>
          <h2>Product Details</h2>
          <p>Name: {productDetails.name}</p>
          <p>Product ID: {productDetails.id}</p>
          <p>Price: {productDetails.price} ETH</p>
          <p>Owner: {productDetails.seller}</p>
          <p>Owner Address: {productDetails.ownerAddress}</p> 
          <p>Is Sellable?: {productDetails.isSellable}</p>
          <p>Is Up For Sale?: {productDetails.isUpForSale}</p>
          <p>Total State Logs: {productDetails.totalStateLogs}</p>
          <p>Total Components: {productDetails.totalComponents}</p>
        </div>
        <div>
          <h2>Components</h2>
          {/* {components.map((component, idx) => (
            // {currentComponent = await contract.products(productId)}
            // <p>component</p>
            <p></p>
          ))} */}
          {productDetails.totalComponents > 0 ?
                <div className="px-5 py-3 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                    {componentDetails.map(function(item, idx){
                      return <Col key={idx} className="overflow-hidden">
                      <Card>
                          <Card.Body color="secondary">
                              <Card.Title>{item.name}</Card.Title>
                              <Card.Text>
                                  <div>ID: {item.id}</div>
                                  <div>Name: {item.name}</div>
                              </Card.Text>
                          </Card.Body>
                          <Card.Footer>
                              <div className='d-grid'>
                              <a onClick={() => {window.location.href=item.linkAddr}}>
                              <Button variant="primary" size="lg">
                                  View
                              </Button>
                              </a>
                              </div>
                          </Card.Footer>
                      </Card>
                    </Col>
                  })}
                </Row>
            </div>
            : (
            <main style={{ padding: "1rem 0" }}>
                <p>No components found.</p>
            </main>
            )}
        </div>
        <div>
          <h2>State Logs</h2>
          {productDetails.totalStateLogs > 0 ?
              states.map(function(st, idx){
                return <Card>
                  <Card.Body color="secondary">
                      <Card.Title>{st.description}</Card.Title>
                      <Card.Text>
                          <p>Added on: {st.date}</p>
                          <p>Owner: {st.owner}</p>
                      </Card.Text>
                  </Card.Body>
                  </Card>
            })
            : (
            <main style={{ padding: "1rem 0" }}>
                <p>No state logs found.</p>
            </main>
            )}
        </div>
        {productDetails.ownerAddress === account ? 
          <div>
          <Link to={addComponentLink}>
          <Button variant="primary" size="lg" className='m-2'>
              Add Component
          </Button>
          </Link>
          <Link to={addStateLink}>
          <Button variant="primary" size="lg" className='m-2'>
              Add State Log
          </Button>
          </Link>
          {productDetails.isSellable === "Yes" ? 
          (productDetails.isUpForSale === "Yes" ?
          <div>
          <Button onClick={() => removeProductFromSale(productDetails)} variant="primary" size="lg" className='m-2'>
              Remove product from Sale
          </Button> 
          </div>
          : (
            <div>
            <Button onClick={() => displayPrice()} variant="primary" size="lg" className='m-2'>
              Put product on Sale
          </Button>
          <div class='m-7'>
          {displayPriceComp ? 
            <Card className='p-7'>
                <Card.Body color="secondary">
                    <Card.Title>Set price</Card.Title>
                    <Card.Text>
                    <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                    </Card.Text>
                </Card.Body>
                <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={putProductOnSale} variant="primary" size="lg">
                          Add
                      </Button>
                    </div>
                </Card.Footer>
            </Card>
            : (
              <div></div>
            )}
      </div>
      </div>
          )
          ) : (
            <div>
            </div>
          )}
          </div>
          : (
            <div>
            </div>
          )}
          </div>
          : (
            <div></div>
          )}
    </div>
  );
}