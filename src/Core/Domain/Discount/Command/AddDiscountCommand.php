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

namespace PrestaShop\PrestaShop\Core\Domain\Discount\Command;

use DateTimeImmutable;
use PrestaShop\PrestaShop\Core\Domain\Customer\ValueObject\CustomerId;
use PrestaShop\PrestaShop\Core\Domain\Discount\Exception\DiscountConstraintException;
use PrestaShop\PrestaShop\Core\Domain\Discount\ValueObject\DiscountType;
use PrestaShop\PrestaShop\Core\Domain\Language\ValueObject\LanguageId;

abstract class AddDiscountCommand
{
    private array $localizedNames = [];
    private int $priority = 1;
    private bool $active = true;
    private ?DateTimeImmutable $validFrom = null;
    private ?DateTimeImmutable $validTo = null;
    private int $totalQuantity = 1;
    private int $quantityPerUser = 1;
    private string $description = '';
    private string $code = '';
    private ?CustomerId $customerId = null;
    private bool $highlightInCart = false;
    private bool $allowPartialUse = true;
    private DiscountType $type;

    public function __construct(
        array $localizedNames,
        string $type,
    ) {
        $this->type = new DiscountType($type);
        $this->setLocalizedNames($localizedNames);
    }

    /**
     * @param array<int, string> $localizedNames
     */
    private function setLocalizedNames(array $localizedNames): self
    {
        foreach ($localizedNames as $languageId => $name) {
            $this->localizedNames[(new LanguageId($languageId))->getValue()] = $name;
        }

        return $this;
    }

    /**
     * @return array<int, string>
     */
    public function getLocalizedNames(): array
    {
        return $this->localizedNames;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    public function getValidFrom(): ?DateTimeImmutable
    {
        return $this->validFrom;
    }

    public function getValidTo(): ?DateTimeImmutable
    {
        return $this->validTo;
    }

    /**
     * @throws DiscountConstraintException
     */
    public function setValidityDateRange(DateTimeImmutable $from, DateTimeImmutable $to): self
    {
        $this->assertDateRangeIsValid($from, $to);
        $this->validFrom = $from;
        $this->validTo = $to;

        return $this;
    }

    public function getPriority(): int
    {
        return $this->priority;
    }

    public function getDiscountType(): DiscountType
    {
        return $this->type;
    }

    /**
     * @throws DiscountConstraintException
     */
    public function setPriority(int $priority): self
    {
        if (0 >= $priority) {
            throw new DiscountConstraintException(
                sprintf('Invalid discount priority "%s". Must be a positive integer.', $priority),
                DiscountConstraintException::INVALID_PRIORITY
            );
        }

        $this->priority = $priority;

        return $this;
    }

    public function getTotalQuantity(): int
    {
        return $this->totalQuantity;
    }

    public function isHighlightInCart(): bool
    {
        return $this->highlightInCart;
    }

    public function setHighlightInCart(bool $highlightInCart): void
    {
        $this->highlightInCart = $highlightInCart;
    }

    /**
     * @throws DiscountConstraintException
     */
    public function setTotalQuantity(int $quantity): self
    {
        if (0 > $quantity) {
            throw new DiscountConstraintException(sprintf('Quantity cannot be lower than zero, %d given', $quantity), DiscountConstraintException::INVALID_QUANTITY);
        }

        $this->totalQuantity = $quantity;

        return $this;
    }

    public function getQuantityPerUser(): int
    {
        return $this->quantityPerUser;
    }

    /**
     * @throws DiscountConstraintException
     */
    public function setQuantityPerUser(int $quantity): self
    {
        if (0 > $quantity) {
            throw new DiscountConstraintException(sprintf('Quantity per user cannot be lower than zero, %d given', $quantity), DiscountConstraintException::INVALID_QUANTITY_PER_USER);
        }

        $this->quantityPerUser = $quantity;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }

    public function allowPartialUse(): bool
    {
        return $this->allowPartialUse;
    }

    public function setAllowPartialUse(bool $allow): self
    {
        $this->allowPartialUse = $allow;

        return $this;
    }

    public function getCustomerId(): ?CustomerId
    {
        return $this->customerId;
    }

    public function setCustomerId(int $customerId): self
    {
        $this->customerId = new CustomerId($customerId);

        return $this;
    }

    /**
     * @throws DiscountConstraintException
     */
    private function assertDateRangeIsValid(DateTimeImmutable $dateFrom, DateTimeImmutable $dateTo): void
    {
        if ($dateFrom > $dateTo) {
            throw new DiscountConstraintException('Date from cannot be greater than date to.', DiscountConstraintException::DATE_FROM_GREATER_THAN_DATE_TO);
        }
    }
}
