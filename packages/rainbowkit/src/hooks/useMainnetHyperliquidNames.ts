import { useQuery } from '@tanstack/react-query';
import {
  type Address,
  createPublicClient,
  http,
  type Chain,
  namehash,
  zeroAddress,
  type GetEnsNameReturnType,
  type GetEnsAvatarReturnType,
} from 'viem';
import {
  type RainbowKitChain,
  useRainbowKitChains,
} from '../components/RainbowKitProvider/RainbowKitChainContext';
import { createQueryKey } from '../core/react-query/createQuery';

const ROUTER_ADDRESS = '0x25d1971D6dc9812EA1111662008f07735C74Bff5';
const AVATAR_KEY = 'Avatar';

const RouterABI = [
  {
    type: 'function',
    name: 'getCurrentRegistrator',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
] as const;

const RegistratorABI = [
  {
    type: 'function',
    name: 'getPrimaryName',
    inputs: [{ name: '_owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTextRecord',
    inputs: [
      { name: '_namehash', type: 'bytes32', internalType: 'bytes32' },
      { name: '_key', type: 'string', internalType: 'string' },
    ],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
] as const;

type HyperliquidNamesData = {
  name: GetEnsNameReturnType;
  avatar: GetEnsAvatarReturnType;
};

function useHyperEvmMainnet() {
  const rainbowKitChains = useRainbowKitChains();
  return rainbowKitChains.find((chain: Chain) => chain.id === 999);
}

// Fetches HyperliquidNames PrimaryName and Avatar for a given address
async function getHyperliquidNamesData({
  address,
  hyperEvmMainnet,
}: {
  address: Address;
  hyperEvmMainnet: RainbowKitChain | undefined;
}): Promise<HyperliquidNamesData> {
  const defaultResult: HyperliquidNamesData = { name: null, avatar: null };

  if (!address || !hyperEvmMainnet) {
    return defaultResult;
  }

  try {
    const publicClient = createPublicClient({
      chain: hyperEvmMainnet,
      transport: http(),
    });

    // Get registrator address
    const registratorAddress = await publicClient.readContract({
      abi: RouterABI,
      address: ROUTER_ADDRESS,
      functionName: 'getCurrentRegistrator',
      args: [],
    });

    if (registratorAddress === zeroAddress) {
      return defaultResult;
    }

    // Get primary name
    const primaryName = await publicClient.readContract({
      abi: RegistratorABI,
      address: registratorAddress,
      functionName: 'getPrimaryName',
      args: [address],
    });

    if (!primaryName) {
      return defaultResult;
    }
    defaultResult.name = primaryName as GetEnsNameReturnType;

    // Get avatar text record
    const avatar = await publicClient.readContract({
      abi: RegistratorABI,
      address: registratorAddress,
      functionName: 'getTextRecord',
      args: [namehash(primaryName), AVATAR_KEY],
    });

    return {
      name: primaryName as GetEnsNameReturnType,
      avatar: (avatar || null) as GetEnsAvatarReturnType,
    };
  } catch (error) {
    console.error('Error fetching Hyperliquid names data:', error);
    return defaultResult;
  }
}

/** Gets the HyperEVM PrimaryName and Avatar for the address */
export function useMainnetHyperliquidNames(address?: Address) {
  const hyperEvmMainnet = useHyperEvmMainnet();

  const { data: hyperliquidNamesData } = useQuery({
    queryKey: createQueryKey('HyperEvmAddress', address),
    queryFn: () =>
      getHyperliquidNamesData({ address: address!, hyperEvmMainnet }),
    enabled: !!hyperEvmMainnet && !!address,
    staleTime: 10 * (60 * 1_000), // 10 minutes
    retry: 1,
  });

  return hyperliquidNamesData;
}
