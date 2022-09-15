const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  
  const { expect, reverted, assert } = require("chai");
  const { Minimatch } = require("minimatch");
const { ethers } = require("hardhat");
const Web3 = require('web3');
  
  describe("MintsclubProxy", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deployContract() {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount, buyer,buyer2] = await ethers.getSigners();
    
      var web3 = new Web3('http://localhost:8545'); 
//      const web3 = new Web3( "http:127.0.0.1:8545/");
      const NFTMinter = await ethers.getContractFactory("NFTMinter");
      const nftMinter = await NFTMinter.deploy("myNft");
      //deploy Tradeable
      const Tradeable = await ethers.getContractFactory("Tradeable");
      const tradeable = await Tradeable.deploy();
      return {nftMinter,tradeable,owner, otherAccount,web3,buyer,buyer2};
    }
    describe("Deployment",  function () {

        it("Should set the marketplace owner ", async function () {
          const{tradeable, owner} = await loadFixture(deployContract);
          expect(await tradeable.MarketPlaceOwner()).to.equal(owner.address);
        });

        it("Should set the plateform service fee ", async function () {
            const{tradeable, owner} = await loadFixture(deployContract);
            const fee = 250;
            expect(await tradeable.PlatFormServiceFee()).to.equal(fee);
          });

        
          it("Should change the plateform service fee ", async function () {
            const{tradeable, owner} = await loadFixture(deployContract);
            const fee = 300;
            await tradeable.setPlatFormServiceFee(fee);
            expect(await tradeable.PlatFormServiceFee()).to.equal(fee);
            console.log("service fee:", await tradeable.PlatFormServiceFee());
          });

          it("Should calculate the plateform service fee ", async function () {
            const{tradeable, owner} = await loadFixture(deployContract);
            await tradeable.setPlatFormServiceFee(250);
            const fee = await tradeable.PlatFormServiceFee();
            const calfee= await tradeable.calulatePlatFormServiceFee(1000, fee);
           // expect(fee).to.equal(fee);
            console.log("calculated service fee:", calfee);
          });

          it("Should calculate the royalty", async function () {
            const{tradeable, owner} = await loadFixture(deployContract);
            await tradeable.setPlatFormServiceFee(250);
            const fee = await tradeable.PlatFormServiceFee();
            const calfee= await tradeable.calculateRoyaltyFee(1000, fee);
           // expect(fee).to.equal(fee);
            console.log("calculated royalty fee:", calfee);
          });
///Testing FixedPrice Sale
          it("should mint the token and list item for fixed price ", async function(){
            const{tradeable, owner,nftMinter, otherAccount} = await loadFixture(deployContract);
            await nftMinter.mint(otherAccount.address,5,"a/");
            console.log(await nftMinter.balanceOf(otherAccount.address,1));
        await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);

            const list= await tradeable.connect(otherAccount).listItemForFixedPrice(1,2,1000000000000000,250, nftMinter.address,otherAccount.address);
            await expect(list).to.be.ok;
          })

          it("should mint the token and list item for fixed price and buy too ", async function(){
            const{tradeable, owner,nftMinter, otherAccount} = await loadFixture(deployContract);
            //minting
            await nftMinter.mint(otherAccount.address,5,"a/");
            console.log(await nftMinter.balanceOf(otherAccount.address,1));
            await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
                //listing
            const list= await tradeable.connect(otherAccount).listItemForFixedPrice(1,2,100000000000000,250, nftMinter.address,otherAccount.address);
            await expect(list).to.be.ok;
            console.log(await tradeable.Fixedprices.length); // for itemID.

                //buying
                const buy= await tradeable.BuyFixedPriceItem(0,{value: 100000000000000 });
               await expect(buy).to.be.ok;
          })

          it("should not list without Minting ", async function(){
            const{tradeable, owner,nftMinter, otherAccount} = await loadFixture(deployContract);
            //minting
            //await nftMinter.mint(otherAccount.address,5,"a/");
            console.log(await nftMinter.balanceOf(otherAccount.address,1));
            await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
                //listing
                try {
                    const list=  await tradeable.connect(otherAccount).listItemForFixedPrice(1,2,1000000000000000,250, nftMinter.address,otherAccount.address);
                  
                  } catch (err) {
                    await expect(await err).to.be.ok;
                    
                  }
          })

          it("check change in balance after buying", async function(){
            const{tradeable, owner,nftMinter,web3, otherAccount} = await loadFixture(deployContract);
                //Minting
            await nftMinter.mint(otherAccount.address,5,"a/");

            await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
                //Listing
            const list= await tradeable.connect(otherAccount).listItemForFixedPrice(1,2,100000000000000,250, nftMinter.address,otherAccount.address);
            await expect(list).to.be.ok;
            console.log(await tradeable.Fixedprices.length); // for itemID.

                //Buying
                const buy= await tradeable.connect(owner).BuyFixedPriceItem(0,{value: 100000000000000 });
               await expect(buy).to.be.ok;
               
                //Balance check after buying
               await expect(await nftMinter.balanceOf(otherAccount.address,1)).to.equal(3);
               await expect(await nftMinter.balanceOf(owner.address,1)).to.equal(2);
          })


        //   it("check if royalty goes to the address ", async function(){
        //     const{tradeable, owner,web3,nftMinter, otherAccount,buyer} = await loadFixture(deployContract);
        //     //minting
        //     await nftMinter.mint(otherAccount.address,5,"a/");
        //     console.log(await nftMinter.balanceOf(otherAccount.address,1));
        //     await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
        //         //listing
        //     const list= await tradeable.connect(otherAccount).listItemForFixedPrice(1,2,100000000000000,250, nftMinter.address,owner.address);
        //     await expect(list).to.be.ok;
        //     console.log(await tradeable.Fixedprices.length); // for itemID.

        //         //buying
        //         const before = await web3.eth.getBalance(buyer.address);
        //         console.log("befor: ",before);
        //         const buy= await tradeable.connect(buyer).BuyFixedPriceItem(0,{value: 100000000000000 });
        //         await expect(buy).to.be.ok;
        //         const after =await web3.eth.getBalance(buyer.address);
        //         console.log("After: ",after);
        //         await expect(before).to.equal(after);
        //   })

////Testing Auction        
        //   it("should mint the token and list item for Auction  ", async function(){
        //     const{tradeable, owner,nftMinter, otherAccount} = await loadFixture(deployContract);
        //     await nftMinter.mint(otherAccount.address,5,"a/");
        //     console.log(await nftMinter.balanceOf(otherAccount.address,1));
        //     await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
        //     await tradeable.connect(otherAccount).listItemForAuction(1000000000000000,1662718964, 1662728964,250,1,3, nftMinter.address,owner.address);
        //   })

        //   it("should bid for the item on Auction  ", async function(){
        //     const{tradeable, owner,nftMinter, otherAccount,buyer} = await loadFixture(deployContract);
        //     await nftMinter.mint(otherAccount.address,5,"a/");
        //     const sleep = ms => new Promise(r => setTimeout(r, ms));
        //     console.log(await nftMinter.balanceOf(otherAccount.address,1));
        //     await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
        //     await tradeable.connect(otherAccount).listItemForAuction(1000000000000000,1662719820, 1662719880,250,1,3, nftMinter.address,owner.address);
        //     await sleep(35000);
        //     //bidding
        //     try {await tradeable.connect(buyer).bid(0,{value:1000000000000000});
        //   }catch(error){
        //       await expect(await error).to.be.rejected;
        //       console.log(error);
        //   }
        //   })

        //   it("should not bid with the amount less than previous bid ", async function(){
        //     const{tradeable, owner,nftMinter, otherAccount,buyer} = await loadFixture(deployContract);
        //     await nftMinter.mint(otherAccount.address,5,"a/");
        //     const sleep = ms => new Promise(r => setTimeout(r, ms));
            
        //     console.log(await nftMinter.balanceOf(otherAccount.address,1));
        //     await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
        //     await tradeable.connect(otherAccount).listItemForAuction(1000000000000000,1662720300, 1662720600,250,1,3, nftMinter.address,owner.address);
        //     //bidding
        //     await sleep(35000);
        //     try {await tradeable.connect(buyer).bid(0,{value:1000000000000000});
        //   }catch(error){
        //       await expect(await err).to.be.reverted;
        //   }
        //   console.log("/////first bid done/////");
        //   try{
        //       await tradeable.connect(owner).bid(0,{value: 100000000000000});
        //   }catch(error){
        //       await expect(await error).to.be.ok;
        //       console.log(error);
        //   }
        //   })

          // it("should list item for Auction and remove listing  ", async function(){
          //   const{tradeable, owner,nftMinter, otherAccount} = await loadFixture(deployContract);
          //   const sleep = ms => new Promise(r => setTimeout(r, ms));
          //   await nftMinter.mint(otherAccount.address,5,"a/");
          //   console.log(await nftMinter.balanceOf(otherAccount.address,1));
          //   await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
          //   await tradeable.connect(otherAccount).listItemForAuction(1000000000000000,1662721680, 1662722680,250,1,3, nftMinter.address,owner.address);
          //   await sleep(35000);
          //   await tradeable.connect(otherAccount).auctionEnd(0);
          // })

        //   it("should be able to claim nft after bidding time over ", async function(){
        //     const{tradeable, owner,nftMinter, otherAccount,buyer,buyer2} = await loadFixture(deployContract);
        //     const sleep = ms => new Promise(r => setTimeout(r, ms));
        //     await nftMinter.mint(otherAccount.address,5,"a/");
        //     console.log(await nftMinter.balanceOf(otherAccount.address,1));
        //     await nftMinter.connect(otherAccount).setApprovalForAll(tradeable.address,true);
        //     await tradeable.connect(otherAccount).listItemForAuction(1000000000000000,1663005940, 1663005955,250,1,3, nftMinter.address,owner.address);
        //     await sleep(20000);
        //     try 
        //     {await tradeable.connect(buyer).bid(0,{value:1000000000000000});
        //    }catch(error){
        //        console.log(error);
        //   }
        //   console.log("///////1st Bid done");
        //   try 
        //   {await tradeable.connect(buyer2).bid(0,{value:2000000000000000});
        //  }catch(error){
        //   console.log(error);
        // }

        // await sleep(15000);
        // console.log("/////////2nd bid done");
        // //await sleep(10000);
        //     await tradeable.connect(buyer2).claimNft(0);
        //   })
    })
})