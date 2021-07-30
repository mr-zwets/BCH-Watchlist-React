import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component{
    constructor(props){
        super(props);
        this.state={
            input:'',
            watchlist: []
        };
        this.addToWatchlist=this.addToWatchlist.bind(this);
        this.handleChange=this.handleChange.bind(this);
    }

    handleChange=(e) => { this.setState({input: e.target.value}) }

    addToWatchlist=() => {
        this.setState({
            input:'',
            watchlist: [...this.state.watchlist,this.state.input]
        }) 
    }

    render(){ return (
        <div>
            <h1>BCH Address Watchlist</h1>
            <div>Add Bitcoin Cash Addresses To Watch:</div>
            <input type="text" value={this.state.input} onChange={(e) => this.handleChange(e)} placeholder="BCH address"/>
            <button id="myBtn" onClick={this.addToWatchlist}>Add</button>
            <section style={{display: "flex"}}>
                {this.state.watchlist.map(addr =>
                    (<div key={addr} style={{width: "15em"}}>
                        <img src="https://cdn.mainnet.cash/wait.svg" style={{width: "inherit"}} id="deposit" />
                        <div style={{overflow: "auto"}}>{addr}</div>
                    </div>) 
                )}
            </section>
        </div>
    )}
}

ReactDOM.render(<App />, document.getElementById('root'));
