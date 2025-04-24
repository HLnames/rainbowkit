import { useQuery } from '@tanstack/react-query';
import { type Address, createPublicClient, http, type Chain } from 'viem';
import {
  type RainbowKitChain,
  useRainbowKitChains,
} from '../components/RainbowKitProvider/RainbowKitChainContext';
import { createQueryKey } from '../core/react-query/createQuery';

const HyperliquidNameAddressMainnet =
  '0x1d9d87eBc14e71490bB87f1C39F65BDB979f3cb7';
const HyperliquidNamesABI = [
  {
    type: 'function',
    name: 'primaryName',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
] as const;

function useHyperEvmMainnet() {
  const rainbowKitChains = useRainbowKitChains();
  const hyperEvmMainnet = rainbowKitChains.find(
    (chain: Chain) => chain.id === 999,
  );

  return hyperEvmMainnet;
}

async function getHyperliquidName({
  address,
  hyperEvmMainnet,
}: { address: Address; hyperEvmMainnet: RainbowKitChain | undefined }) {
  if (!address && !hyperEvmMainnet) return '';

  try {
    const publicClientMainnet = createPublicClient({
      chain: hyperEvmMainnet,
      transport: http(),
    });

    const hyperliquidName = await publicClientMainnet.readContract({
      abi: HyperliquidNamesABI,
      address: HyperliquidNameAddressMainnet,
      functionName: 'primaryName',
      args: [address],
    });
    return hyperliquidName || '';
  } catch (_error) {
    console.error('Error fetching Hyperliquid name:', _error);
    return '';
  }
}

/** Gets the HyperEVM PrimaryName for the address */
export function useMainnetHyperliquidName(address?: Address) {
  const hyperEvmMainnet = useHyperEvmMainnet();

  const { data: hyperliquidName } = useQuery({
    queryKey: createQueryKey('HyperEvmAddress', address),
    queryFn: () => getHyperliquidName({ address: address!, hyperEvmMainnet }),
    enabled: !!hyperEvmMainnet && !!address,
    staleTime: 10 * (60 * 1_000), // 10 minutes
    retry: 1, // Retry once before returning undefined if the request fails
  });

  return hyperliquidName;
}
