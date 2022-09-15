// const {
//   time,
//   loadFixture,
// } = require("@nomicfoundation/hardhat-network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// const { expect, reverted, assert } = require("chai");
// const { Minimatch } = require("minimatch");

// describe("MintsclubProxy", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshopt in every test.
//   async function deployContract() {

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners();
  

//     const MintsClubProxy = await ethers.getContractFactory("NFTMinter");
//     const MintsclubProxy = await MintsClubProxy.deploy("myNft");
//      //await MintsclubProxy.initialize("myNft"); //initialized the contract
//     return {MintsclubProxy,owner, otherAccount};

//   }

//   describe("Deployment",  function () {

//     it("Should set the right name", async function () {
//       const{MintsclubProxy} = await loadFixture(deployContract);
//       expect(await MintsclubProxy.name()).to.equal("myNft");
//     });


//     it("check mint function", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,10,"a/");
//     });

//     it("should fail mint function without tokenUri", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await expect(MintsclubProxy.mint(otherAccount.address,10)).to.be.rejected;
//     });

//     it("check balance after mint", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,10,"a/");
//       //checking Balance
//       const amount= await MintsclubProxy.balanceOf(otherAccount.address,1);
//       expect(amount).to.equal(10);
//       console.log("Balance: ",amount);
     
//     });

//     it("check uri after mint", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,5,"b/");
//               //calling uri function
//       const uri= await MintsclubProxy.uri(1);
//       expect(uri).to.equal("b/");
//       console.log("URI : ",uri);
//     });

//     it("check Edit NFT Function", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,15,"c/");
//       const uri= await MintsclubProxy.uri(1);
//       expect(uri).to.equal("c/");
//       console.log("URI : ",uri);
//               //calling Edit Nft function to change uri
//       await MintsclubProxy.connect(otherAccount).EditNft(1,"changed/");
//       console.log("changed uri: ",await MintsclubProxy.uri(1));
//     });

//     it("should fail Edit NFT Function", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//                   //As TokenId doesnt Exist
//       await expect(MintsclubProxy.connect(otherAccount).EditNft(1,"changed/")).to.be.reverted;
      
//     });

//     /////Batch Minting
//     it("check Batch Mint function", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mintBatch(otherAccount.address,[10,15,20],["j/","k/","L"]);
//     });

//     it("should not working with different no. of parameters ", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await expect(MintsclubProxy.mintBatch(otherAccount.address,[10,15,20],["j/","k/"])).to.be.reverted;
//     });

//     it("check URI after Batch Mint", async function(){
//       const {MintsclubProxy, owner, otherAccount, mint} = await loadFixture(deployContract);
//       await MintsclubProxy.mintBatch(otherAccount.address,[10,15,20],["j/","k/","L"]);
//       const uri = await MintsclubProxy.uri(2);
//       console.log("batch mint uri: ", uri);
//     });


//     it("change URI using EditNFT after Batch Mint", async function(){
//       const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//       await MintsclubProxy.mintBatch(otherAccount.address,[10,15,20],["j/","k/","L"]);
//       const uri = await MintsclubProxy.uri(2);
//       console.log("batch mint uri: ", uri);
//       const changedURI= "changedId2";
//       await MintsclubProxy.connect(otherAccount).EditNft(2, changedURI);
//       expect(await MintsclubProxy.uri(2)).to.equal(changedURI);
      
//     });

// ///Transfer functions

//     it("Nft Owner can Transfer Nft", async function(){
//       const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,10,"a/");
//       console.log("sender",MintsclubProxy.address);
//      const Tx= await MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, 1, 7, "0x00");
//       expect(Tx).to.be.ok;
//       console.log("Sender Address ",Tx?.to);
//       //  expect(Tx?.from).to.equal(otherAccount.address);
//       const Tx1= await Tx.wait()
//        for (const event of Tx1.events) {
//           console.log(`Event ${event.event} with args ${event.args[2]}`);
//         }
//     });

//     it("Nft non-Owner can not Transfer Nft", async function(){
//       const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(owner.address,10,"a/"); //minted to owner.address
     
//       await expect(MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, 1, 7, "0x00")).to.be.reverted;
     
//     });

//     it("Nft Owner can not Transfer more Nfts than balance", async function(){
//       const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,10,"a/");
//       console.log("sender",MintsclubProxy.address);
//      await expect(MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, 1, 11, "0x00"))
//      .to.be.reverted;

//     });


//     it("check if balance changes afer NFT Transfer ", async function(){
//       const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//       await MintsclubProxy.mint(otherAccount.address,10,"f/"); //minted to owner.address
//      console.log ("Before transfer",await MintsclubProxy.balanceOf(owner.address,1));
//       await MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, 1, 7, "0x00");
//       await expect(await MintsclubProxy.balanceOf(owner.address,1)).to.equal(7);
     
//     });

// //Batch Transfer
// it("Nft Owner can Transfer Nft", async function(){
//   const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//   await MintsclubProxy.mintBatch(otherAccount.address,[10,15],["a/","b/"]);
  
//  const Tx = await MintsclubProxy.connect(otherAccount).safeBatchTransferFrom(otherAccount.address, owner.address, [1,2], [7,8], "0x00");
//    await expect(Tx).to.be.ok;
  
// });

// it("Nft non-Owner can not Transfer Nft", async function(){
//   const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);

//   console.log("Balance:", await MintsclubProxy.balanceOf(otherAccount.address,1));
//  //const Tx= MintsclubProxy.connect(otherAccount).safeBatchTransferFrom(otherAccount.address, owner.address, [1,2], [7,6], "0x00");
//    await expect(MintsclubProxy.connect(otherAccount).safeBatchTransferFrom(otherAccount.address, owner.address, [1,2], [7,6], "0x00")).to.be.rejected;//With("ERC1155: insufficient balance for transfer");
 
// });

// it("Nft Owner can not Transfer more Nfts than balance", async function(){
//   const {MintsclubProxy, owner, otherAccount} = await loadFixture(deployContract);
//   await MintsclubProxy.mintBatch(otherAccount.address,[10,15],["a/","b/"]);
//   console.log("sender",MintsclubProxy.address);
//    //await MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, [1,2], [11,15], "0x00");
//   // await expect(MintsclubProxy.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, [1,2], [11,15], "0x00")).to.be.ok;

// });


//   })
// })