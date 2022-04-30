import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from "react-router-dom"
import { Spinner } from 'react-bootstrap'

const Marketplace = ({ contract, account }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    
    const loadMarketplaceItems = async () => {
        const productCount = await contract.productCount()
        let items = []
        for(let i=1; i <= productCount; ++i){
            const item = await contract.products(i)
            if(item.isSellable && item.isUpForSale){
                // Add item to items array
                const owner = await contract.users(item.ownerAddress)
                items.push({
                    name: item.name,
                    price: item.price,
                    itemId: item.id,
                    seller: owner.companyName,
                    sellerAddress: item.ownerAddress,
                    linkAddr: "/view-product/" + item.id.toNumber()
                })
            }
        }
        console.log("Item list created in loadMarketplaceItems()")
        console.log(items)
        setItems(items)
        setLoading(false)
    }

    const buyMarketItems = async (item) => {
        if(item.sellerAddress.toLowerCase() === account){
            alert("Can't sell to yourself!")
        }else{
            let today = new Date().toLocaleDateString()
            await (await contract.purchaseProduct(item.itemId, today, { value: item.price })).wait()
            loadMarketplaceItems()
        }
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
                <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {items.map((item, idx) => (
                    <Col key={idx} className="overflow-hidden">
                        <Card>
                        <Card.Body color="secondary">
                            <Card.Title>{item.name}</Card.Title>
                            <Card.Text>
                                <div>Product Id: {item.itemId.toNumber()}</div>
                                <div>Seller: {item.seller}</div>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                        {/* <div class="row"> */}
                        {/* <div class="col-sm"> */}
                            <Link to={item.linkAddr}>
                            <Button class="col-lg btn-primary btn-sm me-1 float-left">
                                View
                            </Button>
                            </Link>
                        {/* </div> */}
                        {/* <div class="col-sm"> */}
                            <Button onClick={() => buyMarketItems(item)} class="col-lg btn-primary btn-sm ms-1 float-right">
                                Buy for {ethers.utils.formatEther(item.price)} ETH
                            </Button>
                        {/* </div> */}
                        {/* </div> */}
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
export default Marketplace