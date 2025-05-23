<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace Tests\Integration\PrestaShopBundle\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\Routing\Router;
use Symfony\Component\Translation\Translator;
use Tests\Integration\Utility\LoginTrait;
use Tests\TestCase\SymfonyIntegrationTestCase;

class PrestaShopAdminControllerTest extends SymfonyIntegrationTestCase
{
    use LoginTrait;

    /**
     * @var KernelBrowser
     */
    protected $client;

    /**
     * @var Router
     */
    protected $router;

    /**
     * @var Translator
     */
    protected $translator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->loginUser($this->client);
        $this->router = $this->client->getContainer()->get('router');
        $this->translator = $this->client->getContainer()->get('translator');
    }

    /**
     * @dataProvider getDataProvider
     *
     * @param string $pageName
     * @param string $route
     */
    public function testPagesAreAvailable(string $pageName, string $route): void
    {
        $uri = $this->router->generate($route);

        $this->client->catchExceptions(false);
        $this->client->request('GET', $uri);

        $response = $this->client->getResponse();

        /*
         * If you need to debug these HTTP calls, you can use:
         * if ($response->isServerError()) {
         *    $content = $response->getContent();
         *    file_put_contents('error.html', $content);
         *    // then display 'error.html' in a web browser.
         * }
         */
        $this->assertTrue(
            $response->isSuccessful(),
            sprintf(
                '%s page should be available, but status code is %s',
                $pageName,
                $response->getStatusCode()
            )
        );
    }

    /**
     * @return array contains data to be tested:
     *               - the overridden pages
     *               - with the pages content
     *               - and the route name for each page
     */
    public function getDataProvider(): array
    {
        return [
            // @todo: something is missing for Vuejs application in translations page.
            // 'admin_international_translation_overview' => ['Translations', 'admin_international_translation_overview'],
            'admin_administration' => ['Administration', 'admin_administration'],
            'admin_attachments_create' => ['Add new', 'admin_attachments_create'],
            'admin_attachments_index' => ['Files', 'admin_attachments_index'],
            'admin_backups_index' => ['DB Backup', 'admin_backups_index'],
            'admin_carriers_index' => ['Carriers', 'admin_carriers_index'],
            'admin_categories_create' => ['Add new category', 'admin_categories_create'],
            'admin_categories_create_root' => ['Add new root category', 'admin_categories_create_root'],
            'admin_categories_index' => ['Categories', 'admin_categories_index'],
            'admin_cms_pages_category_create' => ['Add new cms category page', 'admin_cms_pages_category_create'],
            'admin_cms_pages_create' => ['Add new cms page', 'admin_cms_pages_create'],
            'admin_cms_pages_index' => ['Cms page', 'admin_cms_pages_index'],
            'admin_contacts_create' => ['Add new contact', 'admin_contacts_create'],
            'admin_contacts_index' => ['Contacts', 'admin_contacts_index'],
            'admin_currencies_create' => ['Add new currency', 'admin_currencies_create'],
            'admin_currencies_index' => ['Currencies', 'admin_currencies_index'],
            'admin_customer_preferences' => ['Customer Preferences', 'admin_customer_preferences'],
            'admin_customers_create' => ['Add new customer', 'admin_customers_create'],
            'admin_customers_index' => ['Customers', 'admin_customers_index'],
            'admin_emails_index' => ['Advanced parameters E-mail', 'admin_emails_index'],
            'admin_employees_create' => ['Add new employee', 'admin_employees_create'],
            'admin_employees_index' => ['Employees', 'admin_employees_index'],
            'admin_geolocation_index' => ['Geolocation', 'admin_geolocation_index'],
            'admin_import' => ['Import', 'admin_import'],
            'admin_languages_create' => ['Add new language', 'admin_languages_create'],
            'admin_languages_index' => ['Languages', 'admin_languages_index'],
            'admin_localization_index' => ['Localization', 'admin_localization_index'],
            'admin_logs_index' => ['Logs', 'admin_logs_index'],
            'admin_mail_theme_index' => ['Email Theme', 'admin_mail_theme_index'],
            'admin_maintenance' => ['Maintenance', 'admin_maintenance'],
            'admin_manufacturers_create' => ['Add new brand', 'admin_manufacturers_create'],
            'admin_manufacturers_index' => ['Brands', 'admin_manufacturers_index'],
            'admin_metas_create' => ['Add new meta', 'admin_metas_create'],
            'admin_metas_index' => ['Meta', 'admin_metas_index'],
            'admin_module_manage' => ['Module Manager', 'admin_module_manage'],
            'admin_module_notification' => ['Module notifications', 'admin_module_notification'],
            'admin_module_updates' => ['Module notifications', 'admin_module_updates'],
            'admin_modules_positions' => ['Positions', 'admin_modules_positions'],
            'admin_order_delivery_slip' => ['Delivery Slips', 'admin_order_delivery_slip'],
            'admin_order_invoices' => ['Invoices', 'admin_order_invoices'],
            'admin_order_messages_create' => ['Add new', 'admin_order_messages_create'],
            'admin_order_messages_index' => ['Order messages', 'admin_order_messages_index'],
            'admin_order_preferences' => ['Order Preferences', 'admin_order_preferences'],
            'admin_order_return_states_create' => ['Add new', 'admin_order_states'],
            'admin_order_states' => ['Order States', 'admin_order_states'],
            'admin_order_states_create' => ['Add new', 'admin_order_states'],
            'admin_orders_create' => ['Add new', 'admin_orders_create'],
            'admin_orders_index' => ['Orders', 'admin_orders_index'],
            'admin_outstanding_index' => ['Outstanding', 'admin_outstanding_index'],
            'admin_payment_methods' => ['Payment Methods', 'admin_payment_methods'],
            'admin_payment_preferences' => ['Payment preferences', 'admin_payment_preferences'],
            'admin_performance' => ['Performance', 'admin_performance'],
            'admin_permissions_index' => ['Permissions', 'admin_permissions_index'],
            'admin_preferences' => ['Preferences', 'admin_preferences'],
            'admin_product_preferences' => ['Product Preferences', 'admin_product_preferences'],
            'admin_profiles_create' => ['Add new role', 'admin_profiles_create'],
            'admin_profiles_index' => ['Roles', 'admin_profiles_index'],
            'admin_search_engines_create' => ['Add new', 'admin_search_engines_create'],
            'admin_search_engines_index' => ['Search Engines', 'admin_search_engines_index'],
            'admin_shipping_preferences' => ['Shipping Preferences', 'admin_shipping_preferences'],
            'admin_sql_requests_create' => ['Add new SQL query', 'admin_sql_requests_create'],
            'admin_sql_requests_index' => ['SQL Manager', 'admin_sql_requests_index'],
            'admin_states_create' => ['Add new state', 'admin_states_index'],
            'admin_states_index' => ['States', 'admin_states_index'],
            'admin_system_information' => ['Information', 'admin_system_information'],
            'admin_taxes_create' => ['Add new tax', 'admin_taxes_create'],
            'admin_taxes_index' => ['Taxes', 'admin_taxes_index'],
            'admin_themes_import' => ['Add new theme', 'admin_themes_import'],
            'admin_themes_index' => ['Theme & logo', 'admin_themes_index'],
            'admin_webservice_keys_create' => ['Webservice', 'admin_webservice_keys_create'],
            'admin_webservice_keys_index' => ['Webservice', 'admin_webservice_keys_index'],
        ];
    }
}
