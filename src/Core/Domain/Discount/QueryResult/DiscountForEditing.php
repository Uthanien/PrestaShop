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

namespace PrestaShop\PrestaShop\Core\Domain\Discount\QueryResult;

use DateTimeImmutable;
use PrestaShop\PrestaShop\Core\Domain\Discount\ValueObject\DiscountType;

class DiscountForEditing
{
    public function __construct(
        private readonly int $id,
        private readonly int $priority,
        private readonly bool $active,
        private readonly ?DateTimeImmutable $validFrom,
        private readonly ?DateTimeImmutable $validTo,
        private readonly int $totalQuantity,
        private readonly int $quantityPerUser,
        private readonly string $description,
        private readonly string $code,
        private readonly ?int $customerId,
        private readonly bool $highlightInCart,
        private readonly bool $allowPartialUse,
        private readonly string $type,
    ) {
    }

    public function getDiscountId(): int
    {
        return $this->id;
    }

    public function getPriority(): int
    {
        return $this->priority;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function getValidFrom(): ?DateTimeImmutable
    {
        return $this->validFrom;
    }

    public function getValidTo(): ?DateTimeImmutable
    {
        return $this->validTo;
    }

    public function getTotalQuantity(): int
    {
        return $this->totalQuantity;
    }

    public function getQuantityPerUser(): int
    {
        return $this->quantityPerUser;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function getCustomerId(): ?int
    {
        return $this->customerId;
    }

    public function isHighlightInCart(): bool
    {
        return $this->highlightInCart;
    }

    public function isAllowPartialUse(): bool
    {
        return $this->allowPartialUse;
    }

    public function getType(): DiscountType
    {
        return new DiscountType($this->type);
    }
}
