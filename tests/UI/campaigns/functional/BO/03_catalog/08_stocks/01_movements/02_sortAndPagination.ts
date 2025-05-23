import testContext from '@utils/testContext';
import {expect} from 'chai';

import {
  boDashboardPage,
  boLoginPage,
  boStockPage,
  boStockMovementsPage,
  type BrowserContext,
  dataProducts,
  type Page,
  utilsCore,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_catalog_stocks_movements_sortAndPagination';

describe('BO - Catalog - Movements : Sort and pagination', async () => {
  let browserContext: BrowserContext;
  let page: Page;

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

  describe('PRE-TEST: Bulk edit the quantity of products in stocks table', async () => {
    it('should go to \'Catalog > Stocks\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToStocksPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.catalogParentLink,
        boDashboardPage.stocksLink,
      );
      await boStockPage.closeSfToolBar(page);

      const pageTitle = await boStockPage.getPageTitle(page);
      expect(pageTitle).to.contains(boStockPage.pageTitle);
    });

    it(`should bulk edit the quantity of the product '${dataProducts.demo_1.name}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkEditQuantity', baseContext);

      await boStockPage.simpleFilter(page, dataProducts.demo_1.name);

      // Update quantity and check successful message
      const updateMessage = await boStockPage.bulkEditQuantityWithInput(page, 301);
      expect(updateMessage).to.contains(boStockPage.successfulUpdateMessage);
    });
  });

  describe('Sort movements table', async () => {
    it('should go to Movements page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToMovementsPage', baseContext);

      await boStockPage.goToSubTabMovements(page);

      const pageTitle = await boStockMovementsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boStockMovementsPage.pageTitle);
    });

    const sortTests = [
      {args: {testIdentifier: 'sortByDateDesc', sortBy: 'date_add', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByDateAsc', sortBy: 'date_add', sortDirection: 'asc'}},
      {
        args: {
          testIdentifier: 'sortByProductIDAsc',
          sortBy: 'product_id',
          sortDirection: 'asc',
          isNumber: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByProductIDDesc',
          sortBy: 'product_id',
          sortDirection: 'desc',
          isNumber: true,
        },
      },
      {args: {testIdentifier: 'sortByProductNameAsc', sortBy: 'product_name', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByProductNameDesc', sortBy: 'product_name', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByReferenceAsc', sortBy: 'reference', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByReferenceDesc', sortBy: 'reference', sortDirection: 'desc'}},
    ];

    sortTests.forEach((test) => {
      it(`should sort by '${test.args.sortBy}' '${test.args.sortDirection}' and check result`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        const nonSortedTable = await boStockMovementsPage.getAllRowsColumnContent(page, test.args.sortBy);

        await boStockMovementsPage.sortTable(page, test.args.sortBy, test.args.sortDirection);

        const sortedTable = await boStockMovementsPage.getAllRowsColumnContent(page, test.args.sortBy);

        if (test.args.isNumber) {
          const nonSortedTableFloat: number[] = nonSortedTable.map((text: string): number => parseInt(text, 10));
          const sortedTableFloat: number[] = sortedTable.map((text: string): number => parseInt(text, 10));

          const expectedResult: number[] = await utilsCore.sortArrayNumber(nonSortedTableFloat);

          if (test.args.sortDirection === 'asc') {
            expect(sortedTableFloat).to.deep.equal(expectedResult);
          } else {
            expect(sortedTableFloat).to.deep.equal(expectedResult.reverse());
          }
        } else {
          const expectedResult: string[] = await utilsCore.sortArray(nonSortedTable);

          if (test.args.sortDirection === 'asc') {
            expect(sortedTable).to.deep.equal(expectedResult);
          } else {
            expect(sortedTable).to.deep.equal(expectedResult.reverse());
          }
        }
      });
    });
  });

  describe('Bulk edit the quantity of products in the 2 pages of stocks table', async () => {
    it('should go to \'Catalog > Stocks\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToStocksPage2', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.catalogParentLink,
        boDashboardPage.stocksLink,
      );

      const pageTitle = await boStockPage.getPageTitle(page);
      expect(pageTitle).to.contains(boStockPage.pageTitle);
    });

    it('should bulk edit the quantity of all products in the first page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkEditQuantityFirstPage', baseContext);

      const updateMessage = await boStockPage.bulkEditQuantityWithInput(page, 301);
      expect(updateMessage).to.contains(boStockPage.successfulUpdateMessage);
    });

    it('should go to the second page and bulk edit the quantity of all products', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToSecondPage', baseContext);

      await boStockPage.paginateTo(page, 2);

      const updateMessage = await boStockPage.bulkEditQuantityWithInput(page, 301);
      expect(updateMessage).to.contains(boStockPage.successfulUpdateMessage);
    });
  });

  describe('Pagination next and previous', async () => {
    it('should go to Movements page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToMovementsPage2', baseContext);

      await boStockPage.goToSubTabMovements(page);

      const pageTitle = await boStockMovementsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boStockMovementsPage.pageTitle);
    });

    it('should go to the next page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToNextPage', baseContext);

      const pageNumber = await boStockMovementsPage.paginateTo(page, 2);
      expect(pageNumber).to.eq(2);
    });

    it('should go back to the first page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackToFirstPage', baseContext);

      const pageNumber = await boStockMovementsPage.paginateTo(page, 1);
      expect(pageNumber).to.eq(1);
    });
  });
});
