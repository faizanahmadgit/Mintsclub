  // SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
contract Tradeable is ERC1155Holder
{
    using SafeMath for uint256;
    address public highestBidder;
    address public MarketPlaceOwner;
    uint256 public highestBid;
    uint256 public PlatFormServiceFee = 250; 
    constructor()
    {
        MarketPlaceOwner = msg.sender;
    }
    struct FixedPrice
    {
        bool isSold;
        bool forsale;
        address owner;
        address newowner;
        address nftAddress;
        address royaltyReciepient;
        uint256 price;
        uint256 paid;   
        uint256 fixedid;
        uint256 tokenid;
        uint256 royaltyFee;
        uint256 totalcopies;
    }
    FixedPrice[] public Fixedprices;
        
    struct Auction
    {
        bool isSold;
        bool OpenForBidding;
        uint256 initialPrice;
        uint256 royaltyFee;
        uint256 auctionid;
        uint256 tokenId;
        uint256 numberofcopies;
        uint256 auctionEndTime;      
        uint256 auctionStartTime;
        uint256 currentBidAmount;
        address currentBidOwner;
        address nftAddress;
        address nftOwner;
        address royaltyReciepient;
    }
    Auction[] public auctions;
    mapping(address => uint256) public pendingResturns;
    event HighestBidIcrease(address bidder, uint amount);
    event OfferSale(uint256 _fixeditemid);
    event AuctionStart(uint256 _auctionid);
    event AuctionEnded(address winner, uint amount);
    modifier IsForSale(uint256 id)
    {
        require(Fixedprices[id].isSold == false , "Item is already Sold");_;
    }
    modifier OnlyTokenHolders(uint256 _tokenid , address _nftAddress)
    {
        require(IERC1155(_nftAddress).balanceOf(msg.sender, _tokenid)>0 , "You are not the owner of Token");_;
    }
    modifier ItemExists(uint256 id)
    {   
        require(id < Fixedprices.length && Fixedprices[id].fixedid == id , "Could not find item");_;
    }
    // All Functions-------------------------------------------------------------------------------------------------
    
    // SettingPlatFormServiceFee Only Owner can do this
    function setPlatFormServiceFee(uint256 _servicefee) public returns(uint256)
    {
        require(msg.sender == MarketPlaceOwner , "Only Owner can set ServiceFee");
        require(_servicefee <= 1000 && _servicefee >=100 , "Can not be greater than 10 % ");
        PlatFormServiceFee = _servicefee;
        return PlatFormServiceFee;
    }
    function calulatePlatFormServiceFee(uint256 _salePrice , uint256 _PBP) public pure returns(uint256)
    {
        require(_salePrice !=0 , "Price of NFT can not be zero");
        require(_PBP <=10000 , "Service Fee can not be greater than Sale Price");
        uint256 serviceFee = _salePrice.mul(_PBP).div(10000);
        return(serviceFee);
    }
    // CalculateRoyaltFee for user
    function calculateRoyaltyFee(uint256 _salePrice , uint256 _PBP) public pure returns(uint256)
    {
        require(_salePrice !=0 , "Royalt Fee can not be zero");
        require(_PBP <=10000 , "Royalty Fee can not be greater than Sale Price");
        uint256 RoyaltyFee =  _salePrice.mul(_PBP).div(10000);
        return RoyaltyFee; 
    }
    // ListingNFTforFixedPointSellingFunction
    function listItemForFixedPrice(uint256 _tokenId, uint256 _amount , uint256 _price , uint256 _royaltyFee, address _nftAddress , address _royaltyRec)public  OnlyTokenHolders(_tokenId , _nftAddress) returns(uint256)
    {
        require(_tokenId >= 0 , "TokenId can not be negative integer");
        require(_amount > 0 , "amount of nfts can not be zero");
        require(_price > 0.00001 ether  , "Price should be greater than 10 ether");
        require(_nftAddress != address(0), "NFT address cannot be 0x0000000000000000000000");
        require(_royaltyFee <= 2000 && _royaltyFee >= 150 , "Royalties fee can not be greater than 20% ");
        uint256 newItemId = Fixedprices.length;
        Fixedprices.push(FixedPrice(false,true,msg.sender,address(0),_nftAddress, _royaltyRec,_price,0,newItemId,_tokenId,_royaltyFee,_amount));
        IERC1155(_nftAddress).safeTransferFrom(msg.sender,address(this), _tokenId, _amount, "0x00");    
        emit OfferSale(newItemId);
        return newItemId;   
    }
    // BuyingFixedPriceSellingItemFunction
    function BuyFixedPriceItem(uint256 Id ) payable public ItemExists(Id) IsForSale(Id) returns(bool)
    {
            
        require(msg.value >=  Fixedprices[Id].price,"send wrong amount in fixed price");
        require(Fixedprices[Id].forsale,"This NFT is not for sale");
        Fixedprices[Id].paid = msg.value; 
        Fixedprices[Id].newowner = msg.sender;
        IERC1155(Fixedprices[Id].nftAddress).safeTransferFrom(address(this),Fixedprices[Id].newowner,Fixedprices[Id].tokenid,Fixedprices[Id].totalcopies,'0x00');
            
        uint256 RoyaltyFes = calculateRoyaltyFee(Fixedprices[Id].price, Fixedprices[Id].royaltyFee);
        uint256 ServiceFee = calulatePlatFormServiceFee(Fixedprices[Id].price, PlatFormServiceFee);
        uint256 totalFee = ServiceFee + RoyaltyFes;
        uint256 amountToSendSeller = Fixedprices[Id].price.sub(totalFee);        
        payable(MarketPlaceOwner).transfer(ServiceFee);
        payable(Fixedprices[Id].royaltyReciepient).transfer(RoyaltyFes);
        payable(Fixedprices[Id].owner).transfer(amountToSendSeller);
        Fixedprices[Id].isSold = true;
        return true;
     }
        // ListingItemForAuctionFunction     //start time should be block.timestamp
    function listItemForAuction(uint256 _initialPrice, uint256 _biddingStartTime, uint256 _biddingendtime , uint256 _royaltyFee , uint256 tokenId, uint256 _numberofcopies , address _nftAddress , address _royaltyRecipient) 
        public  OnlyTokenHolders(tokenId , _nftAddress) returns(uint256)
    {
        require(_initialPrice > 0 , "Initial price can not be zero");
        require(tokenId >= 0 , "TokenId can not be negative integer");
        require(_numberofcopies > 0 , "amount of nfts can not be zero");
        require(_nftAddress != address(0), "NFT address cannot be 0x0000000000000000000000");
        require(_royaltyFee <= 2000 && _royaltyFee >= 150 , "Royalties fee can not be greater than 20% ");
        require(_royaltyRecipient != address(0) , "should be valid addresss" );
        require(_biddingStartTime >= block.timestamp , "Start time can not be less than current time");
        require(_biddingendtime > block.timestamp , "End time can not be current time"); 
    
        uint256 newauctionid = auctions.length;
        auctions.push(Auction
        (false,true,_initialPrice,_royaltyFee,newauctionid,tokenId,_numberofcopies,_biddingendtime,_biddingStartTime,0,address(0) , _nftAddress,msg.sender, _royaltyRecipient));
        IERC1155(_nftAddress).safeTransferFrom(msg.sender,address(this),tokenId , _numberofcopies,'0x00');
        emit AuctionStart(newauctionid);
        return newauctionid;
        
    }
    function bid( uint256 Id ) payable public  
    {
        require(auctions[Id].OpenForBidding && block.timestamp >= auctions[Id].auctionStartTime,"Bidding is not open yet");
        require(msg.value >= auctions[Id].initialPrice, "Bid must be equal or higher than initial price");
        address  currentBidOwner = auctions[Id].currentBidOwner;
        uint256  currentBidAmount = auctions[Id].currentBidAmount;
            
        if(msg.value <=  currentBidAmount) 
        {
            revert("There is already higer or equal bid exist");
        }
        if( currentBidAmount !=0) 
        {
            pendingResturns[currentBidOwner] += currentBidAmount;
        }
        if(msg.value > currentBidAmount) 
        {
            payable(currentBidOwner).transfer(currentBidAmount);
        }
        auctions[Id].currentBidOwner = msg.sender;
        auctions[Id].currentBidAmount = msg.value; 
        highestBidder =  auctions[Id].currentBidOwner;
        highestBid =  auctions[Id].currentBidAmount;
        emit HighestBidIcrease(msg.sender , msg.value);
    }
     function auctionEnd(uint256 Id) public 
    {
        require(msg.sender == auctions[Id].nftOwner , "Only the owner of NFT can end this auction");

        if(!auctions[Id].OpenForBidding)
        {
            revert("The function auctionEnded is already called");
        }
        if(auctions[Id].currentBidOwner != address(0))
        {

        emit  AuctionEnded(highestBidder , highestBid);
            
        uint256 RoyaltyFes = calculateRoyaltyFee(auctions[Id].currentBidAmount, auctions[Id].royaltyFee);
        uint256 ServiceFee = calulatePlatFormServiceFee(auctions[Id].currentBidAmount, PlatFormServiceFee);
        uint256 totalFee = ServiceFee + RoyaltyFes;
        uint256 amountToSendSeller = auctions[Id].currentBidAmount.sub(totalFee);
        payable(MarketPlaceOwner).transfer(ServiceFee);
        payable(auctions[Id].royaltyReciepient).transfer(RoyaltyFes);
        payable(auctions[Id].nftOwner).transfer(amountToSendSeller);
        IERC1155(auctions[Id].nftAddress).safeTransferFrom(address(this),msg.sender,auctions[Id].tokenId,auctions[Id].numberofcopies,'0x00');
        auctions[Id].isSold = true;

        }
    }
        
    function claimNft(uint256 Id) public  returns(bool) 
    {
        require(msg.sender == auctions[Id].currentBidOwner , "You are not the highest bidder");
        require(block.timestamp >= auctions[Id].auctionEndTime , "Auction still in Progress");
        if(!auctions[Id].OpenForBidding)
        {
            revert("You already have claimed for your NFT");    
        }
        emit AuctionEnded(highestBidder , highestBid);
        uint256 RoyaltyFes = calculateRoyaltyFee(auctions[Id].currentBidAmount, auctions[Id].royaltyFee);
        uint256 ServiceFee = calulatePlatFormServiceFee(auctions[Id].currentBidAmount, PlatFormServiceFee);
        uint256 totalFee = ServiceFee + RoyaltyFes;
        uint256 amountToSendSeller = auctions[Id].currentBidAmount.sub(totalFee);
        payable(MarketPlaceOwner).transfer(ServiceFee);
        payable(auctions[Id].royaltyReciepient).transfer(RoyaltyFes);
        payable(auctions[Id].nftOwner).transfer(amountToSendSeller);
        IERC1155(auctions[Id].nftAddress).safeTransferFrom(address(this),msg.sender,auctions[Id].tokenId,auctions[Id].numberofcopies,'0x00');
        auctions[Id].isSold = true;
        return true;
    }
}