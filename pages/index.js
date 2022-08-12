
import { Rent } from './Rent'
import '@solana/wallet-adapter-react-ui/styles.css'

export default function Home() {
  // const handleChange = (event) => {
  //   switch(event.target.value){
  //     case "devnet":
  //       setNetwork(WalletAdapterNetwork.Devnet);
  //       break;
  //     case "mainnet":
  //       setNetwork(WalletAdapterNetwork.Mainnet);
  //     break;
  //     case "testnet":
  //       setNetwork(WalletAdapterNetwork.Testnet);
  //       break;
  //     default:
  //       setNetwork(WalletAdapterNetwork.Devnet);
  //       break;
  //   }
  // };
  return (
    <div>
      <Rent />
    </div>
  );


}

