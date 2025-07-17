import { useState } from 'react'
import type {WalletInfo} from "dash-platform-sdk/src/signer/AbstractSigner";
import {formatAddress} from "~/utils";

export function ConnectWallet({setCurrentIdentity}: {setCurrentIdentity: Function}) {

  const [connected, setConnected] = useState<boolean>(false)
  const [error, setError] = useState<string|null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo|null>(null)
  const [copied, setCopied] = useState(false)

  const connectWallet = () => {
    console.log('Connect Wallet')

    const {dashPlatformExtension} = window

    if (!window.dashPlatformExtension) {
      return setError("Dash Platform Extension is not installed")
    }

    dashPlatformExtension.signer.connect()
      .then((walletInfo: WalletInfo) => {
        setConnected(true)
        setWalletInfo(walletInfo)
        setError(null)
        setCurrentIdentity(walletInfo.currentIdentity)
      })
      .catch((error: Error) => {
        setError(error.toString() || 'Failed to connect wallet')
      })
  }

  return (
    <div className={"flex-col items-center mb-4 justify-start"}>
      {!connected ? (
        <>
          <button onClick={connectWallet}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25">
            Connect Wallet
          </button>

          {error &&
            <div className="mt-2 px-3 py-2 bg-red-900/20 border border-red-800/50 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          }
        </>
      ) : (
        <div className="relative group">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:bg-gray-900/70 transition-all duration-200">
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {walletInfo?.currentIdentity ? walletInfo.currentIdentity.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>

            {/* Account info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {formatAddress(walletInfo?.currentIdentity!!)}
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Tooltip with full address */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
            <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg px-3 py-1.5 whitespace-nowrap">
              <span className="text-xs text-gray-300">{walletInfo?.currentIdentity}</span>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
