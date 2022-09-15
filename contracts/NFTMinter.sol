// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract NFTMinter is ERC1155URIStorage 
{
    using Counters for Counters.Counter;

    string public name;
    string private _baseURI = "";

    mapping(uint256 => string)  private _tokenURIs;

    mapping(uint256=> bool) isTransferred ;

    Counters.Counter private _tokenIdCounter;


    constructor(string memory _name) ERC1155("")
    {
        name = _name ;
    }
    
    function setName(string memory _name) public
    {
        name = _name; // Collection name
    }

    //Minting Functions
    
    function mint(address account , uint256 amount , string memory tokenuri)public 
    {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(account,tokenId,amount,"0x00");
        _setURI(tokenId, tokenuri);
    
    }

    function mintBatch(address to, uint256[] memory amounts, string[] memory tokenUris)public
    {
        require(tokenUris.length == amounts.length , "Ids and TokenUri length mismatch");
        uint[] memory tokenId = new uint[](amounts.length);
        for (uint i = 0; i < amounts.length; i++){
            _tokenIdCounter.increment();
            tokenId[i] = _tokenIdCounter.current();
            _setURI(tokenId[i], tokenUris[i]);
        }
         _mintBatch(to, tokenId, amounts, "0x00");
             
    }
     function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        super.safeTransferFrom(from, to, id, amount, data);
        isTransferred[id] = true;

    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
       for(uint256 i = 0; i< ids.length; i++){
           isTransferred[ids[i]]= true;
       }
        
    }

     function EditNft(uint256 tokenId, string memory newUri) public {
         
         require(super.balanceOf(msg.sender,tokenId)!= 0, "Only NFT Owner can Edit");
        require(isTransferred[tokenId] == false,"you cannot change metadata now");
        _setURI(tokenId, newUri);
    }
    
}