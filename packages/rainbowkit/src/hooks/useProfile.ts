import type { Address } from 'viem';
import { useBalance } from 'wagmi';
import { useMainnetEnsAvatar } from './useMainnetEnsAvatar';
import { useMainnetEnsName } from './useMainnetEnsName';
import { useMainnetHyperliquidNames } from './useMainnetHyperliquidNames';

interface UseProfileParameters {
  address?: Address;
  includeBalance?: boolean;
}

export function useProfile({ address, includeBalance }: UseProfileParameters) {
  const ensName = useMainnetEnsName(address);
  const ensAvatar = useMainnetEnsAvatar(ensName);
  const hyperliquidNamesData = useMainnetHyperliquidNames(address);

  const { data: balance } = useBalance({
    address: includeBalance ? address : undefined,
  });

  // Priority: Hyperliquid > ENS
  const displayName = hyperliquidNamesData?.name || ensName;
  const displayAvatar = hyperliquidNamesData?.avatar || ensAvatar;

  return {
    ensName: displayName,
    ensAvatar: displayAvatar,
    balance,
  };
}
