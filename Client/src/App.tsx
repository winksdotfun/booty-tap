import { useState, useEffect, useRef } from "react";
import ButtonPage from "../src/assets/ButtonPage.webp";
import ZoomGirl from "../src/assets/ZoomGirl.webp";
import playbtn from "../src/assets/playbtn.png";
import ActionImage from "../src/assets/Spank.png";
import PlusoneImage from "../src/assets/One.png";
import RedImage from "../src/assets/Red.png"
// import loadingImage from "../src/assets/splashscreen.webp"; 
import Refbtn from "../src/assets/refbtn.png";
import RedhandImage from "../src/assets/redhand.png"; 
import CustomButton from "./Components/CustomButton";
import { useAccount } from 'wagmi';
import {dev} from "./Constant";
import "./App.css";
import animationimgbutt from "../src/assets/animatedimg.png";
import audio from "../src/assets/Yes_audio.mp3";
import setting from "../src/assets/settings2.png";




function App() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isReferred, setIsReferred] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isFirstImage, setIsFirstImage] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [loadingmessage, setLoadingmessage] = useState("");
  const [showRef, setShowRef] = useState(false);
  const [showSpankImage, setShowSpankImage] = useState(false);
   const [urlparms, setUrlparms] = useState("");
  const [showPlusoneImage, setShowPlusoneImage] = useState(false);
  const [showRedhandImage, setShowRedhandImage] = useState(false); 
  const [showRedImage, setShowRedImage] = useState(false);
  const [lastActionCoordinates, setLastActionCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [newImagePosition, setNewImagePosition] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [clickProgress, setClickProgress] = useState(0);
  const [code, setCode] = useState(null);
  const [Showanimationbutt, setShowanimationbutt] = useState(false);
  const [level, setLevel] = useState(1);
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [loading, setLoading] = useState(true); 
  const [progress, setProgress] = useState(0); 
  const [referralId, setReferralId] = useState("");
  
  //const levelRequirements = [100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000];

  const generateLevelRequirements = (max: number, step: number) => {
    const requirements: number[] = [];
    for (let i = 100; i <= max; i += step) {
      requirements.push(i);
    }
    return requirements;
  };

  const levelRequirements = generateLevelRequirements(100000000, 2000);

    const { isConnected } = useAccount();  
    const account = useAccount();
    const fetchedaddress = account.address;

    useEffect(() => {
      const duration = 4000; // Total duration in milliseconds (4 seconds)
      const interval = 100; // Smaller interval for smoother progress
      const steps = duration / interval; // Total number of increments
      const increment = 200 / steps; // Progress increment per interval (ensures it reaches 100%)
      
      
      const loadingInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + increment;
          
          // Display messages at specific progress points
          if (newProgress >= 0 && newProgress < 35) {
            setLoadingmessage("Tap that booty and collect SPANKS points");
          } else if (newProgress >= 35 && newProgress < 70) {
            setLoadingmessage("Refer friends to earn more points ");
          } else if (newProgress >= 70) {
            setLoadingmessage(" Connect your crypto wallet for rewards");
          }
  
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, interval * 2);
  
      const finishLoading = setTimeout(() => {
        setLoading(false);
        setProgress(100); // Ensure progress is exactly 100 at the end
        setMessage("Complete!"); // Final message
      }, duration);
      return () => {
        clearTimeout(finishLoading);
        clearInterval(loadingInterval);
      };
    }, []);
  
    const handlemeterClick = () => {
      setClickProgress((prev) => {
        const newProgress = prev + 1;
        console.log(newProgress);

        return newProgress >= 100 ? 0 : newProgress; // Reset to 0 if it reaches 100
      });
    };
 
 

useEffect(() => {
   
  if (isConnected) {
    setIsWalletConnected(true);
    setAddress(fetchedaddress);
  } else {
    setIsWalletConnected(false);
    setAddress(undefined);
    setShowRef(false);
  }

}, [isConnected]);

//   useEffect(() => {
//     checkIfWalletIsConnected();
    
// }, []);


useEffect(() => {
  const currentUrl = window.location.href;
  const equalSignIndex = currentUrl.indexOf('=');

  if (equalSignIndex !== -1) {
    const valueAfterEqual = currentUrl.substring(equalSignIndex + 1);
    console.log("Value after '=':", valueAfterEqual);
    setUrlparms(valueAfterEqual); 
  } else {
    console.log("No '=' found in the URL.");
  }
}, []); 


useEffect(() => {
  console.log("Updated urlparms in useEffect:", urlparms);
}, [urlparms]);

useEffect(() => {
  console.log("Updated clickProgress in useEffect:", clickProgress);
}, [clickProgress]);


useEffect(() => {
  const fetchUserData = async () => {
    if (isConnected && address) {
      try {
        console.log("Using referralCode:", urlparms);
        const referralCode = urlparms;

        const response = await fetch(`${dev}/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address, referralCode }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("data",data);
        setUserData(data);

        setScore(data.score ?? 0);
        setLevel(data.level ?? 1);
        setClickProgress(data.levelbar ?? 0);
        setCode(data.referralCode ?? 'varala da');
        
        // Check if referredBy exists and update the state
        console.log("+++",data);
        if (data.referredBy) {
          setIsReferred(false);
        } else {
          setIsReferred(true);
        }

        console.log(userData);
      } catch (error:any) {
        console.log("Error fetching user data:", error.message);
      }
    }
  };

  fetchUserData();
}, [isConnected, address, urlparms]);


const handleOpenPopup = () => setShowPopup(true); // Open popup
const handleClosePopup = () => setShowPopup(false); // Close popup

const handleRefSubmit = async () => {
  if (referralId.trim() === "") {
    alert("Please enter a referral ID.");
    return;
  }

  try {
    const response = await fetch(`${dev}/api/user/update-referred-by`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralId, address: address }), // Send referralId and user's address
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Referral ID submitted successfully:", data.message);
      setScore((prevScore) => prevScore + 69);
    } else {
      console.error("Error submitting referral ID:", data.error);
    }
  } catch (error) {
    console.error("Network error while submitting referral ID:", error);
  } finally {
    handleClosePopup(); // Close popup after submission
  }
};



  useEffect(() => {
    let intervalId:any;

    if (isConnected && address) {
      intervalId = setInterval(() => {
        updateUserData();
      }, 3000); 
    }

  
    return () => clearInterval(intervalId); 

  }, [isConnected, address, score, level, clickProgress]);

  useEffect(() => {
    if (score >= 15) {
        setShowRef(true);
        console.log("showRef=", true); // Logging after setting showRef
    }
}, [score]);


  const updateUserData = async () => {
    if (isConnected && address) {
      const data = { address, score, level, levelbar:clickProgress };
      console.log(data);
      console.log('Updating Data to DB');
      try {
        const response = await fetch(`${dev}/api/user/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update user data');
        }

        console.log('User data updated successfully');
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  };


  const handleClick = () => {
    if (isWalletConnected && imageRef.current) {
      setIsVisible(false);
    } else {
      setMessage("Please connect your wallet");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1000);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log("coords",x,y);
      console.log("coords",coordinates);
      setCoordinates({ x, y });
      checkActionArea(x, y);
    }
  };

  const checkActionArea = (x: number, y: number) => {
    const actionAreas = [{ id: "area1", x: 153, y: 322, width: 223, height: 105 }];
    actionAreas.forEach(area => {
      if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
        handleAction(area.id, x, y);
      }
    });
  };

  useEffect(() => {
    if (level - 1 < levelRequirements.length && score >= levelRequirements[level - 1]) {
      setLevel(prevLevel => {
        const nextLevel = prevLevel + 1;
        displayRedhandImage(); // Your custom function to display the image
        return nextLevel;
      });
    }
  }, [score, levelRequirements, level]);

  const displayActionImage = () => {
    setShowanimationbutt(true);
    setShowSpankImage(true);
    setShowPlusoneImage(true);
    setShowRedImage(true);
    setTimeout(() => {
      setShowanimationbutt(false);
      setShowSpankImage(false);
      setShowPlusoneImage(false);
      setShowRedImage(false);
    }, 600);
  };

  const displayRedhandImage = () => {
    setTimeout(() => {
      setShowRedhandImage(true); 
      setTimeout(() => setShowRedhandImage(false), 1000); 
    }, 600); 
  };

  const handleAction = (areaId: string, x: number, y: number) => {
    if (areaId === "area1") {
      setLastActionCoordinates({ x, y });
      const audios = new Audio(audio);
      audios.play();
      displayActionImage();
      handlemeterClick();
      setNewImagePosition({ x: 250, y: 300 });
      setScore(prevScore => prevScore + 1);
      if (score >= 15) {
        setShowRef(true);
        console.log("showref=",showRef);
    }
    }
  };

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setIsFirstImage(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  let progressElement = document.querySelector('.progress') as HTMLElement | null;
let width = 0;

function animateProgress() {
  if (progressElement) { 
    if (width < 100) {
      width += 25;
      progressElement.style.width = width + '%';
      requestAnimationFrame(animateProgress);
    }
  }
}

animateProgress();

const handleShare = () => {
  const referralUrl = `https://spank-pi.vercel.app/`;
  const tweetText = `Join the fun in this exciting spank game! Use my referral ID: ${code} to get rewards 🎮✨. Play here: ${referralUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(twitterUrl, "_blank"); // Open in a new tab
};

// const handleReferClickk = async () => {
//   try {
    
//     const referralUrl = `https://x.com/Sunil_0881/status/1855179504919945397`;
                       
    
    
//     shareReferralLink(referralUrl);
    
//   } catch (error) {
//     console.error('Error fetching referral code:', error);
//   }
// };

// const shareReferralLink = (shareLink:any) => {
  
//   const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`;

  
//   const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
  


//   if (navigator.share) {
//     navigator.share({
//       title: 'Check out this referral link!',
//       url: shareLink,
//     }).then(() => {
//       console.log('Referral link shared successfully');
//     }).catch((error) => {
//       console.error('Error sharing:', error);
      
//       window.open(whatsappUrl, '_blank');
//     });
//   } else {
    
//     const userChoice = window.confirm('Share on WhatsApp? Click OK to share on WhatsApp, Cancel to open in a new tab.');
//     if (userChoice) {
//       window.open(whatsappUrl, '_blank');
//     } else {
//       window.open(facebookUrl, '_blank'); 
//     }
//   }
// };

  
 

  return (
    <div className="relative flex items-center justify-center h-screen bg-black ">
    
      <div className="relative w-[1000px] h-[1000px] flex items-center justify-center">
      {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
            <img
              src={ButtonPage}
              loading="lazy"
              alt="Loading"
              style={{ width: "514px", height: "515px" }}
              className="absolute"
            />    
         
             <div className=" text-md font-bold text-red-500 z-30 mt-52 w-60 text-center duration-[1000ms]" style={{ textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff" }}>
                      {loadingmessage}
             </div>
             <div className="relative w-4/5  mt-4 ">
  {/* Loading Bar */}
  <div className="flex justify-center">
  <div className="h-3 w-4/5  bg-white rounded-md ring-4 ring-white overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-[1000ms] ease-in-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
  </div>

  {/* Loading Text */}
  <div
    className="mt-1 text-red-500 text-lg font-bold text-center"
    style={{
      textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff"
    }}
  >
    LOADING...
  </div>
</div>

                   
          </div>
        )}

        <img
          ref={imageRef}
          src={isFirstImage ? ButtonPage : ZoomGirl}
          loading="lazy"
          alt="MainImage"
          onClick={isFirstImage ? handleImageClick : handleImageClick}
          className={`${isFirstImage ? "object-cover w-full h-full" : "object-contain"}`}
          style={isFirstImage ? {width: "514px", height: "515px"} : { width: "515px", height: "515px" }}
        />
       
        {isVisible && (
          <img
            src={playbtn}
            loading="lazy"
            alt="playbtn"
            onClick={handleClick}
            className="absolute w-16 h-24 object-cover z-20 cursor-pointer  transition-opacity duration-700 ease-out "
            style={{ right: "190px", bottom:"119px" }}
          />
        )}
        {isFirstImage && (
          <div className="absolute">
            {/* <ConnectButton /> */}
              <CustomButton /> 
           {/* {!isWalletConnected ? (
                <button onClick={connectWallet} type="button" className="">
                  <img src={walletlogo} alt="playbtn"
                    className="absolute w-12 h-20 object-cover z-36 cursor-pointer  transition-opacity duration-700 ease-out  left-48"
                    style={{  top: '142px', width: '', height: '' }} />
                </button>
            ) : (
              <div>
             
              <button onClick={disconnectWallet}  className=""> 
              <img src={disconnectwlt} alt="playbtn"
                    className="absolute w-12 h-20 object-cover z-36 cursor-pointer  transition-opacity duration-700 ease-out  left-48"
                    style={{  top: '142px', width: '', height: '' }} />
              </button>
          </div>
      )} */}
          </div>
        )}
        {showSpankImage && lastActionCoordinates && (
          <img
            src={ActionImage}
            loading="lazy"
            alt="Action"
            className="absolute action-image z-30"
            style={{ left: '235px', top: '300px', width: '140px', height: '140px' }}
          />
        )}
       
          {showPlusoneImage && newImagePosition && (
            <img
              src={PlusoneImage}
              loading="lazy"
              alt="New Action"
              className={`new-action-image z-30 ${showPlusoneImage ? "show" : "hide"}`}
              style={{
                position: 'absolute', 
                left:"143px", 
                top: "40px", 
                width: '30px', 
                height: '80px', 
          }}
          />
          )}

          {Showanimationbutt && (
         
         <img
           src={animationimgbutt}
           loading="lazy"
           alt="Level Up"
           className="absolute w-fit  "
           style={{ left: '123px', width: '290px', height: '490px',bottom:'24px' }}
         />
       
         )}

         {showRedImage && (
          <img
            src={RedImage}
            loading="lazy"
            alt="red "
            className="absolute "
            style={{ left: '235px', top: '300px', width: '140px', height: '140px' }}
          />
        )}
        {showRedhandImage && (
         
          <img
            src={RedhandImage}
            loading="lazy"
            alt="Level Up"
            className="absolute w-fit fade-in-levelup level-up-animation slowFadeInOut "
            style={{ left: '235px', top: '300px', width: '140px', height: '140px' }}
          />
        
        )}
       {!isFirstImage && (
       <div
       className={`absolute z-20 fade-in ${
         score > 10000 ? "text-xl mt-1" : "text-3xl"
       }`}
       style={{
         top: "26px",
         right: "35px",
         background: "linear-gradient(to bottom, rgba(255, 75, 108, 100), rgba(255, 151, 114, 100))",
         WebkitBackgroundClip: "text",
         color: "transparent",
         transition: "color 0.5s ease-in-out",
       }}
     >
       {score}
     </div>
     
      )}

      {!isFirstImage && (
        <div 
          className="absolute text-2xl z-20 font-bold fade-in" 
          style={{ 
            top: "36px", 
            left: "73px", 
            background: "linear-gradient(to bottom,  rgba(255, 75, 108, 100), rgba(255, 151, 114, 10))", 
            WebkitBackgroundClip: "text", 
            color: "transparent", 
            transition: "color 0.5s ease-in-out", 
          }}>
          {level}
        </div>
      )}
{!isFirstImage && (
  <div className="z-20 absolute top-4 left-6">
    <div className="progress-meter-container ">
      <div className="progress-bar" style={{ width: `${clickProgress}%` }}></div>
      <p className="invisible-dots">...................................</p> {/* Invisible dots */}
    </div>
  </div>
)}

        {showMessage && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white text-black p-1 rounded shadow-md z-20">
            {message}
          </div>
        )}
          {showRef && (
        <button 
          onClick={handleShare}
          className="absolute z-30 bottom-4 left-5">
          <img
            src={Refbtn}
            loading="lazy"
            alt="Ref btn"
            className="blinking"
            style={{ width: '65px', height: '65px' }}
          />
        </button>
      )}

{showRef && (
  <button 
    onClick={handleShare}
    className="absolute z-30 bottom-4 left-5">
    <img
      src={Refbtn}
      loading="lazy"
      alt="Ref btn"
      className="blinking"
      style={{ width: '65px', height: '65px' }}
    />
  </button>
)}

          {  isWalletConnected && isReferred && ( 
            <button  className=" absolute  z-30 bottom-7 right-6">
               <img
            src={setting}
            loading="lazy"
            alt="Ref btn"
             onClick={handleOpenPopup}
             style={{  width: '40px', height: '40px' }}
          />
            </button> 
        )} 

{showPopup && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-sky-400 p-6 rounded-lg shadow-xl w-80 z-50 border border-gray-300">
      <h2 className="text-lg font-bold mb-4 text-white">Enter Referral ID</h2>
      <input
        type="text"
        value={referralId}
        onChange={(e) => setReferralId(e.target.value)}
        placeholder="Your Referral ID"
        className="border border-gray-300 rounded w-full px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300 text-gray-900 placeholder-gray-500"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={handleClosePopup}
          className="bg-gray-400 text-gray-900 px-4 py-2 rounded hover:bg-gray-500 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Cancel
        </button>
        <button
          onClick={handleRefSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring focus:ring-blue-400"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
}

export default App;
