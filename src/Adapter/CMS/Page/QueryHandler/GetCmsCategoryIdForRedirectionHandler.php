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

namespace PrestaShop\PrestaShop\Adapter\CMS\Page\QueryHandler;

use PrestaShop\PrestaShop\Adapter\CMS\Page\CommandHandler\AbstractCmsPageHandler;
use PrestaShop\PrestaShop\Core\CommandBus\Attributes\AsQueryHandler;
use PrestaShop\PrestaShop\Core\Domain\CmsPage\Exception\CmsPageException;
use PrestaShop\PrestaShop\Core\Domain\CmsPage\Query\GetCmsCategoryIdForRedirection;
use PrestaShop\PrestaShop\Core\Domain\CmsPage\QueryHandler\GetCmsCategoryIdHandlerForRedirectionInterface;
use PrestaShop\PrestaShop\Core\Domain\CmsPageCategory\ValueObject\CmsPageCategoryId;

/**
 * This class is used for getting the id which is used later on to redirect to the right page after certain controller
 * actions.
 */
#[AsQueryHandler]
final class GetCmsCategoryIdForRedirectionHandler extends AbstractCmsPageHandler implements GetCmsCategoryIdHandlerForRedirectionInterface
{
    /**
     * {@inheritdoc}
     */
    public function handle(GetCmsCategoryIdForRedirection $query)
    {
        try {
            $cms = $this->getCmsPageIfExistsById($query->getCmsPageId()->getValue());
            $categoryId = (int) $cms->id_cms_category;
        } catch (CmsPageException) {
            $categoryId = CmsPageCategoryId::ROOT_CMS_PAGE_CATEGORY_ID;
        }

        return new CmsPageCategoryId($categoryId);
    }
}
