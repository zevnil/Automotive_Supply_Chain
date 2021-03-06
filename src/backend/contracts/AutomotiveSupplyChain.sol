pragma solidity 0.8.4;
//SPDX-License-Identifier: UNLICENSED

contract AutomotiveSupplyChain {
    string public name;
    address public admin;
    uint public productCount = 0;
    mapping(uint => Product) public products;
    mapping(address => User) public users;

    struct User {
        string companyName;
        string companyRegistrationNumber;
        string description;
        address payable accountAddress;
    }

    struct State{
        address owner;
        string description;
        string date;
    }

    struct Product {
        uint id;
        string name;
        uint price;
        address payable ownerAddress;
        bool isSellable;
        bool isUpForSale;
        uint totalStateLogs;
        State[] stateLogs;
        uint totalComponents;
        uint[] components;
    }

    event ProductAdded(
        uint id,
        string name,
        uint price,
        string owner,
        address payable ownerAddress,
        bool isSellable,
        bool isUpForSale,
        uint totalStateLogs,
        uint totalComponents
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event userAdded(
        string companyName,
        string companyRegistrationNumber,
        string description,
        address payable accountAddress
    );

    event stateAdded(
        uint productId,
        address owner,
        string description,
        string date
    );

    event componentAdded(
        uint productId,
        uint componentId,
        uint[] arr
    );

    event productPutOnSale(
        address owner,
        bool isUpForSale,
        uint price
    );

    event productRemovedFromSale(
        address owner,
        bool isUpForSale
    );

    constructor() {
        name = "Automotive Supplier Payments - Marketplace for Automobile industry";
        admin = msg.sender;
    }

    function concat(string memory _a, string memory _b) internal returns (string memory){
        bytes memory bytes_a = bytes(_a);
        bytes memory bytes_b = bytes(_b);
        string memory length_ab = new string(bytes_a.length + bytes_b.length);
        bytes memory bytes_c = bytes(length_ab);
        uint k = 0;
        for (uint i = 0; i < bytes_a.length; i++) bytes_c[k++] = bytes_a[i];
        for (uint i = 0; i < bytes_b.length; i++) bytes_c[k++] = bytes_b[i];
        return string(bytes_c);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function addUser(address payable _accountAddress, string memory _companyName, string memory _companyRegistrationNumber, 
                        string memory _description) public {
        require(msg.sender == admin, "Only Admin can register users!");
        users[_accountAddress] = User(_companyName, _companyRegistrationNumber, _description, _accountAddress);
        
        emit userAdded(_companyName, _companyRegistrationNumber, _description, _accountAddress);
    }

    function addProduct(string memory _name, uint _price, bool _isSellable, bool _isUpForSale, string memory _date) public {
        require(bytes(_name).length > 0);
        require(_price > 0);
        productCount ++;
        
        products[productCount].id = productCount;
        products[productCount].name = _name;
        products[productCount].price = _price;
        products[productCount].ownerAddress = payable(msg.sender);
        products[productCount].isSellable = _isSellable;
        products[productCount].isUpForSale = _isUpForSale;
        products[productCount].totalStateLogs = 0;
        products[productCount].totalComponents = 0;

        string memory logDesc = "Added by ";
        logDesc = concat(logDesc, users[msg.sender].companyName);
        logDesc = concat(logDesc, " - ");
        logDesc = concat(logDesc, users[msg.sender].description);
        addState(productCount, logDesc, _date);
        
        emit ProductAdded(productCount, _name, _price, users[msg.sender].companyName, payable(msg.sender), _isSellable, 
                            _isUpForSale, 0, 0);
    }

    function addState(uint _productId, string memory info, string memory _date) public {
        require(_productId <= productCount, "Invalid Product Id");
        require(msg.sender == products[_productId].ownerAddress, "Only the owner can update their product");
        State memory newState = State({owner: msg.sender, description: info, date: _date});
        products[_productId].totalStateLogs++;
        products[_productId].stateLogs.push(newState);

        emit stateAdded(_productId, msg.sender, info, _date);
    }

    function getStates(uint _productId) public view returns (State[] memory) {
        return products[_productId].stateLogs;
    }

    function addComponent(uint _productId, uint _componentId, string memory _date) public {
        require(_productId <= productCount, "Invalid Product Id");
        require(_componentId <= productCount, "Invalid Component Id");
        require(_componentId != _productId, "Component ID can't be equal to the product ID");
        require(msg.sender == products[_productId].ownerAddress, "Only the owner can update their product");
        products[_productId].totalComponents++;
        products[_productId].components.push(_componentId);

        //Component is not sellable individually
        products[_componentId].isSellable = false;
        products[_componentId].isUpForSale = false;
        products[_componentId].ownerAddress = payable(msg.sender);

        string memory logDesc = "Product ";
        logDesc = concat(logDesc, toString(_componentId));
        logDesc = concat(logDesc, " added as Component.");
        addState(_productId, logDesc, _date);

        logDesc = "Became a component of Product ";
        logDesc = concat(logDesc, toString(_productId));
        logDesc = concat(logDesc, ". Owner updated.");
        addState(_componentId, logDesc, _date);

        emit componentAdded(_productId, _componentId, products[_productId].components);
    }

    function getComponents(uint _productId) public view returns (uint[] memory) {
        return products[_productId].components;
    }

    function putProductOnSale(uint _productId, uint _price) public {
        require(msg.sender == products[_productId].ownerAddress, "Only the owner can sell their product");
        require(products[_productId].isSellable, "Can't sell product components individually");
        require(_price > 0, "Invalid price");
        products[_productId].isUpForSale = true;
        products[_productId].price = _price;

        emit productPutOnSale(msg.sender, true, _price);
    }

    function removeProductFromSale(uint _productId) public {
        require(msg.sender == products[_productId].ownerAddress, "Only the owner can update their product");
        products[_productId].isUpForSale = false;

        emit productRemovedFromSale(msg.sender, false);
    }

    function purchaseProduct(uint _id, string memory _date) public payable {
        address payable _seller = products[_id].ownerAddress;
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        require(msg.value >= products[_id].price, "Insufficient ethers - in msg.value");
        require(products[_id].isSellable, "Product is not sellable individually");
        require(products[_id].isUpForSale, "Product is not up for sale");
        require(_seller != msg.sender, "Can't sell to yourself");

        products[_id].ownerAddress = payable(msg.sender);
        products[_id].isUpForSale = false;
        payable(address(_seller)).transfer(msg.value);

        string memory logDesc = "Purchased by ";
        logDesc = concat(logDesc, users[msg.sender].companyName);
        logDesc = concat(logDesc, " - ");
        logDesc = concat(logDesc, users[msg.sender].description);
        addState(_id, logDesc, _date);
        emit ProductPurchased(productCount, products[_id].name, products[_id].price, payable(msg.sender), true);
    }
}