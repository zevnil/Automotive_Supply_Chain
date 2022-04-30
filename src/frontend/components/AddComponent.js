import { useState, useEffect } from 'react'
import { Row, Form, Button, Card } from 'react-bootstrap'
import { Link } from "react-router-dom";
import React from "react";
import { useParams } from 'react-router-dom';

const AddComponent = ({ contract, account }) => {
    const [componentId, setComponentId] = useState(null)
    const [productDetails, setProductDetails] = useState({})
    const [loading, setLoading] = useState(true)

    const product_id = useParams().id;
    console.log("PRODUCT ID received:")
    console.log(product_id)

    const linkAddr = "/view-product/" + product_id;
    console.log("LINKADDR:")
    console.log(linkAddr)

    const loadProductDetails = async () => {
        const currentProduct = await contract.products(product_id);
        const owner = await contract.users(currentProduct.ownerAddress);
        let details = {
            id: currentProduct.id.toNumber(),
            name: currentProduct.name,
            seller: owner.companyName,
            ownerAddress: currentProduct.ownerAddress.toLowerCase()
        };
        setProductDetails(details);
        setLoading(false);
    }
  
  const addComponent = async () => {
    const productCount = await contract.productCount();
    if (componentId == null) {
        alert("Component ID is needed!");
        return;
    }else if(componentId <= 0){
        alert("Component ID is invalid!");
        return;
    }else if(componentId > productCount){
        alert("Product is not available in the Database.");
        return;
    }else if(componentId == product_id){
        alert("Component can't be the same as the product.");
        return;
    }else if(!(productDetails.ownerAddress === account)){
        alert("Only the owner can update their product");
        return;
    }
    let today = new Date().toLocaleDateString();
    await(await contract.addComponent(product_id, componentId, today)).wait();
    alert("Component (ID: " + componentId + ") added to the Product " + product_id + ".");
  }

  useEffect(() => {
        loadProductDetails()
    }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="container-fluid mt-5">
        <div className="flex justify-center">
          <h2>Product: {productDetails.name}</h2>
          <p>Product ID: {productDetails.id}</p>
          <p>Owner: {productDetails.seller}</p>
          <p>Owner Address: {productDetails.ownerAddress}</p>
        </div>
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control onChange={(e) => setComponentId(e.target.value)} size="lg" required type="number" placeholder="ID of the Component" />
              <div className="d-grid px-0">
                <Button onClick={addComponent} variant="primary" size="lg" className = 'mb-5'>
                  Add
                </Button>
              </div>
              <div className="d-grid px-0">
              <Link to={linkAddr}>
                <Button variant="primary" size="lg">
                    Done
                </Button>
                </Link>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddComponent