import testContext from '@utils/testContext';
import {expect} from 'chai';

import {
  boCartRulesPage,
  boCartRulesCreatePage,
  boDashboardPage,
  boLoginPage,
  type BrowserContext,
  FakerCartRule,
  type Page,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_catalog_discounts_cartRules_filterQuickEditAndBulkActionsCartRules';

/*
Create 2 cart rules
Filter cart rules by id, priority, code, quantity, status
Quick edit first cart rule in list
Enable, disable and delete cart rules by bulk actions
 */
describe('BO - Catalog - Discounts : Filter, quick edit and bulk actions cart rules', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfCartRules: number = 0;

  const firstCartRule: FakerCartRule = new FakerCartRule({
    name: 'todelete1',
    code: '4QABV6I0',
    discountType: 'Percent',
    discountPercent: 20,
  });
  const secondCartRule: FakerCartRule = new FakerCartRule({
    name: 'todelete2',
    code: '3PAJA674',
    discountType: 'Percent',
    discountPercent: 30,
  });

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

  it('should go to \'Catalog > Discounts\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToDiscountsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.catalogParentLink,
      boDashboardPage.discountsLink,
    );

    const pageTitle = await boCartRulesPage.getPageTitle(page);
    expect(pageTitle).to.contains(boCartRulesPage.pageTitle);
  });

  it('should reset and get number of cart rules', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFirst', baseContext);

    numberOfCartRules = await boCartRulesPage.resetAndGetNumberOfLines(page);
    expect(numberOfCartRules).to.be.at.least(0);
  });

  describe('Create 2 cart rules', async () => {
    [firstCartRule, secondCartRule]
      .forEach((cartRuleToCreate: FakerCartRule, index: number) => {
        it('should go to new cart rule page', async function () {
          await testContext.addContextItem(this, 'testIdentifier', `goToNewCartRulePage${index}`, baseContext);

          await boCartRulesPage.goToAddNewCartRulesPage(page);

          const pageTitle = await boCartRulesCreatePage.getPageTitle(page);
          expect(pageTitle).to.contains(boCartRulesCreatePage.pageTitle);
        });

        it('should create new cart rule', async function () {
          await testContext.addContextItem(this, 'testIdentifier', `createCartRule${index}`, baseContext);

          const validationMessage = await boCartRulesCreatePage.createEditCartRules(page, cartRuleToCreate);
          expect(validationMessage).to.contains(boCartRulesCreatePage.successfulCreationMessage);

          const numberOfCartRulesAfterCreation = await boCartRulesPage.getNumberOfElementInGrid(page);
          expect(numberOfCartRulesAfterCreation).to.be.at.most(numberOfCartRules + index + 1);
        });
      });
  });

  describe('Filter cart rules table', async () => {
    const tests = [
      {
        args: {
          testIdentifier: 'filterName', filterType: 'input', filterBy: 'name', filterValue: firstCartRule.name,
        },
      },
      {
        args: {
          testIdentifier: 'filterPriority', filterType: 'input', filterBy: 'priority', filterValue: '1',
        },
      },
      {
        args: {
          testIdentifier: 'filterCode', filterType: 'input', filterBy: 'code', filterValue: firstCartRule.code,
        },
      },
      {
        args: {
          testIdentifier: 'filterQuantity', filterType: 'input', filterBy: 'quantity', filterValue: '1',
        },
      },
      {
        args: {
          testIdentifier: 'filterStatus', filterType: 'select', filterBy: 'active', filterValue: '1',
        },
      },
    ];

    tests.forEach((test) => {
      it(`should filter by ${test.args.filterBy} '${test.args.filterValue}'`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        await boCartRulesPage.filterCartRules(
          page,
          test.args.filterType,
          test.args.filterBy,
          test.args.filterValue,
        );

        const numberOfCartRulesAfterFilter = await boCartRulesPage.getNumberOfElementInGrid(page);
        expect(numberOfCartRulesAfterFilter).to.be.at.most(numberOfCartRules + 2);

        for (let row = 1; row <= numberOfCartRulesAfterFilter; row++) {
          if (test.args.filterBy === 'active') {
            const cartRuleStatus = await boCartRulesPage.getCartRuleStatus(page, row);
            expect(cartRuleStatus).to.equal(test.args.filterValue === '1');
          } else {
            const textColumn = await boCartRulesPage.getTextColumn(
              page,
              row,
              test.args.filterBy,
            );
            expect(textColumn).to.contains(test.args.filterValue);
          }
        }
      });

      it('should reset all filters', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${test.args.testIdentifier}Reset`, baseContext);

        const numberOfCartRulesAfterReset = await boCartRulesPage.resetAndGetNumberOfLines(page);
        expect(numberOfCartRulesAfterReset).to.equal(numberOfCartRules + 2);
      });
    });
  });

  describe('Quick edit cart rule', async () => {
    it(`should filter by name '${firstCartRule.name}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToQuickEdit', baseContext);

      await boCartRulesPage.filterCartRules(page, 'input', 'name', firstCartRule.name);

      const textColumn = await boCartRulesPage.getTextColumn(page, 1, 'name');
      expect(textColumn).to.contains(firstCartRule.name);
    });

    [
      {args: {status: 'disable', enable: false}},
      {args: {status: 'enable', enable: true}},
    ].forEach((status) => {
      it(`should ${status.args.status} the first cart rule`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${status.args.status}CartRule`, baseContext);

        await boCartRulesPage.setCartRuleStatus(page, 1, status.args.enable);

        const currentStatus = await boCartRulesPage.getCartRuleStatus(page, 1);
        expect(currentStatus).to.be.equal(status.args.enable);
      });
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetAfterQuickEdit', baseContext);

      const numberOfCartRulesAfterReset = await boCartRulesPage.resetAndGetNumberOfLines(page);
      expect(numberOfCartRulesAfterReset).to.equal(numberOfCartRules + 2);
    });
  });

  describe('Bulk actions cart rules', async () => {
    it('should filter by name \'todelete\'', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterForBulkActions', baseContext);

      await boCartRulesPage.filterCartRules(
        page,
        'input',
        'name',
        'todelete',
      );

      const numberOfCartRulesAfterFilter = await boCartRulesPage.getNumberOfElementInGrid(page);
      expect(numberOfCartRulesAfterFilter).to.be.at.most(numberOfCartRules + 2);

      for (let row = 1; row <= numberOfCartRulesAfterFilter; row++) {
        const textColumn = await boCartRulesPage.getTextColumn(page, row, 'name');
        expect(textColumn).to.contains('todelete');
      }
    });

    [
      {action: 'enable', wantedStatus: true},
      {action: 'disable', wantedStatus: false},
    ].forEach((test) => {
      it(`should ${test.action} cart rules with bulk actions`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${test.action}CartRules`, baseContext);

        await boCartRulesPage.bulkSetStatus(page, test.wantedStatus);

        const numberOfCartRulesBulkActions = await boCartRulesPage.getNumberOfElementInGrid(page);

        for (let row = 1; row <= numberOfCartRulesBulkActions; row++) {
          const rowStatus = await boCartRulesPage.getCartRuleStatus(page, row);
          expect(rowStatus).to.equal(test.wantedStatus);
        }
      });
    });

    it('should bulk delete cart rules', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkDeleteCartRules', baseContext);

      const deleteTextResult = await boCartRulesPage.bulkDeleteCartRules(page);
      expect(deleteTextResult).to.be.contains(boCartRulesPage.successfulMultiDeleteMessage);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetAfterBulkDelete', baseContext);

      const numberOfCartRulesAfterDelete = await boCartRulesPage.resetAndGetNumberOfLines(page);
      expect(numberOfCartRulesAfterDelete).to.equal(numberOfCartRules);
    });
  });
});
