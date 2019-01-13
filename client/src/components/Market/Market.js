import React, {Component} from "react"
import MarketOfferModal from '../MarketOfferModal/MarketOfferModal'
import EthereumSwap from "../../contractInterface/EthereumSwap.json"

import './Market.css'
import getWeb3 from "../../utils/getWeb3"
import axios from 'axios'
// import img from '../../assets/index.jpeg'

class Market extends Component {
  state = {
    offersData: null,
    activeModal: null,
    bitcoinAmount: 615525,
    ethAmount: 1000000000000000000,
    web3: null,
    networkId: null,
    accounts: null,
    // account = '0x0',
    deployedContract: null,
    deployedContractAddress: null,
    redeemTxHash: null,
    oraclizeApiPrice: 500000000000000000
  }

  componentWillMount = async () => {
    try {
      //fetch db for Offers get offers data from constructor
      const offersData = await this.getOffersFromDB()
      console.log(offersData);

      // Get network provider and web3 instance.
      const web3 = await getWeb3()
      console.log(web3);

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts()

      // Get the contract instance.
      const networkId = await web3.eth.net.getId()
      // for ganach networkId should be  5777
      const deployedNetwork = EthereumSwap.networks[networkId]
      // console.log(deployedNetwork.address)
      const deployedContract = new web3.eth.Contract(EthereumSwap.abi, deployedNetwork && deployedNetwork.address)

      console.log(deployedNetwork.address);
      console.log(deployedContract._address);
      web3.eth.getBalance(deployedNetwork.address).then(res => console.log(res))
      this.setState({offersData, web3, accounts, deployedContract, networkId, deployedContractAddress: deployedNetwork.address})

    } catch (error) {
      console.error(error)
    }
  }
  handleChange = (event) => {
    const {value, name} = event.target
    this.setState({[name]: value})
  }

  getOffersFromDB = async () => {
    try {
      const response = await axios.get('/api/offers')
      // TODO: make this false once you fix it
      // let offerData = response.data.filter(data => data.payedOut == true)
      let offerData = response.data
      return offerData
    } catch (e) {
      console.error(e)
    }
  }
  // TODO:
  // event.preventDefault() needed?
  // this.writeDetailsToDB() with payed = true  and payer address
  //should either get ID from function to process payment or
  //what it has in state: oraclizeApiPrice, accouts[0], deployedContract (should later choose from Mainnet, my testnet and Ropsten )
  //maybe just save the ID from the form(it should not render the mongodb but would be good for genereal stuff)
  //** implement dbWrite() and getOffers()
  initializePayoutProcess = async (index, bitcoinTransactionHash, bitcoinAddress) => {
    try {
      const {accounts, deployedContract, oraclizeApiPrice} = this.state
      const response = await deployedContract.methods.getTransaction(bitcoinTransactionHash, bitcoinAddress).send({from: accounts[0], value: oraclizeApiPrice, gas: 1500000})
      console.log(response)
      this.setState({redeemTxHash: response.transactionHash})
    } catch (e) {
      console.error(e)
    }
  }

  openModal = (e, index) => {
    console.log(index)
    this.setState({activeModal: index})
  }

  hideModal = () => {
    this.setState({activeModal: null})
  }


  render() {
    console.log('rendering!');
    console.log(this.state.offersData);
    const MarketOffers = ({offers}) => {
      if (offers) {
        return (<React.Fragment>
          {
            offers.map((offer, index) => (<React.Fragment>
              <div key={offer._id} className="container col s12 m6 l4">
                <div className="advantages card-panel hoverable">
                  <div className="card-content">
                    <span className="card-title activator grey-text text-darken-4">Offer
                    </span>
                    <p>
                      BitcoinAddress: {offer.bitcoinAddress}</p>
                    <p>
                      Amount BTC: {offer.bitcoinAmount}</p>
                    <p>
                      Amount to Pay: {offer.amountEth}</p>
                    <p>
                      Ethereum Address of contract: {offer.contractAddress}</p>
                    <p>
                      id: {offer._id}
                    </p>
                    <div>
                      <button id={offer._id} onClick={e => this.openModal(e, index)}>View Details</button>
                    </div>
                    <MarketOfferModal
                      offer={offer}
                      index={index}
                      show={this.state.activeModal === index}
                      onHide={this.hideModal}
                      initializePayout={this.initializePayoutProcess}
                      >
                    </MarketOfferModal>
                  </div>
                </div>
              </div>
            </React.Fragment>))
          }
        </React.Fragment>)
      } else {
        return null
      }
    }

    return (<div className="market-page">
      <div className="inner-container">
        <section className="offers">
          <div className="row">
            <MarketOffers offers={this.state.offersData}/>
          </div>
        </section>
      </div>
    </div>)
  }
}

export default Market
