import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card } from 'react-bootstrap'
import { Link } from "react-router-dom";
import React from "react";
import { Spinner } from 'react-bootstrap'

const Home = ({ contract, account }) => {
    const [productId, setProductId] = useState(null)
    const [displayProduct, setdisplayProduct] = useState(false)
    const [productDetails, setProductDetails] = useState({})
    const [productCount, setProductCount] = useState(0)
    const [linkAddr, setLinkAddr] = useState("/")
    const [loading, setLoading] = useState(false)
    const [isAuthenticUser, setUserAuthentication] = useState(false)
  
  const getProduct = async () => {
    setdisplayProduct(false);
    if (productId == null) {
        alert("Product ID is needed!");
        return;
    }else if(productId <= 0){
        alert("Product ID is invalid!");
        return;
    }
    //setLoading(true);

    const _productCount = await contract.productCount();
    setProductCount(_productCount);

    const currentProduct = await contract.products(productId);
    const owner = await contract.users(currentProduct.ownerAddress);

    setTimeout(function(){ 
        let details = {
            id: currentProduct.id.toNumber(),
            name: currentProduct.name,
            price: ethers.utils.formatEther(currentProduct.price),
            seller: owner.companyName,
            ownerAddress: currentProduct.ownerAddress.toLowerCase(),
            isUpForSale: currentProduct.isUpForSale
            //linkAddr: "/view-product/" + currentProduct.id.toNumber()
        }
        setProductDetails(details);
        setLinkAddr("/view-product/" + details.id);
        console.log("LINK-ADDR:")
        console.log(linkAddr);
    
        setdisplayProduct(true);
        //setLoading(false);
        setProductId(null);
    }, 500); 
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
              <Form.Control onChange={(e) => setProductId(e.target.value)} size="lg" required type="number" placeholder="Enter the ID of the product you are looking for." />
              <div className="d-grid px-0">
                <Button onClick={getProduct} variant="primary" size="lg" className = 'mb-5'>
                  Get Product
                </Button>
              </div>
            </Row>
          </div>
          <div class='m-7'>
              {displayProduct ? 
              (productDetails.id > 0 && productDetails.id <= productCount ?
                <Card className='p-7'>
                    <Card.Body color="secondary">
                        <Card.Title>{productDetails.id}</Card.Title>
                        <Card.Text>
                            <div>Product Name: {productDetails.name}</div>
                            <div>Owner: {productDetails.seller}</div>
                            {productDetails.isUpForSale == true ?
                            <div>Price: {productDetails.price} ETH</div>
                            : (
                                <div>Product is not up for Sale.</div>
                            )}
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                        <Link to={linkAddr}>
                            <Button variant="primary" size="lg">
                                View
                            </Button>
                        </Link>
                        </div>
                    </Card.Footer>
                </Card>
                : (
                    <Card className='p-7'>
                        <Card.Body color="secondary">
                            <Card.Text>
                                <div>Product Not found in the database.</div>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))
                :(
                   <Card className='p-7'></Card> 
                )}
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

export default Home