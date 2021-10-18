// import Head from 'next/head'
import {useEffect, useState} from "react";
import {apiUrl, BATCHER_ADDRESS, BATCHER_ABI} from "./config"
import Web3 from "web3";

import ImagePicker from "react-image-picker";
import "react-image-picker/dist/index.css";

import { ReactP5Wrapper } from "react-p5-wrapper";
import sketch from "./sketch.js"

// BACKGROUND SKETCH

export default function Home() {

  const [signedIn, setSignedIn] = useState(false)

  const [walletAddress, setWalletAddress] = useState("0xe49381184a49cd2a48e4b09a979524e672fdd10e")
  const [walletGLICPIX, setWalletGLICPIX] = useState([])
  const [walletImages, setWalletImages] = useState([])
  const [imagesNames, setImagesNames] = useState([])

  const [images, setImages] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

  const [minRes, setMinRes] = useState(32)
  const [maxMultiplier, setMaxMultiplier] = useState(1)
  const [tileWidth, setTileWidth] = useState(32)
  const [tileHeight, setTileHeight] = useState(32)

  const [patternType, setPatternType] = useState('rand')
  const [caRule, setCaRule] = useState(1)


  const onPickImages = (e) => {
    // console.log(e.map((item) => item["src"]))
    setImages(e.map((item) => item["src"]))
    setSelectedIds(e.map((item) => item["value"]))
    console.log(images)
    console.log(selectedIds)
    // setImages({e})
  }

  async function signIn() {
    if (typeof window.web3 !== 'undefined') {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
     
    } else {
      alert("No Ethereum interface injected into browser. Read-only access");
    }

    window.ethereum.enable()
      .then(function (accounts) {
        window.web3.eth.net.getNetworkType()
        .then((network) => {console.log(network);if(network != "main"){alert("You are on " + network+ " network. Change network to mainnet or you won't be able to do shit here")} });  
        let wallet = accounts[0]
        setWalletAddress(wallet)
        setSignedIn(true)
      })
      .catch(function (error) {
      // Handle error. Likely the user rejected the login
      console.error(error)
    })
  }

//

  async function signOut() {
    setSignedIn(false)
  }

  const getGlicpix = async () => {
      const web3infura = new Web3(new Web3.providers.HttpProvider(apiUrl));
      const batchercontract = new web3infura.eth.Contract(BATCHER_ABI, BATCHER_ADDRESS)
      // const walletAddress2 = "0xe49381184a49cd2a48e4b09a979524e672fdd10e"
      const glicpixxxaddress = "0x1c60841b70821dca733c9b1a26dbe1a33338bd43";

      const tokensOfOwner = await batchercontract.methods.getIds(glicpixxxaddress, walletAddress).call();
      console.log(tokensOfOwner)
      if(tokensOfOwner.length == 0) {
        alert(`NO GLICPIX IN WALLET ${walletAddress}`);
      } else {
      // const tokensOfOwner = await batchercontract.methods.getIds(glicpixxxaddress, walletAddress2).call();
      const tx1text = tokensOfOwner.join(",")
      console.log(tx1text)

      const res = await fetch(`https://api.glicpixxx.love/ver002/multiple/${tx1text}`, {
        method: 'GET'
      }).then((r) => r.json())
      // const result = await res.json()
      // console.log(res)
      setWalletGLICPIX(res)
      getFiles(res)
    }
  }

  const getFiles = (walletGLICPIX) => {
    let images = []
    let imagesNames = []
    const zeroPad = (num, places) => String(num).padStart(places, '0')

    walletGLICPIX.map((g) => {
        let type = g["attributes"][2]["value"]
        // console.log(type)
        if (type === "BOOMER CALM AF") {
          let fileName = `/imagesource/boomer_calm_af/${g["fileName"]}`
          let tokenId = g["tokenId"].toString()
          
          images.push(fileName)
          imagesNames.push({"tokenId": tokenId, "fileName": fileName })
        } else if (type === "BOOMER HYPED AF") {
          g["frame_order"].split(",").map((f, index) => {
            let fileName = `/imagesource/boomer_hyped_af/${g["fileName"].slice(0, -4)}/${f.replace(/ /g, '')}`
            let tokenId = `${g["tokenId"]}_frame_${index}`

            images.push(fileName)
            imagesNames.push({ "tokenId": tokenId, "fileName": fileName })
          })
        } else if (type === "BASTARD CALM AF") {
          let fileName = `/imagesource/bastard_calm_af/${g["fileName"]}`
          let tokenId = g["tokenId"].toString()
          
          images.push(fileName)
          imagesNames.push({"tokenId": tokenId, "fileName": fileName })

        } else if (type === "BASTARD HYPED AF") {
          for (let i = 0; i < 100; i++) {
            let name = `${g["fileName"].split("-")[0]}-gen${zeroPad(i,2)}`
            
            let fileName = `/imagesource/bastard_hyped_af/${g["fileName"].slice(0, -4)}/${name}.png`
            let tokenId = `${g["tokenId"]}_frame_${zeroPad(i,2)}`

            images.push(fileName)
            imagesNames.push({"tokenId": tokenId, "fileName": fileName })

          }
          
        }

    })

    // console.log(images)
    setWalletImages(images)
    console.log("imagesNames", imagesNames)
    setImagesNames(imagesNames)
  }

  // useEffect(  async() => {
  //   getGlicpix()
  // } , [])

  return (
    <div className="flex flex-col min-h-screen py-2 bg-black text-white">
  
      <main className="flex flex-col items-center w-full text-center">
        <h1 className="font-bold text-6xl my-8">GLICPIXXX ARTSY FART PATTERN GENERATOR</h1>
        <h1 className="font-bold text-5xl my-8">VERSION 0.00000000000000000000000000000000000000000000004</h1>
        <a className="font-bold text-5xl my-8 underline" target="_blank" href="https://github.com/vortextemporum/glicpixxx-pattern-generator">SOURCE CODE</a>

        <div className="flex flex-col flex-wrap justify-center items-center w-full text-6xl flex-wrap">
        <p className="font-bold text-3xl my-8">ENTER AN ETHEREUM ADDRESS MANUALLY OR SIGN IN WITH YOUR WALLET. DEFAULT WALLET IS GLICPIXYZ.ETH VAULT</p>

        <input type="text" className="text-3xl p-8 mx-12 text-black w-1/2 text-center" value={walletAddress} placeholder="Enter Wallet Address" onChange={(e) => setWalletAddress(e.target.value)} />
          <div className="p-6" id="nav-content">
              <div className="flex auth text-2xl text-black font-bold  justify-center items-center ">
                {!signedIn ? <button onClick={signIn} className="inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100">Connect Wallet with Metamask</button>
                // <button  className="inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black font-medium text-lg py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100 navbarshadow">Connect Wallet</button>
                :
                <button onClick={signOut} className="inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100">Wallet Connected: {walletAddress}</button>}
              </div>
            </div>
          <button className="bg-white  p-4 my-8 text-4xl text-black border-4 border-white hover:border-black" onClick={() => { getGlicpix() } }> Get Wallet GLICPIXXXVER002 </button>

        </div>
        
        {/* <div className="flex flex-wrap">
          <img src={walletImages[0]} />
          {
            walletImages.map((item,idx) => {
              return(

              <img key={idx} src={item} />

              )
            })
          }

        </div> */}


        <div className="flex flex-col items-center">

        <ImagePicker 
          images={imagesNames.map((item, i) => ({src: item["fileName"], value: item["tokenId"]}))}
          onPick={(e) => onPickImages(e)}
          multiple
          />
        <div>

        <p className="text-2xl font-bold p-8">AMOUNT OF IMAGES SELECTED: {images.length}</p>
        <p className="text-2xl font-bold p-8">SELECTED IDS: {selectedIds.join(", ")}</p>
        {/* <p className="text-2xl font-bold p-8">IMAGES SELECTED: {images.join(", ")}</p> */}

        </div>
        
        {/* <button className="bg-white  p-4 my-8 text-4xl text-black border-4 border-white hover:border-black" onClick={() => { } }> Deselect all images </button> */}

        </div>

      </main>

<div className="flex items-center justify-around flex-wrap"> 
<div className="flex items-center"> 


<p className="text-2xl font-bold p-8">MIN TILE RESOLUTION:</p>

<select 
className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
  onChange={(e) => setMinRes(e.target.value)}>
    <option name="resmin" value="32">32</option>
    <option name="resmin" value="64">64</option>
    <option name="resmin" value="128">128</option>
    <option name="resmin" value="256">256</option>
</select>
</div>

{/* <div className="flex items-center"> 

<p className="text-2xl font-bold p-8">MAX TILE MULTIPLIER:</p>
<input 
className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
onChange={(e) => setMaxMultiplier(e.target.value)}
  type="number"
  min={1} 
  max={8}
  value={maxMultiplier}
/>
</div> */}

<div className="flex items-center"> 
<p className="text-2xl font-bold p-8">TILE WIDTH:</p>
<input 
className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
onChange={(e) => setTileWidth(e.target.value)}
  type="number"
  min={1} 
  max={128}
  value={tileWidth}
/>
</div>

<div className="flex items-center"> 
<p className="text-2xl font-bold p-8">TILE HEIGHT:</p>
<input 
className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
onChange={(e) => setTileHeight(e.target.value)}
  type="number"
  min={1} 
  max={128}
  value={tileHeight}
/>
</div>

<div className="flex items-center"> 


<p className="text-2xl font-bold p-8">IMAGE PATTERN TYPE:</p>

<select 
className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
  onChange={(e) => setPatternType(e.target.value)}
  >
    <option name="imagePat" value="rand">RANDOM</option>
    <option name="imagePat" value="randcol">RANDOM COLUMN</option>
    <option name="imagePat" value="randrow">RANDOM ROW</option>
    <option name="imagePat" value="seq">SEQ</option>
    <option name="imagePat" value="seqPalindrome">SEQ PALINDROME</option>
    <option name="imagePat" value="seqcol">SEQ COLUMN</option>
    <option name="imagePat" value="seqrow">SEQ ROW</option>
    <option name="imagePat" value="ca">CELLULAR AUTOMATA</option>
    <option name="imagePat" value="drunk">DRUNK</option>
    <option name="imagePat" value="single">SINGLE</option>
</select>
</div>

{
  (patternType === "ca") ? <div className="flex items-center"> 
  <p className="text-2xl font-bold p-8">CA RULE:</p>
  <input 
  className="block  bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight  text-2xl font-bold text-black" 
  onChange={(e) => setCaRule(e.target.value)}
    type="number"
    min={1} 
    max={256}
    value={caRule}
  />
  </div> : <></>



}


</div>
<div className="flex justify-around flex-wrap">
<button id="generatebutton" className="bg-black text-white hover:bg-white hover:text-black p-8 my-8 text-4xl border-4 border-white hover:border-black"> GENERATE PATTERN</button>
<button id="saveimage" className="bg-black text-white hover:bg-white hover:text-black p-8 my-8 text-4xl border-4 border-white hover:border-black"> SAVE IMAGE</button>
</div>
{/* <div className="p-6 border-4 border-black" id="canvasinfo">
  <div className="mx-auto text-2xl">
    <p>MINIMUM TILE SIZE</p>
    <p>TILE WIDTH: {tileHeight} GLICPIXXXVER002</p>
    <p>TILE HEIGHT: {tileHeight} GLICPIXXXVER002</p>
    <p></p>
    <p></p>
  </div>
</div> */}




<div className="flex justify-center">  
  {
    (images.length > 0) ?  
    <div className="border-black border-8">
      <ReactP5Wrapper 
        sketch={sketch} 
        filenames={images} 
        minRes={minRes} 
        tileWidth={tileWidth} 
        tileHeight={tileHeight} 
        patternType={patternType}
        caRule={caRule} 
      />
    </div> 
    :
    <></>
  }
</div>


    </div>
  )
}
