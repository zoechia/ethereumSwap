import React, {Component} from "react";
import EthereumBridge from "./contractInterface/EthereumBridge.json";
import getWeb3 from "./utils/getWeb3";
import {Link} from 'react-router-dom'

import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      console.log(web3.version);

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      // for ganach networkId should be  5777
      const deployedNetwork = EthereumBridge.networks[networkId];
      console.log(networkId);
      // console.log(deployedNetwork.address);
      const instance = new web3.eth.Contract(EthereumBridge.abi, deployedNetwork && deployedNetwork.address);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contract: instance
      }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
  };

  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }
    return (<section className="page">
      <div className="App">
        <h1 className="text-large">
          Welcome to the Bitcoin Ethereum Bridge
        </h1>
        <p>
          You can exchange Ether and Bitcoin with anyone in the most decentralized way for free!</p>
        <div >
          <Link to="/choose">
            Get Started
          </Link>
        </div>
      </div>
    </section>);
  }
}

export default App;
