export const printMnemonic = (phrase: string, t: string) => {
  return `<html id="print-wallet">
  <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" rel="stylesheet">
  <div class="print-container" style="margin-bottom: 50px;" id="print-container" onload="myFunction()">
      <div class="print-text">
          <p>
          ${t[0]}
          ${t[1]}
          ${t[2]}
          </p>
          <h3 style="letter-spacing: 0.02rem;"> ${t[3]}</h3>
          <div class="phrase">${phrase}</div>
          <p>
            ${t[4]}
          </p>
          <p>
            ${t[5]}
          </p>
          <p>
            ${t[6]}
          </p>
          <div class="footer">
            <a href="https://bearby.io/">Bearby Wallet</a>
          </div>
      </div>
  </div>
  <style>
  pre{
      margin: 0 auto 0;
      text-align:center;
  }
  .print-container {
    text-align: center;
      font-family: 'Source Sans Pro', sans-serif;
      width: 900px;
      border: 1px solid gray;
      display: flex;
      margin-bottom: 50px;
      position: relative;
      color: #2d3748;
  }
  .hidden{
      visiblity:hidden;
      height: 0;
      width:0;
      margin:0;
  }
  .print-text{
      width: 100%;
      margin: auto;
      position: relative;
      padding: 20px;
      overflow: hidden;
  }
  p, strong{
      word-break: break-word;
  }
  img{
      max-width: 150px;
  }
  .phrase{
    font-family: Menlo,Monaco,Consolas,Courier New,monospace!important;
    font-weight: 500!important;
    flex: 1 1 0%;
    max-width: 500px;
    margin: auto;
    position: relative;
    padding: .75rem 1rem;
    margin-bottom: 2rem;
    border-radius: .25rem;
    border:  1px solid gray;
    appearance: none;
    line-height: 1.5;
  }
  a{
    color: rgba(#2d3748, 0.3);
    font-size: 0.8rem;
    text-decoration: none;
    text-align: center;
  }
  </style>
<html>
`
}
