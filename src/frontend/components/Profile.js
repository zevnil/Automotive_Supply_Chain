import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

export default function Profile({ contract, account }) {
  const [loading, setLoading] = useState(true)
  const [ownedItems, setOwnedItems] = useState([])
  const [userDetails, setUserDetails] = useState({})

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
            itemId: item.id,
            isUpForSale: iUFS
        })
      }
    }
    setLoading(false)
    setOwnedItems(items)
  }

  const goToProductPage = async (item) => {

    }

  useEffect(() => {
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
        <div>
          <h2>User Details</h2>
          <p>Name: {userDetails.companyName}</p>
          <p>Registration No: {userDetails.companyRegistrationNumber}</p>
          <p>Description: {userDetails.description}</p>
          <p>Account Address: {account}</p>
        </div>
      {ownedItems.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {ownedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                    <Card.Body color="secondary">
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>
                            <div>Product Id: {item.itemId.toNumber()}</div>
                            <div>Is up for sale: {item.isUpForSale}</div>
                            <div>Price: {ethers.utils.formatEther(item.price)} ETH</div>
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                        <Button onClick={() => goToProductPage(item)} variant="primary" size="lg">
                            View
                        </Button>
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
    </div>
  );
}