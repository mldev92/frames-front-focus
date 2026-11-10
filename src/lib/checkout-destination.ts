interface DeliveryRequirements {
  requiresAddress?: boolean;
  requiresPickupPoint?: boolean;
}

interface PickupPoint {
  id: string;
  address: string;
  rawAddress?: string;
}

export function addressAfterDeliveryChange(address: string, point: PickupPoint | null, pickupSelected: boolean): string {
  if (pickupSelected || !point) return address;
  return address === (point.rawAddress ?? point.address) ? "" : address;
}

export function orderDestination(delivery: DeliveryRequirements, address: string, point: PickupPoint | null) {
  if (delivery.requiresPickupPoint && point) {
    const pickupAddress = point.rawAddress ?? point.address;
    return { address: pickupAddress, pickupPoint: { id: point.id, address: pickupAddress } };
  }
  return {
    address: delivery.requiresAddress ? (address.trim() || undefined) : undefined,
    pickupPoint: undefined,
  };
}
