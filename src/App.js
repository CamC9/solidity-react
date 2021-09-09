import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abiFile from "./utils/EmojiPortal.json"

export default function App() {
	const [currAccount, setCurrentAccount] = React.useState("")
	const contractAddress = "0x6363f437a043B95BEba4d0Ca680927640BeaFF31"
	const contractABI = abiFile.abi

	const checkIfWalletIsConnected = () => {
		
		// Make sure to be able to access window.ethereum
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Please make sure you have metamask intalled!")
			return
		} else {
			console.log("We have obtained the ethereum object", ethereum)
		}

		// Check if we are authorized to access the user's wallet
		ethereum.request({ method: 'eth_accounts' })
		.then(accounts => {
			// Check for multiple accounts and grab the first one
			if(accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account: ", account)

				// Store the user's public wallet address for later
				setCurrentAccount(account);
			} else {
				console.log("No authorized account found")
			}
		})
	}

	const connectWallet = () => {
		const { ethereum } = window;
		if (!ethereum) {
			alert("Intall metamask!")
		}

		ethereum.request({ method: 'eth_requestAccounts' })
		.then(accounts => {
			console.log("Connected", accounts[0])
			setCurrentAccount(accounts[0])
		})
		.catch(err => console.log(err));
	}

	const sendEmoji = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner()
		const emojiportalContract = new ethers.Contract(contractAddress, contractABI, signer);

		let totalCount = await emojiportalContract.getTotalEmojis()
		console.log("Retreived total emoji count...", totalCount.toNumber())

		const emojiTxn = await emojiportalContract.sendEmoji("this is a message")
		console.log("Mining...", emojiTxn.hash)
		await emojiTxn.wait()
		console.log("Mined! -- ", emojiTxn.hash)

		totalCount = await emojiportalContract.getTotalEmojis()
		console.log("Retrieved total emoji count...", totalCount.toNumber())
	}

	const [allEmojis, setAllEmojis] = React.useState([])
	async function getAllSentEmojis() {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner()
		const emojiportalContract = new ethers.Contract(contractAddress, contractABI, signer);

		let emojis = await emojiportalContract.getAllSentEmojis()

		let emojisCleaned = []
		emojis.forEach(emoji => {
			emojisCleaned.push({
				address: emoji.address,
				timestamp: new Date(emoji.timestamp * 1000),
				message: emoji.message
			})
		})

		setAllEmojis(emojisCleaned)
	}

	React.useEffect(() => {
		checkIfWalletIsConnected()
	}, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        😎 Hey there!
        </div>

        <div className="bio">
        Connect your Ethereum wallet and send emojis!
        </div>

				{currAccount ? null : (
					<button className="emojiButton" onClick={connectWallet}> Connect Wallet </button>
				)}

        <button className="emojiButton" onClick={sendEmoji}> 🟥 </button>
				<button className="emojiButton" onClick={sendEmoji}> 🟧 </button>
				<button className="emojiButton" onClick={sendEmoji}> 🟨 </button>
				<button className="emojiButton" onClick={sendEmoji}> 🟩 </button>
				<button className="emojiButton" onClick={sendEmoji}> 🟦 </button>
				<button className="emojiButton" onClick={sendEmoji}> 🟪 </button>

				{allEmojis.map((emoji, index) => {
					return (
						<div style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
							<div>Address: {emoji.address}</div>
							<div>Time: {emoji.timestamp.toString()}</div>
							<div>Message: {emoji.message}</div>
						</div>
					)
				})}
      </div>
    </div>
  );
}
