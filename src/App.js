import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  uri: "https://api.thegraph.com/subgraphs/name/wighawag/eip721-subgraph"
});

const mapContract = "0xecb9b2ea457740fbde58c758e4c574834224413e";
const tornMapContract = "0xd81f156bbf7043a22d4ce97c0e8ca11d3f4fb3cc";

const pageOfIDsQuery = (skip, contract, count=1000) => {
  return {
    query: gql`
      query fetchPage {
        tokens(
          first: ${count},
          skip: ${skip},
          orderBy: "tokenID"
          where: {contract: "${contract}"}
        ) { 
          tokenID
        }
      }`
    }
};

const getPageOfIDs = (graphResponse) => graphResponse.data.tokens.map(token => token.tokenID);

async function getUsedTokenIDs (contract) {
  const all = [];
  let qry = pageOfIDsQuery(0, contract, 1000);
  let skip = 1000;
  let page = await client.query(qry);
  let ids = getPageOfIDs(page);
  console.log('ids', ids);
  while (ids.length > 0) {
    all.push(...ids);
    console.log(`all now ${all.length}`);
    qry = pageOfIDsQuery(skip, contract, 1000);
    try {
      page = await client.query(qry);
      ids = getPageOfIDs(page);
    }
    catch (err) {
      console.error(err);
      ids = [];
    }
    skip += 1000;
  }
  return all;
}

function App() {

  // const [ ids, setIds ] = useState([]);

  useEffect(() => {
    getUsedTokenIDs(mapContract).then(ids => console.log('Map ids', ids));
    getUsedTokenIDs(tornMapContract).then(ids => console.log('Torn map', ids));
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
