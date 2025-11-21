export interface SubnetRequirement {
  id: string;
  name: string;
  hostCount: number;
}

export interface CalculatedSubnet {
  name: string;
  neededHosts: number;
  networkAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  usableHosts: number;
  firstUsable: string;
  lastUsable: string;
  broadcastAddress: string;
  wastedAddresses: number;
  binaryPrefix?: string; // Optional for debugging/display
}

export interface CalculationResult {
  subnets: CalculatedSubnet[];
  error?: string;
  totalNeeded: number;
  totalAllocated: number;
  utilizationPct: number;
}