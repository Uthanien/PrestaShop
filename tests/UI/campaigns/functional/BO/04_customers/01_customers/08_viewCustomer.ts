import testContext from '@utils/testContext';
import {expect} from 'chai';

import {
  boAddressesCreatePage,
  boCustomersPage,
  boCustomersCreatePage,
  boCustomersViewPage,
  boDashboardPage,
  boLoginPage,
  boOrdersViewBlockCustomersPage,
  boShoppingCartsViewPage,
  type BrowserContext,
  dataLanguages,
  dataOrderStatuses,
  dataPaymentMethods,
  dataProducts,
  FakerAddress,
  FakerCustomer,
  foClassicCartPage,
  foClassicCheckoutPage,
  foClassicCheckoutOrderConfirmationPage,
  foClassicHomePage,
  foClassicProductPage,
  type Page,
  utilsDate,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_customers_customers_viewCustomer';

/*
Create customer
View customer
Create order
View customer after creating the order
Edit customer then check customer information page
Edit order then check customer information page
Edit address then check customer information page
View carts page
Delete customer
 */
describe('BO - Customers - Customers : View information about customer', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfCustomers: number = 0;

  const today: string = utilsDate.getDateFormat('mm/dd/yyyy');
  // Init data
  const createCustomerData: FakerCustomer = new FakerCustomer({defaultCustomerGroup: 'Customer'});
  const editCustomerData: FakerCustomer = new FakerCustomer({defaultCustomerGroup: 'Visitor'});
  const address: FakerAddress = new FakerAddress({city: 'Paris', country: 'France'});
  const createAddressData: FakerAddress = new FakerAddress({country: 'France'});

  // Get customer birthdate format 'mm/dd/yyyy'
  const mmBirth: string = `0${createCustomerData.monthOfBirth}`.slice(-2);
  const ddBirth: string = `0${createCustomerData.dayOfBirth}`.slice(-2);
  const yyyyBirth: string = createCustomerData.yearOfBirth;
  const customerBirthDate: string = `${mmBirth}/${ddBirth}/${yyyyBirth}`;

  const mmEditBirth: string = `0${editCustomerData.monthOfBirth}`.slice(-2);
  const ddEditBirth: string = `0${editCustomerData.dayOfBirth}`.slice(-2);
  const yyyyEditBirth: string = editCustomerData.yearOfBirth;
  const editCustomerBirthDate: string = `${mmEditBirth}/${ddEditBirth}/${yyyyEditBirth}`;

  const createCustomerName: string = `${createCustomerData.firstName[0]}. ${createCustomerData.lastName}`;
  const editCustomerName: string = `${editCustomerData.firstName[0]}. ${editCustomerData.lastName}`;

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).to.contains(boDashboardPage.pageTitle);
  });

  it('should go to \'Customers > Customers\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCustomersPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.customersParentLink,
      boDashboardPage.customersLink,
    );
    await boCustomersPage.closeSfToolBar(page);

    const pageTitle = await boCustomersPage.getPageTitle(page);
    expect(pageTitle).to.contains(boCustomersPage.pageTitle);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetAllFilter', baseContext);

    numberOfCustomers = await boCustomersPage.resetAndGetNumberOfLines(page);
    expect(numberOfCustomers).to.be.above(0);
  });

  // 1 : Create customer
  describe('Create customer in BO', async () => {
    it('should go to add new customer page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewCustomerPage', baseContext);

      await boCustomersPage.goToAddNewCustomerPage(page);

      const pageTitle = await boCustomersCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersCreatePage.pageTitleCreate);
    });

    it('should create customer and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createCustomer', baseContext);

      const textResult = await boCustomersCreatePage.createEditCustomer(page, createCustomerData);
      expect(textResult).to.equal(boCustomersPage.successfulCreationMessage);

      const numberOfCustomersAfterCreation = await boCustomersPage.getNumberOfElementInGrid(page);
      expect(numberOfCustomersAfterCreation).to.be.equal(numberOfCustomers + 1);
    });
  });

  // 2 : View customer
  describe('View customer created', async () => {
    it(`should filter list by email '${createCustomerData.email}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToViewCreatedCustomer', baseContext);

      await boCustomersPage.resetFilter(page);
      await boCustomersPage.filterCustomers(
        page,
        'input',
        'email',
        createCustomerData.email,
      );

      const textEmail = await boCustomersPage.getTextColumnFromTableCustomers(page, 1, 'email');
      expect(textEmail).to.contains(createCustomerData.email);
    });

    it('should click on view customer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToViewCustomerPageAfterCreateCustomer', baseContext);

      await boCustomersPage.goToViewCustomerPage(page, 1);

      const pageTitle = await boCustomersViewPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersViewPage.pageTitle(createCustomerName));
    });

    it('should check personal information title', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPersonalInformationTitle1', baseContext);

      const cardHeaderText = await boCustomersViewPage.getPersonalInformationTitle(page);
      expect(cardHeaderText).to.contains(createCustomerData.firstName);
      expect(cardHeaderText).to.contains(createCustomerData.lastName);
      expect(cardHeaderText).to.contains(createCustomerData.email);
    });

    it('should check customer personal information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkCreatedCustomerInfo1', baseContext);

      const cardHeaderText = await boCustomersViewPage.getTextFromElement(page, 'Personal information');
      expect(cardHeaderText).to.contains(createCustomerData.socialTitle);
      expect(cardHeaderText).to.contains(`birth date: ${customerBirthDate}`);
      expect(cardHeaderText).to.contains('Never');
      expect(cardHeaderText).to.contains(dataLanguages.english.name);
      expect(cardHeaderText).to.contains('Newsletter');
      expect(cardHeaderText).to.contains('Partner offers');
      expect(cardHeaderText).to.contains('Active');
    });

    [
      {args: {blockName: 'Orders', number: 0}},
      {args: {blockName: 'Carts', number: 0}},
      {args: {blockName: 'Messages', number: 0}},
      {args: {blockName: 'Vouchers', number: 0}},
      {args: {blockName: 'Groups', number: 1}},
    ].forEach((test) => {
      it(`should check ${test.args.blockName} number`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `check${test.args.blockName}Number`, baseContext);

        const cardHeaderText = await boCustomersViewPage.getNumberOfElementFromTitle(page, test.args.blockName);
        expect(cardHeaderText).to.contains(test.args.number);
      });
    });
  });

  // 3 : Create order
  describe('Create order in FO', async () => {
    it('should view my shop', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'viewMyShop', baseContext);

      // Click on view my shop
      page = await boCustomersViewPage.viewMyShop(page);
      // Change language
      await foClassicHomePage.changeLanguage(page, 'en');

      const isHomePage = await foClassicHomePage.isHomePage(page);
      expect(isHomePage, 'Fail to open FO home page').to.eq(true);
    });

    it('should add the first product to the cart', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addFirstProductToCart', baseContext);

      // Go to the first product page
      await foClassicHomePage.goToProductPage(page, 1);
      // Add the product to the cart
      await foClassicProductPage.addProductToTheCart(page);

      const notificationsNumber = await foClassicCartPage.getCartNotificationsNumber(page);
      expect(notificationsNumber).to.be.equal(1);
    });

    it('should proceed to checkout', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'proceedToCheckout', baseContext);

      // Proceed to checkout the shopping cart
      await foClassicCartPage.clickOnProceedToCheckout(page);

      const isCheckoutPage = await foClassicCheckoutPage.isCheckoutPage(page);
      expect(isCheckoutPage).to.eq(true);
    });

    it('should login and go to address step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'loginToFO', baseContext);

      await foClassicCheckoutPage.clickOnSignIn(page);

      const isStepLoginComplete = await foClassicCheckoutPage.customerLogin(page, createCustomerData);
      expect(isStepLoginComplete, 'Step Personal information is not complete').to.eq(true);
    });

    it('should create address then continue to delivery step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createAddress', baseContext);

      const isStepAddressComplete = await foClassicCheckoutPage.setAddress(page, address);
      expect(isStepAddressComplete, 'Step Address is not complete').to.eq(true);
    });

    it('should add a comment then continue to payment step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToPaymentStep', baseContext);

      const isStepDeliveryComplete = await foClassicCheckoutPage.chooseShippingMethodAndAddComment(
        page,
        1,
        'test message',
      );
      expect(isStepDeliveryComplete, 'Step Address is not complete').to.eq(true);
    });

    it('should choose the payment method and confirm the order', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'choosePaymentMethod', baseContext);

      await foClassicCheckoutPage.choosePaymentAndOrder(page, dataPaymentMethods.wirePayment.moduleName);

      // Check the confirmation message
      const cardTitle = await foClassicCheckoutOrderConfirmationPage.getOrderConfirmationCardTitle(page);
      expect(cardTitle).to.contains(foClassicCheckoutOrderConfirmationPage.orderConfirmationCardTitle);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackToBo', baseContext);

      page = await foClassicCheckoutOrderConfirmationPage.closePage(browserContext, page, 0);

      const pageTitle = await boCustomersViewPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersViewPage.pageTitle(createCustomerName));
    });
  });

  // 4 : View customer after creating the order
  describe('View customer after creating the order', async () => {
    it('should go to \'Customers > Customers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToViewCustomersPage', baseContext);

      await boCustomersViewPage.goToSubMenu(
        page,
        boCustomersViewPage.customersParentLink,
        boCustomersViewPage.customersLink,
      );

      const pageTitle = await boCustomersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersPage.pageTitle);
    });

    it(`should filter list by email '${createCustomerData.email}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToViewCustomer', baseContext);

      await boCustomersPage.resetFilter(page);
      await boCustomersPage.filterCustomers(page, 'input', 'email', createCustomerData.email);

      const textEmail = await boCustomersPage.getTextColumnFromTableCustomers(page, 1, 'email');
      expect(textEmail).to.contains(createCustomerData.email);
    });

    it('should click on view customer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToViewCustomerPageAfterCreateOrder', baseContext);

      await boCustomersPage.goToViewCustomerPage(page, 1);

      const pageTitle = await boCustomersViewPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersViewPage.pageTitle(createCustomerName));
    });

    it('should check personal information title', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPersonalInformationTitle2', baseContext);

      const cardHeaderText = await boCustomersViewPage.getPersonalInformationTitle(page);
      expect(cardHeaderText).to.contains(createCustomerData.firstName);
      expect(cardHeaderText).to.contains(createCustomerData.lastName);
      expect(cardHeaderText).to.contains(createCustomerData.email);
    });

    it('should check customer personal information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkCreatedCustomerInfo2', baseContext);

      const cardHeaderText = await boCustomersViewPage.getTextFromElement(page, 'Personal information');
      expect(cardHeaderText).to.contains(createCustomerData.socialTitle);
      expect(cardHeaderText).to.contains(`birth date: ${customerBirthDate}`);
      expect(cardHeaderText).to.contains(today);
      expect(cardHeaderText).to.contains(dataLanguages.english.name);
      expect(cardHeaderText).to.contains('Newsletter');
      expect(cardHeaderText).to.contains('Partner offers');
      expect(cardHeaderText).to.contains('Active');
    });

    [
      {args: {blockName: 'Orders', number: 1}},
      {args: {blockName: 'Carts', number: 1}},
      {args: {blockName: 'Purchased products', number: 1}},
      {args: {blockName: 'Messages', number: 1}},
      {args: {blockName: 'Vouchers', number: 0}},
      {args: {blockName: 'Last emails', number: 2}},
      {args: {blockName: 'Last connections', number: 1}},
      {args: {blockName: 'Groups', number: 1}},
    ].forEach((test) => {
      it(`should check ${test.args.blockName} number`, async function () {
        await testContext.addContextItem(
          this, 'testIdentifier', `check${test.args.blockName}NumberAfterEdit`, baseContext,
        );

        const cardHeaderText = await boCustomersViewPage.getNumberOfElementFromTitle(page, test.args.blockName);
        expect(cardHeaderText).to.contains(test.args.number);
      });
    });

    it('should check orders', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkOrders', baseContext);

      const carts = await boCustomersViewPage.getTextFromElement(page, 'Orders');
      expect(carts).to.contains(today);
      expect(carts).to.contains('Bank transfer');
      expect(carts).to.contains(dataOrderStatuses.awaitingBankWire.name);
      expect(carts).to.contains('€0.00');
    });

    it('should check carts', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkCarts', baseContext);

      const carts = await boCustomersViewPage.getTextFromElement(page, 'Carts');
      expect(carts).to.contains(today);
      expect(carts).to.contains(dataProducts.demo_1.finalPrice);
    });

    it('should check purchased products', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPurchasedProduct1', baseContext);

      const viewedProduct = await boCustomersViewPage.getTextFromElement(page, 'Purchased products');
      expect(viewedProduct).to.contains(dataProducts.demo_1.name);
    });

    it('should check address', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkAddress', baseContext);

      const customerAddress = await boCustomersViewPage.getTextFromElement(page, 'Addresses');
      expect(customerAddress).to.contains(address.company);
      expect(customerAddress).to.contains(`${createCustomerData.firstName} ${createCustomerData.lastName}`);
      expect(customerAddress).to.contains(address.address);
      expect(customerAddress).to.contains(address.country);
      expect(customerAddress).to.contains(address.phone);
    });

    it('should check messages', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkMessages', baseContext);

      const carts = await boCustomersViewPage.getTextFromElement(page, 'Messages');
      expect(carts).to.contains(today);
      expect(carts).to.contains('Open');
      expect(carts).to.contains('test message');
    });

    it('should check last connections', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkLAstConnections', baseContext);

      const carts = await boCustomersViewPage.getTextFromElement(page, 'Last connections');
      expect(carts).to.contains(today);
    });

    it('should check groups', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkGroups', baseContext);

      const groups = await boCustomersViewPage.getTextFromElement(page, 'Groups');
      expect(groups).to.contains(createCustomerData.defaultCustomerGroup);
    });

    it('should add a private note', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addPrivateNote', baseContext);

      const result = await boCustomersViewPage.setPrivateNote(page, 'Test note');
      expect(result).to.contains(boCustomersViewPage.successfulUpdateMessage);
    });
  });

  // 5 : Edit customer then check customer information page
  describe('Edit customer then view it and check information', async () => {
    it('should go to edit customer page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToEditCustomerPage', baseContext);

      await boCustomersViewPage.goToEditCustomerPage(page);

      const pageTitle = await boCustomersCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersCreatePage.pageTitleEdit);
    });

    it('should edit customer information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateCustomer', baseContext);

      const textResult = await boCustomersCreatePage.createEditCustomer(page, editCustomerData);
      expect(textResult).to.equal(boCustomersViewPage.successfulUpdateMessage);
    });

    it('should check personal information title', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkUpdatedCustomerTitle', baseContext);

      const cardHeaderText = await boCustomersViewPage.getPersonalInformationTitle(page);
      expect(cardHeaderText).to.contains(editCustomerData.firstName);
      expect(cardHeaderText).to.contains(editCustomerData.lastName);
      expect(cardHeaderText).to.contains(editCustomerData.email);
    });

    it('should check customer personal information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkUpdatedCustomerInfo', baseContext);

      const cardHeaderText = await boCustomersViewPage.getTextFromElement(page, 'Personal information');
      expect(cardHeaderText).to.contains(editCustomerData.socialTitle);
      expect(cardHeaderText).to.contains(`birth date: ${editCustomerBirthDate}`);
      expect(cardHeaderText).to.contains(today);
      expect(cardHeaderText).to.contains(dataLanguages.english.name);
      expect(cardHeaderText).to.contains('Newsletter');
      expect(cardHeaderText).to.contains('Partner offers');
      expect(cardHeaderText).to.contains('Active');
    });

    it('should check groups', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkGroupsAfterEdit', baseContext);

      const groups = await boCustomersViewPage.getTextFromElement(page, 'Groups');
      expect(groups).to.contains(editCustomerData.defaultCustomerGroup);
    });
  });

  // 6 : Edit order then check customer information page
  describe('Edit order then view customer and check information', async () => {
    it('should go to view order page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToorderPageCustomerBlock', baseContext);

      await boCustomersViewPage.goToPage(page, 'Orders');

      const pageTitle = await boOrdersViewBlockCustomersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrdersViewBlockCustomersPage.pageTitle);
    });

    it('should modify order status', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'modifyOrderStatus', baseContext);

      const result = await boOrdersViewBlockCustomersPage.modifyOrderStatus(page, dataOrderStatuses.shipped.name);
      expect(result).to.equal(dataOrderStatuses.shipped.name);
    });

    it('should go to \'Customers > Customers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCustomersPageAfterEditOrder', baseContext);

      await boOrdersViewBlockCustomersPage.goToSubMenu(
        page,
        boOrdersViewBlockCustomersPage.customersParentLink,
        boOrdersViewBlockCustomersPage.customersLink,
      );

      const pageTitle = await boCustomersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersPage.pageTitle);
    });

    it(`should filter list by email '${editCustomerData.email}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToViewCustomerAfterEditOrder', baseContext);

      await boCustomersPage.resetFilter(page);
      await boCustomersPage.filterCustomers(page, 'input', 'email', editCustomerData.email);

      const textEmail = await boCustomersPage.getTextColumnFromTableCustomers(page, 1, 'email');
      expect(textEmail).to.contains(editCustomerData.email);
    });

    it('should click on view customer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToViewCustomerPageAfterEditOrder', baseContext);

      await boCustomersPage.goToViewCustomerPage(page, 1);

      const pageTitle = await boCustomersViewPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersViewPage.pageTitle(editCustomerName));
    });

    it('should check order status', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'CheckOrderStatusAfterEdit', baseContext);

      const carts = await boCustomersViewPage.getTextFromElement(page, 'Orders');
      expect(carts).to.contains(today);
      expect(carts).to.contains('Bank transfer');
      expect(carts).to.contains(dataOrderStatuses.shipped.name);
      expect(carts).to.contains(dataProducts.demo_1.finalPrice);
    });

    it('should check purchased products number', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'CheckPurchasedProductsNumber', baseContext);

      const cardHeaderText = await boCustomersViewPage.getNumberOfElementFromTitle(page, 'Purchased products');
      expect(cardHeaderText).to.contains(1);
    });

    it('should check purchased products', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPurchasedProduct', baseContext);

      const purchasedProduct = await boCustomersViewPage.getTextFromElement(page, 'Purchased products');
      expect(purchasedProduct).to.contains(today);
      expect(purchasedProduct).to.contains(dataProducts.demo_1.name);
    });
  });

  // 7 : Edit address then check customer information page
  describe('Edit address then view customer and check address', async () => {
    it('should go to edit address page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToEditAddressPage', baseContext);

      await boCustomersViewPage.goToPage(page, 'Addresses');

      const pageTitle = await boAddressesCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boAddressesCreatePage.pageTitleEdit);
    });

    it('should modify the address', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateAddress', baseContext);

      const textResult = await boAddressesCreatePage.createEditAddress(page, createAddressData);
      expect(textResult).to.equal(boCustomersViewPage.updateSuccessfulMessage);
    });

    it('should check the edited address', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'CheckEditedAddress', baseContext);

      const customerAddress = await boCustomersViewPage.getTextFromElement(page, 'Addresses');
      expect(customerAddress).to.contains(createAddressData.company);
      expect(customerAddress).to.contains(`${createAddressData.firstName} ${createAddressData.lastName}`);
      expect(customerAddress).to.contains(createAddressData.address);
      expect(customerAddress).to.contains(createAddressData.country);
      expect(customerAddress).to.contains(createAddressData.phone);
    });
  });

  // 8 : View cart page
  describe('View cart page', async () => {
    it('should go to view cart page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToViewCartPage', baseContext);

      const idCart = await boCustomersViewPage.getTextColumnFromTableCarts(page, 'id_cart', 1);

      await boCustomersViewPage.goToPage(page, 'Carts');

      const pageTitle = await boShoppingCartsViewPage.getPageTitle(page);
      expect(pageTitle).to.contains(boShoppingCartsViewPage.pageTitle(idCart));
    });
  });

  // 9 : Delete customer from BO
  describe('Delete customer', async () => {
    it('should go to \'Customers > Customers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCustomersPageToDelete', baseContext);

      await boShoppingCartsViewPage.goToSubMenu(
        page,
        boShoppingCartsViewPage.customersParentLink,
        boShoppingCartsViewPage.customersLink,
      );

      const pageTitle = await boCustomersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCustomersPage.pageTitle);
    });

    it(`should filter list by email '${editCustomerData.email}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToDelete', baseContext);

      await boCustomersPage.resetFilter(page);
      await boCustomersPage.filterCustomers(page, 'input', 'email', editCustomerData.email);

      const textEmail = await boCustomersPage.getTextColumnFromTableCustomers(page, 1, 'email');
      expect(textEmail).to.contains(editCustomerData.email);
    });

    it('should delete customer', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteCustomer', baseContext);

      const textResult = await boCustomersPage.deleteCustomer(page, 1);
      expect(textResult).to.equal(boCustomersPage.successfulDeleteMessage);

      const numberOfCustomersAfterDelete = await boCustomersPage.resetAndGetNumberOfLines(page);
      expect(numberOfCustomersAfterDelete).to.be.equal(numberOfCustomers);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetAllFilter2', baseContext);

      numberOfCustomers = await boCustomersPage.resetAndGetNumberOfLines(page);
      expect(numberOfCustomers).to.be.above(0);
    });
  });
});
