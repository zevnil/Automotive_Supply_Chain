import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { Spinner } from 'react-bootstrap'

export default function Profile({ contract, account }) {
  const [loading, setLoading] = useState(true)
  const [ownedItems, setOwnedItems] = useState([])
  const [userDetails, setUserDetails] = useState({})
  const [isAuthenticUser, setUserAuthentication] = useState(false)

  const loadUserDetails = async () => {
    const currentUser = await contract.users(account)
    let details = {
        companyName: currentUser.companyName,
        companyRegistrationNumber: currentUser.companyRegistrationNumber,
        description: currentUser.description
    }
    setUserDetails(details)
  }
  
  const loadOwnedItems = async () => {
    const productCount = await contract.productCount()
    let items = []
    for (let indx = 1; indx <= productCount; indx++) {
      const item = await contract.products(indx)
      if (item.ownerAddress.toLowerCase() === account) {
          let iUFS = "No"
          if(item.isUpForSale == true)
          iUFS = "Yes"
        // Add item to items array
        items.push({
            name: item.name,
            price: item.price,
            itemId: item.id.toNumber(),
            isUpForSale: iUFS,
            linkAddr: "/view-product/" + item.id.toNumber()
        })
      }
    }
    setLoading(false)
    setOwnedItems(items)
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
    loadUserDetails()
    loadOwnedItems()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {isAuthenticUser ?
        <div>
        <div>
          <h2>User Details</h2>
          <p>Name: {userDetails.companyName}</p>
          <p>Registration No: {userDetails.companyRegistrationNumber}</p>
          <p>Description: {userDetails.description}</p>
          <p>Account Address: {account}</p>
        </div>
      {ownedItems.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Owned Products</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {ownedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                    <Card.Body color="secondary">
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>
                            <div>Product Id: {item.itemId}</div>
                            <div>Is up for sale: {item.isUpForSale}</div>
                            <div>Price: {ethers.utils.formatEther(item.price)} ETH</div>
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                        <Link to={item.linkAddr}>
                        <Button variant="primary" size="lg">
                            View
                        </Button>
                        </Link>
                        </div>
                    </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
        </div> : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Cannot access this private blockchain. User registration needed.</p>
          </div>
        )}
    </div>
  );
}