import type { Address } from 'viem';
import { useBalance } from 'wagmi';
import { useMainnetEnsAvatar } from './useMainnetEnsAvatar';
import { useMainnetEnsName } from './useMainnetEnsName';
import { useMainnetHyperliquidName } from './useMainnetHyperliquidName';

interface UseProfileParameters {
  address?: Address;
  includeBalance?: boolean;
}

export function useProfile({ address, includeBalance }: UseProfileParameters) {
  const ensName = useMainnetEnsName(address);
  const ensAvatar = useMainnetEnsAvatar(ensName);
  const hyperliquidName = useMainnetHyperliquidName(address);

  const { data: balance } = useBalance({
    address: includeBalance ? address : undefined,
  });

  const primaryName = hyperliquidName ? hyperliquidName : ensName;

  return { ensName: primaryName, ensAvatar, balance };
}
