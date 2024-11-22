import '@rainbow-me/rainbowkit/styles.css';
import walletlogo from "../assets/walletbtn.png";
import disconnectbtn from "../assets/disconnectwlt.png";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

const CustomButton = () => {
  const { isConnected } = useAccount(); // Check if the wallet is connected
  const [connected, setConnected] = useState(false); // State to hold connection status

  useEffect(() => {
    // Reset the connection status on page reload or component mount
    setConnected(false);
  }, []);

  useEffect(() => {
    // Update connected status based on isConnected from useAccount
    setConnected(isConnected);
  }, [isConnected]);

  

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        // const connected =
        //   ready &&
        //   account &&
        //   chain &&
        //   (!authenticationStatus ||
        //     authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
               const hasAccount = account !== undefined;
               const hasChain = chain !== undefined;
              // If wallet is not connected, show the connect button
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className="w-20 h-28">
                    <img
                      src={walletlogo}
                      alt="connect"
                      className="absolute w-16 h-24 object-cover z-20 cursor-pointer bottom-6 transition-opacity duration-700 ease-out"
                      style={{ top: '100px', right: '55px' }}
                    />
                  </button>
                );
              }

              // If chain is unsupported, show the chain error message
              // if (hasChain && chain.unsupported) {
              //   return (
              //     <button onClick={openChainModal} type="button">
              //       Wrong network
              //     </button>
              //   );
              // }

              // If wallet is connected, show the chain and disconnect buttons
              if (hasAccount && hasChain) {
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div>
                  <div
                    //onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center', visibility: 'hidden', }}
                    
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </div></div>

                  <button onClick={openAccountModal} type="button">
                    <img
                      src={disconnectbtn}
                      alt="disconnect"
                      className="absolute  w-16 h-24 object-cover z-20 cursor-pointer bottom-6 transition-opacity duration-700 ease-out "
                      style={{ top: '54px', right: '80px' }}
                    />
                  </button>
                </div>
              );  
            }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomButton;
