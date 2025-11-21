import { CalculatedSubnet, SubnetRequirement, CalculationResult } from '../types';

/**
 * Converts an IP string (x.x.x.x) to a 32-bit unsigned integer.
 */
export const ipToLong = (ip: string): number => {
  const parts = ip.split('.');
  if (parts.length !== 4) throw new Error("Invalid IP format");
  return (
    ((parseInt(parts[0], 10) << 24) |
      (parseInt(parts[1], 10) << 16) |
      (parseInt(parts[2], 10) << 8) |
      parseInt(parts[3], 10)) >>>
    0
  );
};

/**
 * Converts a 32-bit unsigned integer to an IP string.
 */
export const longToIp = (long: number): string => {
  const part1 = (long >>> 24) & 255;
  const part2 = (long >>> 16) & 255;
  const part3 = (long >>> 8) & 255;
  const part4 = long & 255;
  return `${part1}.${part2}.${part3}.${part4}`;
};

/**
 * Generates a subnet mask string from a CIDR prefix.
 */
export const cidrToMask = (cidr: number): string => {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return longToIp(mask);
};

/**
 * Generates a wildcard mask string from a CIDR prefix.
 */
export const cidrToWildcard = (cidr: number): string => {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = ~mask >>> 0;
  return longToIp(wildcard);
};

/**
 * Validates a standard CIDR notation string (e.g., 192.168.0.0/24).
 */
export const isValidCidr = (cidrInput: string): boolean => {
  const cidrRegex =
    /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;
  if (!cidrRegex.test(cidrInput)) return false;

  const [ip] = cidrInput.split('/');
  const parts = ip.split('.').map(Number);
  return parts.every((part) => part >= 0 && part <= 255);
};

/**
 * Calculates the necessary CIDR prefix for a given number of hosts.
 * Formula: 32 - ceil(log2(hosts + 2))
 * Note: +2 for network and broadcast addresses.
 */
const getRequiredPrefix = (hosts: number): number => {
  if (hosts <= 0) return 32;
  // hosts + 2 must be <= 2^n
  // n = ceil(log2(hosts + 2))
  // prefix = 32 - n
  let needed = hosts + 2;
  let power = 0;
  while (Math.pow(2, power) < needed) {
    power++;
  }
  return 32 - power;
};

/**
 * The main VLSM Calculation Algorithm.
 */
export const calculateVLSM = (
  primaryNetworkCidr: string,
  requirements: SubnetRequirement[]
): CalculationResult => {
  try {
    // 1. Parse Primary Network
    const [ipStr, cidrStr] = primaryNetworkCidr.split('/');
    const primaryCidr = parseInt(cidrStr, 10);
    const primaryIpLong = ipToLong(ipStr);
    
    // Ensure the primary IP is actually the network address (zero out host bits)
    const primaryMask = (0xffffffff << (32 - primaryCidr)) >>> 0;
    const startIp = (primaryIpLong & primaryMask) >>> 0;
    const primaryBroadcast = (startIp | (~primaryMask >>> 0)) >>> 0;
    const totalAvailableSpace = primaryBroadcast - startIp + 1;

    // 2. Sort Requirements (Largest First - Crucial for VLSM)
    // We clone to avoid mutating the original array reference in UI
    const sortedReqs = [...requirements]
      .filter((r) => r.hostCount > 0)
      .sort((a, b) => b.hostCount - a.hostCount);

    const calculatedSubnets: CalculatedSubnet[] = [];
    let currentIp = startIp;
    let totalAllocated = 0;
    let totalNeeded = 0;

    // 3. Allocation Loop
    for (const req of sortedReqs) {
      totalNeeded += req.hostCount;
      
      const reqPrefix = getRequiredPrefix(req.hostCount);
      
      // Block size = 2^(32 - prefix)
      const blockSize = Math.pow(2, 32 - reqPrefix);

      // Check for Overflow
      // In a strict VLSM calculator, we just check if we have space.
      // Since we sort largest to smallest, alignment usually takes care of itself 
      // if we pack tightly.
      if (currentIp + blockSize - 1 > primaryBroadcast) {
        throw new Error(`Insufficient address space in ${primaryNetworkCidr}. Cannot allocate subnet '${req.name}' with ${req.hostCount} hosts.`);
      }

      const networkAddr = currentIp;
      const broadcastAddr = currentIp + blockSize - 1;
      const usableHosts = blockSize - 2;
      
      // Avoid negative usable hosts for /31 or /32 edge cases, though standard practice 
      // usually assumes N+2. We will stick to standard math:
      // /32 -> 1 total, 0 usable (loopback/host route)
      // /31 -> 2 total, 0 usable (or 2 for p2p links in some hardware, but strict rules say 0)
      // For this generic calc, we treat usable as blockSize - 2 (min 0).
      const validUsable = Math.max(0, usableHosts);
      
      const firstUsable = validUsable > 0 ? networkAddr + 1 : networkAddr; // Fallback for /32
      const lastUsable = validUsable > 0 ? broadcastAddr - 1 : networkAddr;

      calculatedSubnets.push({
        name: req.name,
        neededHosts: req.hostCount,
        networkAddress: longToIp(networkAddr),
        cidr: reqPrefix,
        subnetMask: cidrToMask(reqPrefix),
        wildcardMask: cidrToWildcard(reqPrefix),
        totalAddresses: blockSize,
        usableHosts: validUsable,
        firstUsable: longToIp(firstUsable),
        lastUsable: longToIp(lastUsable),
        broadcastAddress: longToIp(broadcastAddr),
        wastedAddresses: blockSize - req.hostCount, // "Wasted" implies overhead (net+bc) + unused
      });

      totalAllocated += blockSize;
      currentIp += blockSize;
    }

    return {
      subnets: calculatedSubnets,
      totalNeeded,
      totalAllocated,
      utilizationPct: totalAvailableSpace > 0 ? (totalAllocated / totalAvailableSpace) * 100 : 0
    };

  } catch (err: any) {
    return {
      subnets: [],
      error: err.message || "An unknown error occurred",
      totalNeeded: 0,
      totalAllocated: 0,
      utilizationPct: 0
    };
  }
};