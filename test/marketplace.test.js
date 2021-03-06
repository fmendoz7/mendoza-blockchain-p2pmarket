var Marketplace = artifacts.require('Marketplace');

contract('Marketplace', (accounts) => {
  // NOTE: Because Alice is the first index of the accounts array, the Marketplace contract is always going to be
  // deployed from her account during these tests
  const alice = accounts[0];
  const bob = accounts[1];
  const charlie = accounts[2];

  /*---------------------------------------------------------------------------------------------------------------------*/
  it('TEST #1: Instantiate user as admin and owner of the marketplace', async () => {
    const instance = await Marketplace.deployed();
    const result = await instance.admins(alice);
    const marketplaceOwner = await instance.owner();

    assert.isTrue(result, 'LOG: alice is admin');
    assert.isTrue(marketplaceOwner === alice, 'LOG: alice is marketplace owner')
  })
  /*---------------------------------------------------------------------------------------------------------------------*/
  it('TEST #2: Successfully add and revoke an admin user', async () => {
    const instance = await Marketplace.deployed();

    await instance.addAdmin(bob);
    const addAdmin = await instance.admins(bob);

    await instance.removeAdmin(bob);
    const removeAdmin = await instance.admins(bob);

    assert.isTrue(addAdmin, 'LOG: bob is admin');
    assert.isFalse(removeAdmin, 'LOG: bob admin privileges revoked');
  })
/*---------------------------------------------------------------------------------------------------------------------*/   
  it('TEST #3: Users with non-admin privileges cannot take admin actions nor mod admin fields', async () => {
    const instance = await Marketplace.deployed();

    //Scenario #1: Malicious regular user (Charlie) cannot add address to admin Bob
    try {
      await instance.addAdmin(bob, { from: charlie });
    } 
    
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `LOG: Expected "revert", got ${error} instead`);
    }

    //Scenario #2: Malicious regular user (Charlie) cannot add addresses to store owner Bob
    try {
      await instance.addStoreOwner(bob, { from: charlie });
    } 
    
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `LOG: Expected "revert", got ${error} instead`);
      return;
    }

    assert.fail('LOG: Expected revert not received');
  })
/*---------------------------------------------------------------------------------------------------------------------*/
  it('TEST #4: Other admins cannot revoke OWNER admin privileges', async () => {
    const instance = await Marketplace.deployed();

    try {
      await instance.addAdmin(bob);
      await instance.removeAdmin(alice, { from: bob });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `LOG: Expected "revert", got ${error} instead`);
      return;
    }

    assert.fail('LOG: Expected revert not received');
  })
/*---------------------------------------------------------------------------------------------------------------------*/
  it('TEST #5: Can add and remove a store owner', async () => {
    const instance = await Marketplace.deployed();

    await instance.addStoreOwner(bob);
    const addStoreOwner = await instance.storeOwners(bob);

    await instance.removeStoreOwner(bob);
    const removeStoreOwner = await instance.storeOwners(bob);

    assert.isTrue(addStoreOwner, 'LOG: bob granted owner privileges');
    assert.isFalse(removeStoreOwner, 'LOG: bob owner privileges revoked');
  })
/*---------------------------------------------------------------------------------------------------------------------*/

})
