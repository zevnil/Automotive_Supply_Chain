import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'

const AddUser = ({ contract, account }) => {
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [regNo, setRegNo] = useState('')
    const [description, setDescription] = useState('')
    const [accountAddress, setAccountAddress] = useState('')
  
  const uploadToBlockchain = async () => {
    if (!name || !regNo || !description || !accountAddress) return

    await(await contract.addUser(accountAddress, name, regNo, description)).wait()
    console.log("User added Successfully!!")
  }

  const verifyAdmin = async () => {
    const admin = await contract.admin()
    if(! (admin.toLowerCase() === account)){
        alert("Only Admin can access this page!")
    }else{
        setLoading(false)
    }
  }

  useEffect(() => {
    verifyAdmin()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Company Name" />
              <Form.Control onChange={(e) => setRegNo(e.target.value)} size="lg" required type="text" placeholder="Registration No." />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required type="text" placeholder="Description" />
              <Form.Control onChange={(e) => setAccountAddress(e.target.value)} size="lg" required type="text" placeholder="Account Address" />
              <div className="d-grid px-0">
                <Button onClick={uploadToBlockchain} variant="primary" size="lg">
                  Add User
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddUser