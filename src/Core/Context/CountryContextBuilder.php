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

declare(strict_types=1);

namespace PrestaShop\PrestaShop\Core\Context;

use PrestaShop\PrestaShop\Adapter\ContextStateManager;
use PrestaShop\PrestaShop\Adapter\Country\Repository\CountryRepository;
use PrestaShop\PrestaShop\Adapter\LegacyContext;
use PrestaShop\PrestaShop\Core\Domain\Country\ValueObject\CountryId;
use PrestaShop\PrestaShop\Core\Exception\InvalidArgumentException;

class CountryContextBuilder
{
    private ?int $countryId = null;

    public function __construct(
        private readonly CountryRepository $countryRepository,
        private readonly LegacyContext $legacyContext,
        private readonly ContextStateManager $contextStateManager
    ) {
    }

    public function build(): CountryContext
    {
        if (null === $this->countryId) {
            throw new InvalidArgumentException(sprintf(
                'Cannot build Country context as no countryId has been defined you need to call %s::setCountryId to define it before building the Country context',
                self::class
            ));
        }

        $legacyCountry = $this->countryRepository->get(new CountryId($this->countryId));

        $country = new Country(
            $legacyCountry->id,
            $legacyCountry->id_zone,
            $legacyCountry->id_currency,
            $legacyCountry->iso_code,
            $legacyCountry->call_prefix,
            $legacyCountry->name,
            $legacyCountry->contains_states,
            $legacyCountry->need_identification_number,
            $legacyCountry->need_zip_code,
            $legacyCountry->zip_code_format,
            $legacyCountry->display_tax_label,
            $legacyCountry->active
        );

        return new CountryContext($country);
    }

    public function setCountryId(?int $countryId): self
    {
        $this->countryId = $countryId;

        return $this;
    }

    public function buildLegacyContext(): self
    {
        // set country object model in legacy context if country is different or not set
        if (empty($this->legacyContext->getContext()->country)
            || (int) $this->legacyContext->getContext()->country->id !== $this->countryId
        ) {
            $legacyCountry = $this->countryRepository->get(new CountryId($this->countryId));
            $this->contextStateManager->setCountry($legacyCountry);
        }

        return $this;
    }
}
