import React from "react";
import ReactDOM from "react-dom";
import BCHJS from "@psf/bch-js";
import QRCode from "qrcode.react";
let bchjs = new BCHJS();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputAddr: "",
      watchlist: [],
      BCHprice: 0,
    };
    this.addToWatchlist = this.addToWatchlist.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchBalance = this.fetchBalance.bind(this);
    this.removeFromWatchlist = this.removeFromWatchlist.bind(this);
    this.readLocalStorage = this.readLocalStorage.bind(this);
    this.writeToLocalStorage = this.writeToLocalStorage.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Read local storage on initialization
      this.readLocalStorage()
      // Fetch BCH price on initialization
      const BCHprice = await bchjs.Price.getBchUsd();
      this.setState({ BCHprice });
    } catch (err) {
      console.log(err);
    }
  };

  handleChange = (e) => {
    this.setState({ inputAddr: e.target.value });
  };

  changeName = (e, index) => {
    let watchlist = this.state.watchlist;
    watchlist[index].name = e.target.value;
    this.setState({ watchlist });
    this.writeToLocalStorage()
  };

  addToWatchlist = async () => {
    const newAddress = this.state.inputAddr;
    const addrObj = { address: newAddress, name: "" };
    // Check if address is already on the watchlist 
    if (this.state.watchlist.includes(newAddress)) {
      alert("Already added this address to the watchlist!");
      return;
    }
    // Check if input is a valid BCH address
    try {
      bchjs.Address.isMainnetAddress(newAddress);
    } catch {
      alert("not a valid BCH address");
      return;
    }
    // Balance denominated in BCH
    const balance = await this.fetchBalance(newAddress);
    addrObj.balance = balance;
    // Clear input, add address object to the state
    this.setState({
      inputAddr: "",
      watchlist: [...this.state.watchlist, addrObj],
    });
    // Write the watchlist to local storage
    this.writeToLocalStorage()
  };

  fetchBalance = async (newAddress) => {
    try {
      // Fetch the BCH balance in satoshis and convert it to BCH denomination
      const response = await bchjs.Electrumx.balance(newAddress);
      const BCHbalance = response.balance.confirmed / 100000000;
      return BCHbalance;
    } catch (error) {
      console.error(error);
    }
  };

  removeFromWatchlist = (index) => {
    let watchlist = this.state.watchlist;
    watchlist.splice(index, 1);
    this.setState({ watchlist });
    // Write the watchlist to local storage
    this.writeToLocalStorage()
  };

  writeToLocalStorage = () => {
    // Clear local storage and write the watchlist array to it as a string
    localStorage.clear();
    localStorage.setItem("watchlist", JSON.stringify(this.state.watchlist));
  }

  readLocalStorage = () => {
    // Convert the string back to the watchlist object
    let watchlist = JSON.parse(localStorage.getItem("watchlist"));
    // Refresh the balances of all addresses
    watchlist.forEach( async (addrObj) => {
      addrObj.balance = await this.fetchBalance(addrObj.address);
    })
    // Write the watchlist to state if it exists
    if(watchlist !== "null") this.setState({ watchlist });
  }

  render() {
    return (
      <div>
        <main>
          <h1>BCH Watchlist</h1>
          <div>Enter Bitcoin Cash address to add to watchlist:</div>
          <div className="container">
            <input
              type="text"
              id="inputAddr"
              value={this.state.inputAddr}
              onChange={(e) => this.handleChange(e)}
              placeholder="BCH address"
            />
            <button id="myBtn" onClick={this.addToWatchlist}>
              ADD
            </button>
          </div>
          <section id="addresslist">
            {this.state.watchlist.map(({ address, balance, name }, index) => (
              <div key={address} className="item">
                <input
                  type="text"
                  id="inputName"
                  value={name}
                  onChange={(e) => this.changeName(e, index)}
                  className="inputName"
                  placeholder="name"
                />
                <div id="x" onClick={() => this.removeFromWatchlist(index)}>
                  X
                </div>
                <QRCode
                  id="QR"
                  value={address}
                  size={240}
                  renderAs="svg"
                  includeMargin={true}
                />
                <div id="addr">{address}</div>
                <br />
                <div>
                  {" "}
                  confirmed balance: {balance} BCH (
                  {(balance * this.state.BCHprice).toFixed(2)}
                  $)
                </div>
              </div>
            ))}
          </section>
        </main>
        <footer>
          <a
            href="https://github.com/mr-zwets/BCH-Watchlist-React"
            target="_blanc"
          >
            <img alt="" className="githublogo" src="./github.png" />
          </a>
          <p>
            built with{" "}
            <a
              href="https://github.com/Permissionless-Software-Foundation/bch-js"
              target="_blanc"
            >
              bch-js
            </a>
          </p>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
