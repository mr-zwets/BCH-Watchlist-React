import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import BCHJS from "@psf/bch-js";
import QRCode from "qrcode.react";
let bchjs = new BCHJS();

function App() {
  const [inputAddr, setInputAddr] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [BCHprice, setBCHprice] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const BCHprice = await bchjs.Price.getBchUsd();
        setBCHprice(BCHprice);
      } catch (err) {
        console.log(err);
      }
    };

    const readLocalStorage = () => {
      // Convert the string back to the watchlist object
      const newWatchlist = JSON.parse(localStorage.getItem("watchlist"));
      // If the local storage is not null
      if (newWatchlist !== null) {
        // Refresh the balances of all addresses
        newWatchlist.forEach(async (addrObj) => {
          addrObj.balance = await fetchBalance(addrObj.address);
        });
        // Write the watchlist to state, dot notation for rerender
        setWatchlist([...newWatchlist]);
      }
    };
    // Read local storage on initialization
    readLocalStorage();
    // Fetch BCH price on initialization
    fetchPrice();
  }, []);

  useEffect(() => {
    const writeToLocalStorage = () => {
      // Clear local storage and write the watchlist array to it as a string
      localStorage.clear();
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    };
    // Write the watchlist to localStorage each time it changes
    writeToLocalStorage();
  }, [watchlist]);

  const handleChange = (e) => {
    setInputAddr(e.target.value);
  };

  const changeName = (e, index) => {
    let newWatchlist = watchlist;
    newWatchlist[index].name = e.target.value;
    setWatchlist([...newWatchlist]);
    // Dot notation so React rerenders
  };

  const addToWatchlist = async () => {
    const newAddress = inputAddr;
    const newAddrObj = { address: newAddress, name: "", balance: 0 };
    // Check if address is already on the watchlist
    if (watchlist.find((addrObj) => addrObj.address === newAddress)) {
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
    const balance = await fetchBalance(newAddress);
    newAddrObj.balance = balance;
    // Clear input, add address object to the state
    setInputAddr("");
    setWatchlist([...watchlist, newAddrObj]);
  };

  const fetchBalance = async (newAddress) => {
    try {
      // Fetch the BCH balance in satoshis and convert it to BCH denomination
      const response = await bchjs.Electrumx.balance(newAddress);
      const totalBalance =
        response.balance.confirmed + response.balance.unconfirmed;
      const BCHbalance = totalBalance / 100000000;
      return BCHbalance;
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromWatchlist = (index) => {
    let newWatchlist = watchlist;
    newWatchlist.splice(index, 1);
    setWatchlist([...newWatchlist]);
    // Dot notation so React rerenders
  };

  return (
    <div>
      <main>
        <h1>BCH Watchlist</h1>
        <div>Enter Bitcoin Cash address to add to watchlist:</div>
        <div className="container">
          <input
            type="text"
            id="inputAddr"
            value={inputAddr}
            onChange={(e) => handleChange(e)}
            onKeyPress={(event) => {
              if (event.key === "Enter") addToWatchlist();
            }}
            placeholder="BCH address"
          />
          <button id="myBtn" onClick={addToWatchlist}>
            ADD
          </button>
        </div>
        <section id="addresslist">
          {watchlist.map(({ address, balance, name }, index) => (
            <div key={address} className="item">
              <input
                type="text"
                id="inputName"
                value={name}
                onChange={(e) => changeName(e, index)}
                className="inputName"
                placeholder="name"
              />
              <div id="x" onClick={() => removeFromWatchlist(index)}>
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
                balance: {balance} BCH ({(balance * BCHprice).toFixed(2)}
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

ReactDOM.render(<App />, document.getElementById("root"));
