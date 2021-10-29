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
    };
    this.addToWatchlist = this.addToWatchlist.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (e) => {
    this.setState({ input: e.target.value });
  };

  addToWatchlist = () => {
    this.setState({
      input: "",
      watchlist: [...this.state.watchlist, this.state.input],
    });
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
          {this.state.watchlist.map((addr) => (
            <div key={addr} className="item">
              <img src="https://cdn.mainnet.cash/wait.svg" id="QR" />
              <div id="addr">{addr}</div>
            </div>
          ))}
        </section>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
