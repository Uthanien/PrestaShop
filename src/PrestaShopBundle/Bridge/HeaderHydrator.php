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

namespace PrestaShopBundle\Bridge;

use \Configuration;
use PrestaShopBundle\Component\ActionBar\ActionsBarButtonsCollection;
use \QuickAccess;
use \Shop;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use \Tab;
use \Tools;

/**
 * Hydrate template variables for header
 */
class HeaderHydrator implements HydratorInterface
{
    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(RouterInterface $router, TranslatorInterface $translator)
    {
        $this->router = $router;
        $this->translator = $translator;
    }
    /**
     * Assign smarty variables for the header.
     *
     * @param ControllerConfiguration $controllerConfiguration
     *
     * @return void
     */
    public function hydrate(ControllerConfiguration $controllerConfiguration)
    {
        header('Cache-Control: no-store, no-cache');

        $controllerConfiguration->templatesVars['table'] = $controllerConfiguration->table;
        $controllerConfiguration->templatesVars['current'] = $this->router->generate('admin_features_index');
        $controllerConfiguration->templatesVars['token'] = $controllerConfiguration->token;
        $controllerConfiguration->templatesVars['host_mode'] = (int) defined('_PS_HOST_MODE_');
        $controllerConfiguration->templatesVars['stock_management'] = (int) Configuration::get('PS_STOCK_MANAGEMENT');
        $controllerConfiguration->templatesVars['no_order_tip'] = $this->getNotificationTip($controllerConfiguration, 'order');
        $controllerConfiguration->templatesVars['no_customer_tip'] = $this->getNotificationTip($controllerConfiguration, 'customer');
        $controllerConfiguration->templatesVars['no_customer_message_tip'] = $this->getNotificationTip($controllerConfiguration, 'customer_message');

        if ($controllerConfiguration->displayHeader) {
            $controllerConfiguration->templatesVars['displayBackOfficeHeader'] = \Hook::exec('displayBackOfficeHeader');
        }

        // Fetch Employee Menu
        $menuLinksCollections = new ActionsBarButtonsCollection();
        //Hook::exec(
        //    'displayBackOfficeEmployeeMenu',
        //    [
        //        'links' => $menuLinksCollections,
        //    ],
        //    null,
        //    true
        //);
        //
        $controllerConfiguration->templatesVars['displayBackOfficeTop'] = \Hook::exec('displayBackOfficeTop');
        $controllerConfiguration->templatesVars['displayBackOfficeEmployeeMenu'] = $menuLinksCollections;
        $controllerConfiguration->templatesVars['submit_form_ajax'] = (int) Tools::getValue('submitFormAjax');
        //
        //// Multishop

        $tabs = $this->getTabs($controllerConfiguration);
        $currentTabLevel = 0;
        foreach ($tabs as $tab) {
            $currentTabLevel = isset($tab['current_level']) ? $tab['current_level'] : $currentTabLevel;
        }
        //
        //    $helperShop = new HelperShop();
        //    /* Hooks are voluntary out the initialize array (need those variables already assigned) */
        $controllerConfiguration->templatesVars['bo_query'] = Tools::safeOutput(Tools::stripslashes(Tools::getValue('bo_query')));
        $controllerConfiguration->templatesVars['collapse_menu'] = isset($controllerConfiguration->cookie->collapse_menu) ? (int) $controllerConfiguration->cookie->collapse_menu : 0;
        //$controllerConfiguration->templatesVars['current_shop_name'] = $helperShop->getCurrentShopName();
        $controllerConfiguration->templatesVars['default_tab_link'] = $controllerConfiguration->link->getAdminLink(Tab::getClassNameById((int) $controllerConfiguration->user->getData()->default_tab));
        $controllerConfiguration->templatesVars['employee'] = $controllerConfiguration->user->getData();
        $controllerConfiguration->templatesVars['help_box'] = Configuration::get('PS_HELPBOX');
        $controllerConfiguration->templatesVars['is_multishop'] = Shop::isFeatureActive();
        $controllerConfiguration->templatesVars['login_link'] = $controllerConfiguration->link->getAdminLink('AdminLogin');
        $controllerConfiguration->templatesVars['logout_link'] = $controllerConfiguration->link->getAdminLink('AdminLogin', true, [], ['logout' => 1]);
        $controllerConfiguration->templatesVars['multi_shop'] = Shop::isFeatureActive();
        $controllerConfiguration->templatesVars['quick_access'] = QuickAccess::getQuickAccessesWithToken($controllerConfiguration->language->id, (int) $controllerConfiguration->user->getData()->id);
        $controllerConfiguration->templatesVars['round_mode'] = Configuration::get('PS_PRICE_ROUND_MODE');
        //$controllerConfiguration->context->smarty->assign([
            //'multishop_context' => $this->multishop_context,
            //'search_type' => Tools::getValue('bo_search_type'),
            //'shop' => $this->context->shop,
            //'shop_group' => new ShopGroup((int) Shop::getContextShopGroupID()),
            //'shop_list' => $helperShop->getRenderedShopList(),
        //]);
        //} else {
        //    $controllerConfiguration->context->smarty->assign('default_tab_link', $controllerConfiguration->context->link->getAdminLink('AdminDashboard'));
        //}
        //
        //// Shop::initialize() in config.php may empty $this->context->shop->virtual_uri so using a new shop instance for getBaseUrl()
        //$this->context->shop = new Shop((int) $this->context->shop->id);
        $controllerConfiguration->templatesVars['base_url'] = $controllerConfiguration->shop->getBaseURL(true);
        $controllerConfiguration->templatesVars['bootstrap'] = $controllerConfiguration->bootstrap;
        $controllerConfiguration->templatesVars['controller_name'] = $controllerConfiguration->controllerNameLegacy;
        $controllerConfiguration->templatesVars['country_iso_code'] = $controllerConfiguration->country->iso_code;
        $controllerConfiguration->templatesVars['currentIndex'] = $this->router->generate('admin_features_index');
        $controllerConfiguration->templatesVars['current_tab_level'] = $currentTabLevel;
        $controllerConfiguration->templatesVars['default_language'] = (int) Configuration::get('PS_LANG_DEFAULT');
        $controllerConfiguration->templatesVars['full_language_code'] = $controllerConfiguration->language->language_code;
        $controllerConfiguration->templatesVars['full_cldr_language_code'] = 'fr';
        $controllerConfiguration->templatesVars['img_dir'] = _PS_IMG_;
        $controllerConfiguration->templatesVars['install_dir_exists'] = file_exists(_PS_ADMIN_DIR_ . '/../install');
        $controllerConfiguration->templatesVars['iso'] = $controllerConfiguration->language->iso_code;
        $controllerConfiguration->templatesVars['iso_user'] = $controllerConfiguration->language->iso_code;
        $controllerConfiguration->templatesVars['lang_is_rtl'] = $controllerConfiguration->language->is_rtl;
        $controllerConfiguration->templatesVars['link'] = $controllerConfiguration->link;
        $controllerConfiguration->templatesVars['shop_name'] = Configuration::get('PS_SHOP_NAME');
        $controllerConfiguration->templatesVars['tabs'] = $tabs;
        $controllerConfiguration->templatesVars['version'] = _PS_VERSION_;

        //$controllerConfiguration->context->smarty->assign([
        //    //'class_name' => $controllerConfiguration->className,
        //    //'current_parent_id' => (int) Tab::getCurrentParentId(),
        //    //@Todo handle this
        //    //'full_cldr_language_code' => $this->getContextLocale()->getCode(),
        //    //'lang_iso' => $this->context->language->iso_code,
        //    //'pic_dir' => _THEME_PROD_PIC_DIR_,
        //]);
    }

    private function getNotificationTip(ControllerConfiguration $controllerConfiguration, $type)
    {
        $tips = [
            'order' => [
                $this->translator->trans(
                    'Have you checked your [1][2]abandoned carts[/2][/1]?[3]Your next order could be hiding there!',
                    [
                        '[1]' => '<strong>',
                        '[/1]' => '</strong>',
                        '[2]' => '<a href="' . $controllerConfiguration->link->getAdminLink('AdminCarts', true, [], ['action' => 'filterOnlyAbandonedCarts']) . '">',
                        '[/2]' => '</a>',
                        '[3]' => '<br>',
                    ],
                    'Admin.Navigation.Notification'
                ),
            ],
            'customer' => [
                $this->translator->trans('Are you active on social media these days?', [], 'Admin.Navigation.Notification'),
            ],
            'customer_message' => [
                $this->translator->trans('Seems like all your customers are happy :)', [], 'Admin.Navigation.Notification'),
            ],
        ];

        if (!isset($tips[$type])) {
            return '';
        }

        return $tips[$type][array_rand($tips[$type])];
    }

    private function getTabs(ControllerConfiguration $controllerConfiguration, $parentId = 0, $level = 0): array
    {
        $tabs = Tab::getTabs($controllerConfiguration->language->id, $parentId);
        $current_id = Tab::getCurrentParentId();

        foreach ($tabs as $index => $tab) {
            if (!Tab::checkTabRights($tab['id_tab'])
                || !$tab['enabled']
                || ($tab['class_name'] == 'AdminStock' && Configuration::get('PS_ADVANCED_STOCK_MANAGEMENT') == 0)
                || $tab['class_name'] == 'AdminCarrierWizard') {
                unset($tabs[$index]);

                continue;
            }

            // tab[class_name] does not contains the "Controller" suffix
            if (($tab['class_name'] . 'Controller' == $controllerConfiguration->controllerNameLegacy) || ($current_id == $tab['id_tab']) || $tab['class_name'] == $controllerConfiguration->controllerNameLegacy) {
                $tabs[$index]['current'] = true;
                $tabs[$index]['current_level'] = $level;
            } else {
                $tabs[$index]['current'] = false;
            }
            $tabs[$index]['img'] = null;
            $tabs[$index]['href'] = $controllerConfiguration->link->getTabLink($tab);
            $tabs[$index]['sub_tabs'] = array_values($this->getTabs($controllerConfiguration, $tab['id_tab'], $level + 1));

            $subTabHref = $this->getTabLinkFromSubTabs($tabs[$index]['sub_tabs']);
            if (!empty($subTabHref)) {
                $tabs[$index]['href'] = $subTabHref;
            } elseif (0 == $tabs[$index]['id_parent'] && '' == $tabs[$index]['icon']) {
                unset($tabs[$index]);
            } elseif (empty($tabs[$index]['icon'])) {
                $tabs[$index]['icon'] = 'extension';
            }

            if (array_key_exists($index, $tabs) && array_key_exists('sub_tabs', $tabs[$index])) {
                foreach ($tabs[$index]['sub_tabs'] as $sub_tab) {
                    if ((int) $sub_tab['current'] == true) {
                        $tabs[$index]['current'] = true;
                        $tabs[$index]['current_level'] = $sub_tab['current_level'];
                    }
                }
            }
        }

        return $tabs;
    }

    /**
     * Get the url of the first active sub-tab.
     *
     * @param array[] $subtabs
     *
     * @return string Url, or empty if no active sub-tab
     */
    private function getTabLinkFromSubTabs(array $subtabs)
    {
        foreach ($subtabs as $tab) {
            if ($tab['active'] && $tab['enabled']) {
                return $tab['href'];
            }
        }

        return '';
    }
}
