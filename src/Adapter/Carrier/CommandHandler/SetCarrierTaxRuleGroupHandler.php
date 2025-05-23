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

namespace PrestaShop\PrestaShop\Adapter\Carrier\CommandHandler;

use PrestaShop\PrestaShop\Adapter\Carrier\Repository\CarrierRepository;
use PrestaShop\PrestaShop\Adapter\TaxRulesGroup\Repository\TaxRulesGroupRepository;
use PrestaShop\PrestaShop\Core\CommandBus\Attributes\AsCommandHandler;
use PrestaShop\PrestaShop\Core\Domain\Carrier\Command\SetCarrierTaxRuleGroupCommand;
use PrestaShop\PrestaShop\Core\Domain\Carrier\CommandHandler\SetCarrierTaxRuleGroupHandlerInterface;
use PrestaShop\PrestaShop\Core\Domain\Carrier\ValueObject\CarrierId;

#[AsCommandHandler]
class SetCarrierTaxRuleGroupHandler implements SetCarrierTaxRuleGroupHandlerInterface
{
    public function __construct(
        private readonly CarrierRepository $carrierRepository,
        private readonly TaxRulesGroupRepository $taxRulesGroupRepository,
    ) {
    }

    public function handle(SetCarrierTaxRuleGroupCommand $command): CarrierId
    {
        if ($command->getCarrierTaxRuleGroupId()->getValue() !== 0) {
            $this->taxRulesGroupRepository->assertTaxRulesGroupExists($command->getCarrierTaxRuleGroupId());
        }

        $newCarrier = $this->carrierRepository->getEditableOrNewVersion($command->getCarrierId());
        $newCarrierId = new CarrierId($newCarrier->id);
        $this->carrierRepository->setTaxRulesGroup($newCarrierId, $command->getCarrierTaxRuleGroupId(), $command->getShopConstraint());

        return $newCarrierId;
    }
}
