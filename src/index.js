import React from "react";
import ReactDOM from "react-dom";
// import BCHJS through browserify
import BCHJS from "@psf/bch-js";
let bchjs = new BCHJS(); // Defaults to BCHN network.

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      watchlist: [],
      balances: [],
      BCHprice: 0,
    };
    this.addToWatchlist = this.addToWatchlist.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchBalance = this.fetchBalance.bind(this);
  }

  componentDidMount = async () => {
    try {
      const BCHprice = await bchjs.Price.getBchUsd();
      this.setState({ BCHprice });
    } catch (err) {
      console.log(err);
    }
  };

  handleChange = (e) => {
    this.setState({ input: e.target.value });
  };

  addToWatchlist = async () => {
    const newAddress = this.state.input;
    try {
      bchjs.Address.isMainnetAddress(newAddress);
    } catch {
      alert("not a valid BCH address");
      return;
    }
    const balance = await this.fetchBalance(newAddress);
    this.setState({
      input: "",
      watchlist: [...this.state.watchlist, newAddress],
      balances: [...this.state.balances, balance],
    });
  };

  fetchBalance = async (newAddress) => {
    try {
      const response = await bchjs.Electrumx.balance(newAddress);
      const BCHbalance = response.balance.confirmed / 100000000;
      return BCHbalance;
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <h1>BCH Watchlist</h1>
        <div>Enter Bitcoin Cash address to add to watchlist:</div>
        <div className="container">
          <input
            type="text"
            id="inputAddr"
            value={this.state.input}
            onChange={(e) => this.handleChange(e)}
            placeholder="BCH address"
          />
          <button id="myBtn" onClick={this.addToWatchlist}>
            ADD
          </button>
        </div>
        <section style={{ display: "flex" }}>
          {this.state.watchlist.map((addr, index) => (
            <div key={addr} className="item">
              <img alt="" src="https://cdn.mainnet.cash/wait.svg" id="QR" />
              <div id="addr">{addr}</div>
              <br />
              <div>
                {" "}
                confirmed balance: {this.state.balances[index]} BCH (
                {(this.state.balances[index] * this.state.BCHprice).toFixed(2)}
                $)
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
